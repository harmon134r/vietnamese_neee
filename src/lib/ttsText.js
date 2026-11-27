/**
 * Pure zero-dependency shared TTS text normalization, sentence splitting,
 * deterministic random voice selection, and SHA-256 Supabase cache-path computation.
 *
 * Designed to run identically in browsers, Vite/Vitest (jsdom), Node.js scripts,
 * and Vercel Serverless Functions (`api/tts.js`).
 */

export const NORTHERN_VOICE_IDS = Object.freeze([
  "ngochuyen",
  "trucly",
  "maianh",
  "haidang",
  "thienminh",
]);

const TINY_FRAGMENT_CHARS = 18;

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

/**
 * Normalize Vietnamese TTS input text: Unicode NFC, collapsed single spaces, trimmed.
 * @param {string} text
 * @returns {string}
 */
export function normalizeTtsText(text) {
  return String(text || "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Deterministically pick one of the 5 Northern Vietnamese voices from normalized text
 * using FNV-1a 32-bit hashing modulo 5.
 *
 * @param {string} text
 * @returns {"ngochuyen" | "trucly" | "maianh" | "haidang" | "thienminh"}
 */
export function pickRandomVoiceForText(text) {
  const normalized = normalizeTtsText(text);
  if (!normalized) return NORTHERN_VOICE_IDS[0];
  let hash = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i += 1) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return NORTHERN_VOICE_IDS[hash % NORTHERN_VOICE_IDS.length];
}

/**
 * Choose adaptive `max_new_frames` for VieNeu-TTS-v3-Turbo based on normalized text length
 * for fast generation on short phrases & split sentences without cutting off audio.
 *
 * @param {string} text
 * @returns {number}
 */
export function adaptiveMaxFrames(text) {
  const len = normalizeTtsText(text).length;
  if (len <= 25) return 100;
  if (len <= 75) return 170;
  if (len <= 140) return 250;
  return 340;
}

/**
 * Softly split an oversized sentence (> maxSentenceChars) at clause punctuation
 * (`, `, `; `, ` — `, `: `) or word boundaries while avoiding tiny trailing orphans.
 *
 * @param {string} chunk
 * @param {number} maxSentenceChars
 * @returns {string[]}
 */
function splitOversizedChunk(chunk, maxSentenceChars) {
  const parts = [];
  let remaining = chunk.trim();

  while (remaining.length > maxSentenceChars) {
    // Avoid leaving a tiny orphan tail when a slightly earlier balanced break exists
    const searchLimit =
      remaining.length <= maxSentenceChars + TINY_FRAGMENT_CHARS * 2
        ? Math.max(Math.floor(maxSentenceChars * 0.55), Math.ceil(remaining.length * 0.58))
        : maxSentenceChars;

    const slice = remaining.slice(0, searchLimit);
    const minBreak = Math.floor(maxSentenceChars * 0.3);

    const commaIdx = slice.lastIndexOf(", ");
    const semiIdx = slice.lastIndexOf("; ");
    const colonIdx = slice.lastIndexOf(": ");
    const emDashIdx = slice.lastIndexOf(" — ");

    let breakAt = -1;
    let bestDelimEnd = -1;

    if (commaIdx > minBreak) {
      bestDelimEnd = Math.max(bestDelimEnd, commaIdx + 1);
    }
    if (semiIdx > minBreak) {
      bestDelimEnd = Math.max(bestDelimEnd, semiIdx + 1);
    }
    if (colonIdx > minBreak) {
      bestDelimEnd = Math.max(bestDelimEnd, colonIdx + 1);
    }
    if (emDashIdx > minBreak) {
      bestDelimEnd = Math.max(bestDelimEnd, emDashIdx + 2);
    }

    if (bestDelimEnd > 0) {
      breakAt = bestDelimEnd;
    } else {
      const spaceIdx = slice.lastIndexOf(" ");
      if (spaceIdx > 0) {
        breakAt = spaceIdx;
      } else {
        const widerSpace = remaining.slice(0, maxSentenceChars).lastIndexOf(" ");
        breakAt = widerSpace > 0 ? widerSpace : maxSentenceChars;
      }
    }

    const head = remaining.slice(0, breakAt).trim();
    if (head) parts.push(head);
    remaining = remaining.slice(breakAt).trim();
  }

  if (remaining) {
    if (
      parts.length > 0 &&
      remaining.length < TINY_FRAGMENT_CHARS &&
      parts[parts.length - 1].length + 1 + remaining.length <= maxSentenceChars
    ) {
      parts[parts.length - 1] = `${parts[parts.length - 1]} ${remaining}`;
    } else {
      parts.push(remaining);
    }
  }

  return parts;
}

/**
 * Split multi-sentence Vietnamese passages into clean, natural TTS units for
 * low-latency pipelined playback while keeping short phrases & single sentences intact.
 *
 * @param {string} text
 * @param {{ minMultiChars?: number, maxSentenceChars?: number }} [options={}]
 * @returns {string[]}
 */
export function splitVietnameseSentences(
  text,
  { minMultiChars = 110, maxSentenceChars = 160 } = {}
) {
  const normalized = normalizeTtsText(text);
  if (!normalized) return [];

  if (normalized.length <= minMultiChars) {
    return [normalized];
  }

  const rawSentences = normalized
    .split(/(?<=[.!?…]["”’')\]»]?)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (rawSentences.length <= 1) {
    return [normalized];
  }

  // Merge tiny fragments (< 18 chars, e.g. "Chào bạn!") with an adjacent sentence
  const merged = [];
  const pending = [...rawSentences];
  for (let i = 0; i < pending.length; i += 1) {
    const piece = pending[i];
    if (!piece) continue;

    if (piece.length < TINY_FRAGMENT_CHARS) {
      const hasPrev = merged.length > 0;
      const hasNext = i + 1 < pending.length;
      if (
        hasPrev &&
        (merged[merged.length - 1].length + 1 + piece.length <= maxSentenceChars || !hasNext)
      ) {
        merged[merged.length - 1] = `${merged[merged.length - 1]} ${piece}`;
        continue;
      }
      if (hasNext) {
        pending[i + 1] = `${piece} ${pending[i + 1]}`;
        continue;
      }
    }
    merged.push(piece);
  }

  const result = [];
  for (const chunk of merged) {
    if (chunk.length <= maxSentenceChars) {
      result.push(chunk);
    } else {
      result.push(...splitOversizedChunk(chunk, maxSentenceChars));
    }
  }

  return result.length > 0 ? result : [normalized];
}

function encodeUtf8(str) {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(str);
  }
  const bytes = [];
  for (let i = 0; i < str.length; i += 1) {
    let code = str.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const next = str.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = ((code - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
        i += 1;
      }
    }
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    }
  }
  return new Uint8Array(bytes);
}

function rotr(value, bits) {
  return ((value >>> bits) | (value << (32 - bits))) >>> 0;
}

/**
 * Pure-JS FIPS 180-4 SHA-256 fallback for environments where `crypto.subtle`
 * is unavailable (e.g. non-secure HTTP origins or minimal jsdom runtimes).
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function sha256HexSync(input) {
  const bytes = input instanceof Uint8Array ? input : encodeUtf8(String(input ?? ""));
  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  const highBits = Math.floor(bitLen / 0x100000000);
  const lowBits = bitLen >>> 0;
  view.setUint32(paddedLen - 8, highBits, false);
  view.setUint32(paddedLen - 4, lowBits, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = (rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)) >>> 0;
      const s1 = (rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10)) >>> 0;
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i += 1) {
      const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((word) => word.toString(16).padStart(8, "0"))
    .join("");
}

/**
 * Compute lowercase hexadecimal SHA-256 digest of a UTF-8 string.
 * Uses native Web Crypto (`globalThis.crypto.subtle`) when available,
 * falling back cleanly to pure-JS SHA-256 everywhere else.
 *
 * @param {string} input
 * @returns {Promise<string>}
 */
export async function sha256Hex(input) {
  const str = String(input ?? "");
  const subtle = globalThis?.crypto?.subtle;
  if (subtle && typeof subtle.digest === "function") {
    try {
      const bytes = encodeUtf8(str);
      const digest = await subtle.digest("SHA-256", bytes);
      const out = new Uint8Array(digest);
      let hex = "";
      for (let i = 0; i < out.length; i += 1) {
        hex += out[i].toString(16).padStart(2, "0");
      }
      return hex;
    } catch {
      // Fall through to pure-JS SHA-256
    }
  }
  return sha256HexSync(str);
}

/**
 * Compute the deterministic Supabase Storage `tts-cache` object path
 * (`v1/<voiceId>/<sha256>.wav`) matching `api/tts.js` `computeCachePath` identically.
 *
 * @param {string} voiceId
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function computeTtsCachePath(voiceId, text) {
  const normalized = normalizeTtsText(text);
  const rawVoice = String(voiceId || "").trim().toLowerCase();
  const effectiveVoice =
    rawVoice === "random"
      ? pickRandomVoiceForText(normalized)
      : NORTHERN_VOICE_IDS.includes(rawVoice)
        ? rawVoice
        : NORTHERN_VOICE_IDS[0];
  const hash = await sha256Hex(`${effectiveVoice}::${normalized}`);
  return `v1/${effectiveVoice}/${hash}.wav`;
}
