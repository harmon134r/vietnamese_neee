import crypto from "node:crypto";
import WebSocket from "ws";

const MAX_CHUNK_LENGTH = 200;
const MAX_TOTAL_LENGTH = 1000;
const EDGE_TIMEOUT_MS = 7500;
const GOOGLE_TIMEOUT_MS = 6500;

const EDGE_TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const EDGE_WSS_URL =
  "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";
const EDGE_CHROMIUM_FULL_VERSION = "143.0.3650.96";
const EDGE_CHROMIUM_MAJOR_VERSION = EDGE_CHROMIUM_FULL_VERSION.split(".")[0];
const EDGE_SEC_MS_GEC_VERSION = `2-${EDGE_CHROMIUM_FULL_VERSION}`;
const EDGE_OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";
const EDGE_COPYRIGHT = "Copyright (C) Microsoft Corporation. All rights reserved.";

const EDGE_USER_AGENT = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${EDGE_CHROMIUM_MAJOR_VERSION}.0.0.0 Safari/537.36 Edg/${EDGE_CHROMIUM_MAJOR_VERSION}.0.0.0`;
const GOOGLE_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const LANG_PATTERN = /^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$/;

const VIETNAMESE_EDGE_VOICES = Object.freeze({
  hoaimy: Object.freeze({
    id: "hoaimy",
    edgeName: "vi-VN-HoaiMyNeural",
    locale: "vi-VN",
  }),
  namminh: Object.freeze({
    id: "namminh",
    edgeName: "vi-VN-NamMinhNeural",
    locale: "vi-VN",
  }),
});

const ENGLISH_EDGE_VOICES = Object.freeze({
  hoaimy: Object.freeze({
    id: "hoaimy",
    edgeName: "en-US-AriaNeural",
    locale: "en-US",
  }),
  namminh: Object.freeze({
    id: "namminh",
    edgeName: "en-US-GuyNeural",
    locale: "en-US",
  }),
});

// CS64 constants for Microsoft Edge Sec-MS-GEC v2 token
const SWAP_FIRST_WORD = {
  swappedWord: 0xef0569fb,
  swappedSum: 0x76f50f34,
  swappedProduct: 0xc3efea97,
};
const SWAP_SECOND_WORD = {
  swappedWord: 0xc31713db,
  swappedSum: 0x1881ce3c,
  swappedProduct: 0x35bd1ec9,
};
const MIX_FIRST_WORD = [0xcf98b111, 0x87085b9f, 0x12ceb96d, 0x257e1d83];
const MIX_SECOND_WORD = [0xa27416f5, 0xd38396ff, 0x7c932b89, 0xbfa49f69];

let edgeClockOffsetMs = 0;

/**
 * Normalize a BCP-47 language code to the target language code.
 * @param {string | undefined} rawLang
 * @returns {string}
 */
export function normalizeLang(rawLang) {
  if (!rawLang || typeof rawLang !== "string") return "vi";
  const trimmed = rawLang.trim();
  if (!LANG_PATTERN.test(trimmed)) return "vi";
  const lower = trimmed.toLowerCase();
  if (lower === "vi-vn" || lower === "vn") return "vi";
  if (lower.startsWith("en-")) return "en";
  return lower;
}

/**
 * Normalize a requested voice parameter into `'hoaimy' | 'namminh'`.
 * @param {string | undefined} rawVoice
 * @returns {"hoaimy" | "namminh"}
 */
export function normalizeVoice(rawVoice) {
  if (!rawVoice || typeof rawVoice !== "string") return "hoaimy";
  const lower = rawVoice.trim().toLowerCase();
  if (
    lower === "namminh" ||
    lower === "vi-vn-namminhneural" ||
    lower === "male" ||
    lower === "nam"
  ) {
    return "namminh";
  }
  return "hoaimy";
}

/**
 * Resolve Microsoft Edge Neural voice metadata for a normalized language & voice id.
 * Returns null if the language should fall back directly to Google Translate TTS.
 * @param {string} lang
 * @param {string | undefined} rawVoice
 * @returns {{ id: string, edgeName: string, locale: string } | null}
 */
export function resolveEdgeVoice(lang, rawVoice) {
  const voiceId = normalizeVoice(rawVoice);
  if (lang === "vi") {
    return VIETNAMESE_EDGE_VOICES[voiceId] || VIETNAMESE_EDGE_VOICES.hoaimy;
  }
  if (lang === "en") {
    return ENGLISH_EDGE_VOICES[voiceId] || ENGLISH_EDGE_VOICES.hoaimy;
  }
  return null;
}

/**
 * Clamp requested playback speed into Google Translate TTS `ttsspeed` parameter.
 * Google Translate TTS supports slow (~0.24-0.5) and normal (1).
 * @param {string | number | undefined} rawSpeed
 * @returns {number}
 */
export function normalizeSpeed(rawSpeed) {
  const parsed = Number(rawSpeed);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  if (parsed < 0.7) return 0.24;
  if (parsed < 0.9) return 0.5;
  return 1;
}

/**
 * Convert numeric speed (`0.6..1.5`, default `1.0`) into Microsoft Edge SSML
 * prosody rate percentage (e.g., `0.75` -> `"-25%"`, `1.0` -> `"+0%"`, `1.15` -> `"+15%"`).
 * @param {string | number | undefined} rawSpeed
 * @returns {string}
 */
export function speedToEdgeRate(rawSpeed) {
  const parsed = Number(rawSpeed);
  if (!Number.isFinite(parsed) || parsed <= 0) return "+0%";
  const clamped = Math.min(1.5, Math.max(0.6, parsed));
  const deltaPercent = Math.round((clamped - 1) * 100);
  if (deltaPercent === 0) return "+0%";
  return deltaPercent > 0 ? `+${deltaPercent}%` : `${deltaPercent}%`;
}

/**
 * Split text cleanly into chunks of at most `maxLen` characters, preferring
 * sentence punctuation, clause boundaries, and word boundaries.
 * @param {string} input
 * @param {number} [maxLen=200]
 * @returns {string[]}
 */
export function splitTextIntoChunks(input, maxLen = MAX_CHUNK_LENGTH) {
  const cleaned = String(input || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return [];
  if (cleaned.length <= maxLen) return [cleaned];

  const chunks = [];
  let remaining = cleaned;

  while (remaining.length > maxLen) {
    const slice = remaining.slice(0, maxLen);

    // 1. Prefer breaking at sentence punctuation (. ! ? …)
    let breakAt = Math.max(
      slice.lastIndexOf(". "),
      slice.lastIndexOf("! "),
      slice.lastIndexOf("? "),
      slice.lastIndexOf("… ")
    );
    if (breakAt > Math.floor(maxLen * 0.35)) {
      breakAt += 1; // keep punctuation with chunk
    } else {
      // 2. Next prefer clause punctuation (, ; : — -)
      breakAt = Math.max(
        slice.lastIndexOf(", "),
        slice.lastIndexOf("; "),
        slice.lastIndexOf(": ")
      );
      if (breakAt > Math.floor(maxLen * 0.35)) {
        breakAt += 1;
      } else {
        // 3. Fall back to last space
        breakAt = slice.lastIndexOf(" ");
        if (breakAt <= 0) {
          breakAt = maxLen;
        }
      }
    }

    const piece = remaining.slice(0, breakAt).trim();
    if (piece) chunks.push(piece);
    remaining = remaining.slice(breakAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

function swapHalves(value) {
  return ((value << 16) | (value >>> 16)) >>> 0;
}

function swapTerm(word, key, multipliers) {
  const sum =
    (Math.imul(word, key) + Math.imul(swapHalves(word), multipliers.swappedWord)) >>> 0;
  const product = Math.imul(swapHalves(sum), multipliers.swappedSum) >>> 0;
  return (Math.imul(swapHalves(product), multipliers.swappedProduct) + product) >>> 0;
}

function swapAndMultiply(value, multipliers) {
  let result = value >>> 0;
  for (const multiplier of multipliers) {
    result = Math.imul(swapHalves(result), multiplier) >>> 0;
  }
  return result;
}

function computeCs64(messageBytes, sha256Bytes) {
  const digestView = new DataView(
    sha256Bytes.buffer,
    sha256Bytes.byteOffset,
    sha256Bytes.byteLength
  );
  const firstKey = (digestView.getUint32(0, true) | 1) >>> 0;
  const secondKey = (digestView.getUint32(4, true) | 1) >>> 0;

  const padded = new Uint8Array(Math.ceil(messageBytes.length / 8) * 8);
  padded.set(messageBytes);
  const words = new DataView(padded.buffer);

  let swapSum = 0;
  let lastSwap = 0;
  let mix = 0;
  let mixSum = 0;

  for (let offset = 0; offset < padded.length; offset += 8) {
    const firstWord = words.getUint32(offset, true);
    const secondWord = words.getUint32(offset + 4, true);

    const firstSwap = swapTerm(firstWord, firstKey, SWAP_FIRST_WORD);
    lastSwap = swapTerm(secondWord, secondKey, SWAP_SECOND_WORD);
    swapSum = (swapSum + firstSwap + lastSwap) >>> 0;

    mix = swapAndMultiply(Math.imul((mix + firstWord) >>> 0, firstKey), MIX_FIRST_WORD);
    mixSum = (mixSum + mix) >>> 0;
    mix = swapAndMultiply(Math.imul((mix + secondWord) >>> 0, secondKey), MIX_SECOND_WORD);
    mixSum = (mixSum + mix) >>> 0;
  }

  const checksum = Buffer.allocUnsafe(8);
  checksum.writeUInt32LE((lastSwap ^ mix) >>> 0, 0);
  checksum.writeUInt32LE((swapSum ^ mixSum) >>> 0, 4);
  return checksum;
}

/**
 * Generate Microsoft Edge `Sec-MS-GEC` v2 authentication token (`<16 hex>-<64 hex>`).
 * @param {number} [nowMs=Date.now()]
 * @returns {string}
 */
export function generateSecMsGecV2(nowMs = Date.now() + edgeClockOffsetMs) {
  const ticksSec = Math.floor(nowMs / 1000) + 11644473600;
  const roundedSec = ticksSec - (ticksSec % 300);
  const windowsTicks = roundedSec * 10000000;
  const message = Buffer.from(
    `${EDGE_COPYRIGHT}${windowsTicks}${EDGE_TRUSTED_CLIENT_TOKEN}`,
    "utf8"
  );
  const digest = crypto.createHash("sha256").update(message).digest();
  const cs64 = computeCs64(message, digest);
  return `${cs64.toString("hex").toUpperCase()}-${digest.toString("hex").toUpperCase()}`;
}

function escapeXmlText(text) {
  return String(text || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Build Edge Neural SSML payload for a voice and prosody rate.
 * @param {string} text
 * @param {{ edgeName: string, locale: string }} edgeVoice
 * @param {string} edgeRate
 * @returns {string}
 */
export function buildEdgeSsml(text, edgeVoice, edgeRate = "+0%") {
  const safeText = escapeXmlText(text);
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${edgeVoice.locale}"><voice name="${edgeVoice.edgeName}"><prosody pitch="+0Hz" rate="${edgeRate}" volume="+0%">${safeText}</prosody></voice></speak>`;
}

/**
 * Single Microsoft Edge Neural TTS WebSocket synthesis attempt.
 * @param {string} text
 * @param {{ id: string, edgeName: string, locale: string }} edgeVoice
 * @param {string} edgeRate
 * @param {number} timeoutMs
 * @returns {Promise<Buffer>}
 */
function runEdgeTtsAttempt(text, edgeVoice, edgeRate, timeoutMs) {
  return new Promise((resolve, reject) => {
    const connectionId = crypto.randomBytes(16).toString("hex");
    const requestId = crypto.randomBytes(16).toString("hex");
    const muid = crypto.randomBytes(16).toString("hex").toUpperCase();
    const secMsGec = generateSecMsGecV2();

    const wsUrl = `${EDGE_WSS_URL}?TrustedClientToken=${EDGE_TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${EDGE_SEC_MS_GEC_VERSION}&ConnectionId=${connectionId}`;

    const ws = new WebSocket(wsUrl, {
      headers: {
        "User-Agent": EDGE_USER_AGENT,
        Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        Cookie: `muid=${muid};`,
      },
      handshakeTimeout: Math.min(timeoutMs, 5000),
    });

    const audioChunks = [];
    let settled = false;
    let turnEnded = false;

    const cleanup = () => {
      clearTimeout(timerId);
      try {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CLOSING) {
          ws.close();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.terminate();
        }
      } catch {
        // ignore close errors
      }
    };

    const fail = (err) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(err);
    };

    const succeed = (buffer) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(buffer);
    };

    const timerId = setTimeout(() => {
      const err = new Error(`Edge Neural TTS timed out after ${timeoutMs}ms`);
      err.name = "AbortError";
      fail(err);
    }, timeoutMs);

    ws.once("unexpected-response", (req, res) => {
      const statusCode = res?.statusCode || 502;
      const serverDate = res?.headers?.date || null;
      const err = new Error(`Edge Neural TTS handshake returned HTTP ${statusCode}`);
      err.upstreamStatus = statusCode;
      err.serverDate = serverDate;
      try {
        req.destroy();
        res.destroy();
      } catch {
        // ignore
      }
      fail(err);
    });

    ws.once("error", (err) => {
      const wrapped = new Error(`Edge Neural TTS WebSocket error: ${err?.message || "unknown"}`);
      wrapped.upstreamStatus = err?.upstreamStatus || 502;
      fail(wrapped);
    });

    ws.once("open", () => {
      const timestamp = new Date().toUTCString().replace("GMT", "GMT+0000 (Coordinated Universal Time)");
      const configMsg =
        `X-Timestamp:${timestamp}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        JSON.stringify({
          context: {
            synthesis: {
              audio: {
                metadataoptions: {
                  sentenceBoundaryEnabled: "false",
                  wordBoundaryEnabled: "false",
                },
                outputFormat: EDGE_OUTPUT_FORMAT,
              },
            },
          },
        });

      const ssml = buildEdgeSsml(text, edgeVoice, edgeRate);
      const ssmlMsg =
        `X-RequestId:${requestId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${timestamp}Z\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml;

      ws.send(configMsg, (cfgErr) => {
        if (cfgErr) {
          fail(cfgErr);
          return;
        }
        ws.send(ssmlMsg, (ssmlErr) => {
          if (ssmlErr) {
            fail(ssmlErr);
          }
        });
      });
    });

    ws.on("message", (data, isBinary) => {
      if (settled) return;

      if (!isBinary) {
        const textMsg = Buffer.isBuffer(data) ? data.toString("utf8") : String(data);
        if (textMsg.includes("Path:turn.end")) {
          turnEnded = true;
          const combined = Buffer.concat(audioChunks);
          if (combined.byteLength === 0) {
            const err = new Error("Edge Neural TTS returned empty audio stream");
            err.upstreamStatus = 502;
            fail(err);
          } else {
            succeed(combined);
          }
        }
        return;
      }

      const buf = Buffer.isBuffer(data)
        ? data
        : data instanceof ArrayBuffer
          ? Buffer.from(data)
          : Buffer.concat(Array.isArray(data) ? data : [Buffer.from(data)]);

      if (buf.byteLength < 2) return;
      const headerLen = buf.readUInt16BE(0);
      if (headerLen + 2 >= buf.byteLength) return;
      const headerStr = buf.subarray(2, 2 + headerLen).toString("utf8");
      if (!headerStr.includes("Path:audio")) return;

      const audioPayload = buf.subarray(2 + headerLen);
      if (audioPayload.byteLength > 0) {
        audioChunks.push(audioPayload);
      }
    });

    ws.once("close", () => {
      if (settled) return;
      if (turnEnded && audioChunks.length > 0) {
        succeed(Buffer.concat(audioChunks));
      } else {
        const err = new Error("Edge Neural TTS connection closed before audio completed");
        err.upstreamStatus = 502;
        fail(err);
      }
    });
  });
}

/**
 * Synthesize MP3 audio via Microsoft Edge Neural TTS with automatic 403 clock-skew retry.
 * @param {string} text
 * @param {{ id: string, edgeName: string, locale: string }} edgeVoice
 * @param {string} edgeRate
 * @param {number} [timeoutMs=EDGE_TIMEOUT_MS]
 * @returns {Promise<Buffer>}
 */
export async function synthesizeEdgeTts(text, edgeVoice, edgeRate, timeoutMs = EDGE_TIMEOUT_MS) {
  const startedAt = Date.now();
  try {
    return await runEdgeTtsAttempt(text, edgeVoice, edgeRate, timeoutMs);
  } catch (err) {
    if (err?.upstreamStatus === 403 && typeof err?.serverDate === "string") {
      const serverMs = Date.parse(err.serverDate);
      const remainingMs = timeoutMs - (Date.now() - startedAt);
      if (Number.isFinite(serverMs) && remainingMs > 1500) {
        edgeClockOffsetMs = serverMs - Date.now();
        return await runEdgeTtsAttempt(text, edgeVoice, edgeRate, remainingMs);
      }
    }
    throw err;
  }
}

/**
 * Fetch a single MP3 chunk from Google Translate TTS (automatic fallback engine).
 * @param {string} chunk
 * @param {string} lang
 * @param {number} ttsSpeed
 * @returns {Promise<Buffer>}
 */
async function fetchGoogleTtsChunk(chunk, lang, ttsSpeed) {
  const params = new URLSearchParams({
    ie: "UTF-8",
    client: "tw-ob",
    tl: lang,
    ttsspeed: String(ttsSpeed),
    q: chunk,
  });

  const url = `https://translate.google.com/translate_tts?${params.toString()}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GOOGLE_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": GOOGLE_USER_AGENT,
        Referer: "https://translate.google.com/",
        Accept: "audio/mpeg, audio/*;q=0.9, */*;q=0.5",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = new Error(`Upstream TTS returned HTTP ${response.status}`);
      err.upstreamStatus = response.status;
      throw err;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType && !contentType.includes("audio") && !contentType.includes("octet-stream")) {
      const err = new Error(`Unexpected upstream content-type: ${contentType}`);
      err.upstreamStatus = 502;
      throw err;
    }

    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      const err = new Error("Upstream TTS returned empty audio payload");
      err.upstreamStatus = 502;
      throw err;
    }

    return Buffer.from(arrayBuffer);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function synthesizeGoogleFallback(text, lang, ttsSpeed) {
  const chunks = splitTextIntoChunks(text, MAX_CHUNK_LENGTH);
  const audioBuffers = [];
  for (const chunk of chunks) {
    const buffer = await fetchGoogleTtsChunk(chunk, lang, ttsSpeed);
    audioBuffers.push(buffer);
  }
  const audio = audioBuffers.length === 1 ? audioBuffers[0] : Buffer.concat(audioBuffers);
  return { audio, chunkCount: chunks.length };
}

/**
 * Extract query parameters safely for both Vercel Serverless and raw Node http.
 * @param {object} req
 * @returns {Record<string, string>}
 */
function getQueryParams(req) {
  if (req?.query && typeof req.query === "object") {
    return req.query;
  }
  try {
    const parsed = new URL(req?.url || "/", "http://localhost");
    return Object.fromEntries(parsed.searchParams.entries());
  } catch {
    return {};
  }
}

/**
 * Vercel Serverless Function: GET /api/tts?text=...&lang=vi&voice=hoaimy|namminh&speed=1
 * Primary engine: Microsoft Edge Neural TTS (`vi-VN-HoaiMyNeural` / `vi-VN-NamMinhNeural`).
 * Automatic fallback: Google Translate TTS if Edge Neural is unavailable or times out.
 *
 * Query parameters:
 * - text (required): Vietnamese or target text (1..1000 chars)
 * - lang (optional, default "vi"): Language code (e.g. "vi", "vi-VN", "en")
 * - voice (optional, default "hoaimy"): "hoaimy" (female) | "namminh" (male)
 * - speed (optional, default "1"): Playback speed (0.6..1.5 mapped to Edge SSML rate)
 */
export default async function handler(req, res, deps = {}) {
  const method = (req?.method || "GET").toUpperCase();

  if (method === "OPTIONS") {
    res.setHeader("Allow", "GET, HEAD, OPTIONS");
    return res.status(204).end();
  }

  if (method !== "GET" && method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD, OPTIONS");
    res.setHeader("Cache-Control", "no-store");
    return res.status(405).json({
      error: "Method not allowed. Use GET /api/tts?text=...&lang=vi&voice=hoaimy&speed=1",
    });
  }

  const query = getQueryParams(req);
  const rawText = Array.isArray(query.text) ? query.text[0] : query.text;
  const rawLang = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  const rawVoice = Array.isArray(query.voice) ? query.voice[0] : query.voice;
  const rawSpeed = Array.isArray(query.speed) ? query.speed[0] : query.speed;

  const text = typeof rawText === "string" ? rawText.replace(/\s+/g, " ").trim() : "";

  if (!text) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(400).json({
      error: "Missing required query parameter: text",
    });
  }

  if (text.length > MAX_TOTAL_LENGTH) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(400).json({
      error: `Text exceeds maximum length of ${MAX_TOTAL_LENGTH} characters`,
      maxLength: MAX_TOTAL_LENGTH,
      receivedLength: text.length,
    });
  }

  const lang = normalizeLang(rawLang);
  const edgeVoice = resolveEdgeVoice(lang, rawVoice);
  const edgeRate = speedToEdgeRate(rawSpeed);
  const googleSpeed = normalizeSpeed(rawSpeed);

  const edgeSynthesizer = deps.synthesizeEdge || synthesizeEdgeTts;

  let audioBuffer = null;
  let provider = "edge-neural";
  let resolvedVoiceHeader = edgeVoice?.edgeName || `google-${lang}`;
  let chunkCount = 1;
  let edgeError = null;

  // 1. Primary path: Microsoft Edge Neural TTS (Hoài My / Nam Minh)
  if (edgeVoice) {
    try {
      const synthesized = await edgeSynthesizer(text, edgeVoice, edgeRate);
      if (synthesized && synthesized.byteLength > 0) {
        audioBuffer = Buffer.isBuffer(synthesized) ? synthesized : Buffer.from(synthesized);
        provider = "edge-neural";
        resolvedVoiceHeader = edgeVoice.edgeName;
        chunkCount = 1;
      } else {
        edgeError = new Error("Edge Neural TTS returned empty audio buffer");
      }
    } catch (err) {
      edgeError = err;
    }
  }

  // 2. Automatic fallback: Google Translate TTS
  if (!audioBuffer) {
    try {
      const fallback = await synthesizeGoogleFallback(text, lang, googleSpeed);
      audioBuffer = fallback.audio;
      provider = "google-fallback";
      resolvedVoiceHeader = `google-${lang}`;
      chunkCount = fallback.chunkCount;
    } catch (fallbackErr) {
      const isTimeout =
        fallbackErr?.name === "AbortError" ||
        (edgeError?.name === "AbortError" && !fallbackErr?.upstreamStatus);
      const status = isTimeout ? 504 : 502;
      res.setHeader("Cache-Control", "no-store");
      return res.status(status).json({
        error: isTimeout
          ? "TTS upstream timed out"
          : "Failed to synthesize Vietnamese audio from upstream TTS",
        upstreamStatus: fallbackErr?.upstreamStatus || edgeError?.upstreamStatus || null,
        details: fallbackErr?.message || edgeError?.message || "Unknown upstream error",
      });
    }
  }

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Length", String(audioBuffer.byteLength));
  res.setHeader(
    "Cache-Control",
    "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"
  );
  res.setHeader("X-TTS-Provider", provider);
  res.setHeader("X-TTS-Voice", resolvedVoiceHeader);
  res.setHeader("X-TTS-Lang", lang);
  res.setHeader("X-TTS-Chunks", String(chunkCount));
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (method === "HEAD") {
    return res.status(200).end();
  }

  return res.status(200).send(audioBuffer);
}
