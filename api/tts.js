import crypto from "node:crypto";
import WebSocket from "ws";

const MAX_CHUNK_LENGTH = 200;
const MAX_TOTAL_LENGTH = 1000;
const MAX_CACHE_BYTES = 4 * 1024 * 1024; // 4 MiB bucket limit

const SUPABASE_CACHE_READ_TIMEOUT_MS = 1800;
const SUPABASE_CACHE_WRITE_TIMEOUT_MS = 1200;
const HF_SPACE_BASE_URL = "https://nam194-vieneu-tts-v3-turbo.hf.space";
const HF_SYNTHESIZE_CALL_URL = `${HF_SPACE_BASE_URL}/gradio_api/call/synthesize`;
const HF_TOTAL_TIMEOUT_MS = 7200;
const EDGE_TIMEOUT_MS = 7500;
const EDGE_FALLBACK_TIMEOUT_MS = 5000;
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

export const RANDOM_VOICE_ID = "random";
export const DEFAULT_NORTHERN_VOICE_ID = "ngochuyen";

/**
 * Northern Vietnamese (miền Bắc) voices powered by `nam194/VieNeu-TTS-v3-Turbo`,
 * paired with matching gender Microsoft Edge Neural fallback voices.
 */
export const NORTHERN_VOICES = Object.freeze({
  ngochuyen: Object.freeze({
    id: "ngochuyen",
    label: "Ngọc Huyền",
    hfVoice: "Ngọc Huyền",
    headerVoice: "Ngoc Huyen",
    gender: "female",
    region: "Bắc",
    style: "Giọng đọc tự nhiên",
    fallbackEdgeVoice: "vi-VN-HoaiMyNeural",
    locale: "vi-VN",
  }),
  trucly: Object.freeze({
    id: "trucly",
    label: "Trúc Ly",
    hfVoice: "Trúc Ly",
    headerVoice: "Truc Ly",
    gender: "female",
    region: "Bắc",
    style: "Phong cách tự nhiên",
    fallbackEdgeVoice: "vi-VN-HoaiMyNeural",
    locale: "vi-VN",
  }),
  maianh: Object.freeze({
    id: "maianh",
    label: "Mai Anh",
    hfVoice: "Mai Anh",
    headerVoice: "Mai Anh",
    gender: "female",
    region: "Bắc",
    style: "Phong cách tin tức rõ chữ",
    fallbackEdgeVoice: "vi-VN-HoaiMyNeural",
    locale: "vi-VN",
  }),
  haidang: Object.freeze({
    id: "haidang",
    label: "Hải Đăng",
    hfVoice: "Hải Đăng",
    headerVoice: "Hai Dang",
    gender: "male",
    region: "Bắc",
    style: "Phong cách tự nhiên",
    fallbackEdgeVoice: "vi-VN-NamMinhNeural",
    locale: "vi-VN",
  }),
  thienminh: Object.freeze({
    id: "thienminh",
    label: "Thiện Minh",
    hfVoice: "Thiện Minh",
    headerVoice: "Thien Minh",
    gender: "male",
    region: "Bắc",
    style: "Phong cách kể chuyện",
    fallbackEdgeVoice: "vi-VN-NamMinhNeural",
    locale: "vi-VN",
  }),
});

const NORTHERN_VOICE_IDS = Object.freeze([
  "ngochuyen",
  "trucly",
  "maianh",
  "haidang",
  "thienminh",
]);

const RANDOM_VOICE_ALIASES = new Set(["random", "ngaunhien", "auto", "shuffle"]);

const VOICE_ALIAS_MAP = Object.freeze({
  ngochuyen: "ngochuyen",
  trucly: "trucly",
  maianh: "maianh",
  haidang: "haidang",
  thienminh: "thienminh",
  // Legacy Microsoft Edge aliases
  hoaimy: "ngochuyen",
  vivnhoaimyneural: "ngochuyen",
  female: "ngochuyen",
  nu: "ngochuyen",
  namminh: "haidang",
  vivnnamminhneural: "haidang",
  male: "haidang",
  nam: "haidang",
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
 * Strip Vietnamese diacritics and convert to ASCII-safe HTTP header characters.
 * Node's `http.ServerResponse.setHeader()` rejects characters > 0xFF (`ERR_INVALID_CHAR`).
 * @param {string} value
 * @returns {string}
 */
export function toSafeHeaderValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

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
 * Deterministically pick one of the 5 Northern Vietnamese voices from normalized text
 * using FNV-1a 32-bit hashing modulo 5.
 * Matches `pickRandomVoiceForText` in `src/lib/speech.js` so `voice=random` resolves
 * to the exact same Northern voice & Supabase Storage cache key on client and server.
 *
 * @param {string} text
 * @returns {"ngochuyen" | "trucly" | "maianh" | "haidang" | "thienminh"}
 */
export function pickRandomVoiceForText(text) {
  const normalized = String(text || "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return DEFAULT_NORTHERN_VOICE_ID;
  let hash = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i += 1) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return NORTHERN_VOICE_IDS[hash % NORTHERN_VOICE_IDS.length];
}

/**
 * Normalize any voice ID (`random` or one of the 5 Northern IDs), legacy alias
 * (`hoaimy`/`namminh`), or full Vietnamese display name (`Ngọc Huyền`, `Hải Đăng`, ...)
 * into one of the 5 concrete Northern voice IDs.
 * When `rawVoice` is `'random'`, deterministically picks a Northern voice from `text`.
 * @param {string | undefined} rawVoice
 * @param {string} [text=""]
 * @returns {"ngochuyen" | "trucly" | "maianh" | "haidang" | "thienminh"}
 */
export function normalizeVoice(rawVoice, text = "") {
  if (!rawVoice || typeof rawVoice !== "string") {
    return DEFAULT_NORTHERN_VOICE_ID;
  }
  const canonical = rawVoice
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  if (RANDOM_VOICE_ALIASES.has(canonical)) {
    return pickRandomVoiceForText(text);
  }
  if (VOICE_ALIAS_MAP[canonical]) {
    return VOICE_ALIAS_MAP[canonical];
  }
  if (canonical.includes("namminh")) return "haidang";
  if (canonical.includes("hoaimy")) return "ngochuyen";
  return DEFAULT_NORTHERN_VOICE_ID;
}

/**
 * Resolve `'random'` or any Northern voice ID into a concrete Northern voice ID for `text`.
 * @param {string | undefined} rawVoice
 * @param {string} [text=""]
 * @returns {"ngochuyen" | "trucly" | "maianh" | "haidang" | "thienminh"}
 */
export function resolveEffectiveVoice(rawVoice, text = "") {
  return normalizeVoice(rawVoice, text);
}

/**
 * Resolve full Northern Vietnamese voice metadata from a raw voice string.
 * @param {string | undefined} rawVoice
 * @param {string} [text=""]
 */
export function resolveNorthernVoice(rawVoice, text = "") {
  const voiceId = normalizeVoice(rawVoice, text);
  return NORTHERN_VOICES[voiceId] || NORTHERN_VOICES[DEFAULT_NORTHERN_VOICE_ID];
}

/**
 * Resolve Microsoft Edge Neural fallback voice metadata for a language & voice id.
 * Female Northern voices fall back to `vi-VN-HoaiMyNeural`; male voices fall back
 * to `vi-VN-NamMinhNeural`.
 * @param {string} lang
 * @param {string | undefined} rawVoice
 * @param {string} [text=""]
 * @returns {{ id: string, edgeName: string, locale: string } | null}
 */
export function resolveEdgeVoice(lang, rawVoice, text = "") {
  const northern = resolveNorthernVoice(rawVoice, text);
  if (lang === "vi") {
    return {
      id: northern.id,
      edgeName: northern.fallbackEdgeVoice,
      locale: "vi-VN",
    };
  }
  if (lang === "en") {
    return {
      id: northern.id,
      edgeName: northern.gender === "male" ? "en-US-GuyNeural" : "en-US-AriaNeural",
      locale: "en-US",
    };
  }
  return null;
}

/**
 * Compute deterministic, speed-independent Supabase Storage cache path for VieNeu-TTS WAV clips.
 * Format strictly matches `^v1/[a-z0-9_-]+/[a-f0-9]{64}\.wav$`.
 * @param {string} text
 * @param {string | undefined} rawVoice
 * @returns {{ voice: object, normalizedText: string, hash: string, cachePath: string }}
 */
export function computeCachePath(text, rawVoice) {
  const normalizedText = String(text || "").replace(/\s+/g, " ").trim();
  const voice = resolveNorthernVoice(rawVoice, normalizedText);
  const hash = crypto
    .createHash("sha256")
    .update(`${voice.id}::${normalizedText}`)
    .digest("hex");
  const cachePath = `v1/${voice.id}/${hash}.wav`;
  return { voice, normalizedText, hash, cachePath };
}

/**
 * Choose adaptive `max_new_frames` for VieNeu-TTS-v3-Turbo based on text length
 * to minimize generation latency on short flashcards while avoiding cutoff on passages.
 * @param {string} text
 * @returns {number}
 */
export function adaptiveMaxFrames(text) {
  const len = String(text || "").replace(/\s+/g, " ").trim().length;
  if (len <= 25) return 120;
  if (len <= 80) return 200;
  if (len <= 180) return 320;
  return 480;
}

/**
 * Clamp requested playback speed into Google Translate TTS `ttsspeed` parameter.
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

    let breakAt = Math.max(
      slice.lastIndexOf(". "),
      slice.lastIndexOf("! "),
      slice.lastIndexOf("? "),
      slice.lastIndexOf("… ")
    );
    if (breakAt > Math.floor(maxLen * 0.35)) {
      breakAt += 1;
    } else {
      breakAt = Math.max(
        slice.lastIndexOf(", "),
        slice.lastIndexOf("; "),
        slice.lastIndexOf(": ")
      );
      if (breakAt > Math.floor(maxLen * 0.35)) {
        breakAt += 1;
      } else {
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

/**
 * Read Supabase Storage configuration from environment variables.
 * @param {Record<string, string | undefined>} [env=process.env]
 */
function getSupabaseCacheConfig(env = process.env) {
  const supabaseUrl = String(env?.SUPABASE_URL || env?.VITE_SUPABASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
  const supabaseKey = String(
    env?.SUPABASE_SERVICE_ROLE_KEY ||
      env?.SUPABASE_ANON_KEY ||
      env?.VITE_SUPABASE_ANON_KEY ||
      ""
  ).trim();
  return { supabaseUrl, supabaseKey };
}

/**
 * Tier 1: Fetch cached WAV bytes from public Supabase Storage `tts-cache` bucket.
 * Returns `null` on miss, timeout, or network error so synthesis continues cleanly.
 * @param {string} cachePath
 * @param {{ supabaseUrl?: string, timeoutMs?: number, fetchImpl?: typeof fetch }} [options={}]
 * @returns {Promise<Buffer | null>}
 */
export async function fetchSupabaseCachedAudio(cachePath, options = {}) {
  const {
    supabaseUrl,
    timeoutMs = SUPABASE_CACHE_READ_TIMEOUT_MS,
    fetchImpl = fetch,
  } = options;

  if (!supabaseUrl || !cachePath || typeof fetchImpl !== "function") {
    return null;
  }

  const url = `${supabaseUrl}/storage/v1/object/public/tts-cache/${cachePath}`;
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      method: "GET",
      headers: {
        Accept: "audio/wav, audio/x-wav, audio/*;q=0.9, */*;q=0.5",
      },
      signal: controller.signal,
    });

    if (!response || !response.ok) {
      return null;
    }

    const contentType = String(response.headers?.get?.("content-type") || "").toLowerCase();
    if (contentType && !contentType.includes("audio") && !contentType.includes("octet-stream")) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return null;
    }

    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  } finally {
    clearTimeout(timerId);
  }
}

/**
 * Persist newly synthesized WAV audio into Supabase Storage `tts-cache` bucket.
 * Write-once (`x-upsert: false`), capped at 1200ms timeout and 4 MiB max payload;
 * swallows 409 conflicts and transient errors so user playback never fails.
 * @param {string} cachePath
 * @param {Buffer} audioBuffer
 * @param {{ supabaseUrl?: string, supabaseKey?: string, timeoutMs?: number, fetchImpl?: typeof fetch }} [options={}]
 * @returns {Promise<boolean>}
 */
export async function persistSupabaseCachedAudio(cachePath, audioBuffer, options = {}) {
  const {
    supabaseUrl,
    supabaseKey,
    timeoutMs = SUPABASE_CACHE_WRITE_TIMEOUT_MS,
    fetchImpl = fetch,
  } = options;

  if (
    !supabaseUrl ||
    !supabaseKey ||
    !cachePath ||
    !audioBuffer ||
    audioBuffer.byteLength === 0 ||
    audioBuffer.byteLength > MAX_CACHE_BYTES ||
    typeof fetchImpl !== "function"
  ) {
    return false;
  }

  const url = `${supabaseUrl}/storage/v1/object/tts-cache/${cachePath}`;
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "audio/wav",
        "x-upsert": "false",
      },
      body: audioBuffer,
      signal: controller.signal,
    });
    return Boolean(response && (response.ok || response.status === 409));
  } catch {
    return false;
  } finally {
    clearTimeout(timerId);
  }
}

/**
 * Extract downloadable audio URL from Gradio `/synthesize` `event: complete` payload.
 * @param {string} rawData
 * @returns {string}
 */
export function extractGradioAudioUrl(rawData) {
  let parsed;
  try {
    parsed = JSON.parse(rawData);
  } catch {
    throw new Error("VieNeu-TTS returned invalid JSON in Gradio complete event");
  }

  const first = Array.isArray(parsed) ? parsed[0] : parsed;
  let candidate = "";
  if (typeof first === "string") {
    candidate = first.trim();
  } else if (first && typeof first === "object") {
    if (typeof first.url === "string" && first.url.trim()) {
      candidate = first.url.trim();
    } else if (typeof first.path === "string" && first.path.trim()) {
      candidate = `${HF_SPACE_BASE_URL}/gradio_api/file=${first.path.trim()}`;
    }
  }

  if (!candidate) {
    throw new Error("VieNeu-TTS Gradio complete event missing audio URL");
  }
  if (candidate.startsWith("/")) {
    return `${HF_SPACE_BASE_URL}${candidate}`;
  }
  return candidate;
}

/**
 * Parse a Gradio SSE stream (either streaming `ReadableStream` or full text fallback)
 * until `event: complete` or `event: error`.
 * @param {Response} sseResponse
 * @returns {Promise<string>}
 */
async function readGradioSseAudioUrl(sseResponse) {
  let currentEvent = "";
  let dataLines = [];

  const dispatchBlock = () => {
    const eventName = currentEvent.trim().toLowerCase();
    const dataText = dataLines.join("\n").trim();
    currentEvent = "";
    dataLines = [];

    if (!eventName && !dataText) return null;
    if (eventName === "complete") {
      return extractGradioAudioUrl(dataText);
    }
    if (eventName === "error") {
      const err = new Error(`VieNeu-TTS Space error: ${dataText || "synthesis failed"}`);
      err.upstreamStatus = 502;
      throw err;
    }
    return null;
  };

  const processLines = (lines) => {
    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, "");
      if (line === "") {
        const foundUrl = dispatchBlock();
        if (foundUrl) return foundUrl;
        continue;
      }
      if (line.startsWith(":")) continue;
      if (line.startsWith("event:")) {
        currentEvent = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
    return null;
  };

  if (sseResponse.body && typeof sseResponse.body.getReader === "function") {
    const reader = sseResponse.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop() || "";
        const foundUrl = processLines(parts);
        if (foundUrl) {
          reader.cancel().catch(() => {});
          return foundUrl;
        }
      }
      buffer += decoder.decode();
      if (buffer) {
        const foundUrl = processLines(buffer.split("\n"));
        if (foundUrl) return foundUrl;
      }
      const tailUrl = dispatchBlock();
      if (tailUrl) return tailUrl;
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // ignore
      }
    }
  } else {
    const fullText = await sseResponse.text();
    const foundUrl = processLines(fullText.split("\n"));
    if (foundUrl) return foundUrl;
    const tailUrl = dispatchBlock();
    if (tailUrl) return tailUrl;
  }

  const err = new Error("VieNeu-TTS SSE stream ended without a complete event");
  err.upstreamStatus = 502;
  throw err;
}

/**
 * Tier 2: Synthesize Northern Vietnamese WAV audio via `nam194/VieNeu-TTS-v3-Turbo`
 * Gradio API on Hugging Face Spaces with strict total timeout (`7200ms`).
 *
 * @param {string} text
 * @param {string | object} rawVoice
 * @param {{ timeoutMs?: number, fetchImpl?: typeof fetch }} [options={}]
 * @returns {Promise<Buffer>}
 */
export async function fetchVieNeuAudio(text, rawVoice, options = {}) {
  const { timeoutMs = HF_TOTAL_TIMEOUT_MS, fetchImpl = fetch } = options;
  const normalizedText = String(text || "").replace(/\s+/g, " ").trim();
  const voice =
    rawVoice && typeof rawVoice === "object" && rawVoice.hfVoice
      ? rawVoice
      : resolveNorthernVoice(rawVoice, normalizedText);
  const maxNewFrames = adaptiveMaxFrames(normalizedText);

  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // 1. Submit synthesis job to Gradio queue
    const callResponse = await fetchImpl(HF_SYNTHESIZE_CALL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: [
          normalizedText,
          voice.hfVoice,
          null,
          0.8,
          25,
          0.95,
          1.2,
          maxNewFrames,
          200,
          true,
        ],
      }),
      signal: controller.signal,
    });

    if (!callResponse.ok) {
      const err = new Error(`VieNeu-TTS call returned HTTP ${callResponse.status}`);
      err.upstreamStatus = callResponse.status;
      throw err;
    }

    const callJson = await callResponse.json();
    const eventId = typeof callJson?.event_id === "string" ? callJson.event_id.trim() : "";
    if (!eventId) {
      const err = new Error("VieNeu-TTS call response missing event_id");
      err.upstreamStatus = 502;
      throw err;
    }

    // 2. Listen to SSE stream until `event: complete`
    const sseUrl = `${HF_SYNTHESIZE_CALL_URL}/${encodeURIComponent(eventId)}`;
    const sseResponse = await fetchImpl(sseUrl, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
      },
      signal: controller.signal,
    });

    if (!sseResponse.ok) {
      const err = new Error(`VieNeu-TTS SSE stream returned HTTP ${sseResponse.status}`);
      err.upstreamStatus = sseResponse.status;
      throw err;
    }

    const audioUrl = await readGradioSseAudioUrl(sseResponse);

    // 3. Download generated WAV bytes within the same total timeout budget
    const audioResponse = await fetchImpl(audioUrl, {
      method: "GET",
      headers: {
        Accept: "audio/wav, audio/x-wav, audio/*;q=0.9, */*;q=0.5",
      },
      signal: controller.signal,
    });

    if (!audioResponse.ok) {
      const err = new Error(`VieNeu-TTS audio download returned HTTP ${audioResponse.status}`);
      err.upstreamStatus = audioResponse.status;
      throw err;
    }

    const contentType = String(audioResponse.headers?.get?.("content-type") || "").toLowerCase();
    if (contentType && !contentType.includes("audio") && !contentType.includes("octet-stream")) {
      const err = new Error(`Unexpected VieNeu-TTS audio content-type: ${contentType}`);
      err.upstreamStatus = 502;
      throw err;
    }

    const arrayBuffer = await audioResponse.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      const err = new Error("VieNeu-TTS returned empty WAV payload");
      err.upstreamStatus = 502;
      throw err;
    }

    return Buffer.from(arrayBuffer);
  } finally {
    clearTimeout(timerId);
  }
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
      handshakeTimeout: Math.min(timeoutMs, 4500),
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
      const timestamp = new Date()
        .toUTCString()
        .replace("GMT", "GMT+0000 (Coordinated Universal Time)");
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

async function fetchGoogleTtsChunk(chunk, lang, ttsSpeed, fetchImpl = fetch) {
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
    const response = await fetchImpl(url, {
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

async function synthesizeGoogleFallback(text, lang, ttsSpeed, fetchImpl = fetch) {
  const chunks = splitTextIntoChunks(text, MAX_CHUNK_LENGTH);
  const audioBuffers = [];
  for (const chunk of chunks) {
    const buffer = await fetchGoogleTtsChunk(chunk, lang, ttsSpeed, fetchImpl);
    audioBuffers.push(buffer);
  }
  const audio = audioBuffers.length === 1 ? audioBuffers[0] : Buffer.concat(audioBuffers);
  return { audio, chunkCount: chunks.length };
}

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
 * Vercel Serverless Function:
 * GET /api/tts?text=...&lang=vi&voice=random|ngochuyen|trucly|maianh|haidang|thienminh&speed=1
 *
 * 3-Tier Speed-Optimized Vietnamese TTS Architecture:
 * - Tier 1: Public Supabase Storage shared WAV cache (`tts-cache` bucket, ~80ms hit)
 * - Tier 2: `nam194/VieNeu-TTS-v3-Turbo` Hugging Face Space Gradio API (5 Northern voices)
 *           with adaptive `max_new_frames` + write-once persistence to Supabase Storage
 * - Tier 3: Automatic fast fallback to Microsoft Edge Neural (`vi-VN-HoaiMyNeural` /
 *           `vi-VN-NamMinhNeural`), then Google Translate TTS as last resort.
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
      error:
        "Method not allowed. Use GET /api/tts?text=...&lang=vi&voice=ngochuyen&speed=1",
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
  const { voice: northernVoice, normalizedText, cachePath } = computeCachePath(text, rawVoice);
  const edgeVoice = resolveEdgeVoice(lang, northernVoice.id);
  const edgeRate = speedToEdgeRate(rawSpeed);
  const googleSpeed = normalizeSpeed(rawSpeed);

  const env = deps.env || process.env;
  const fetchImpl = deps.fetchImpl || fetch;
  const { supabaseUrl, supabaseKey } = getSupabaseCacheConfig(env);

  const cacheReader =
    deps.fetchCache ||
    ((path) => fetchSupabaseCachedAudio(path, { supabaseUrl, fetchImpl }));
  const cacheWriter =
    deps.persistCache ||
    ((path, buf) =>
      persistSupabaseCachedAudio(path, buf, { supabaseUrl, supabaseKey, fetchImpl }));
  const vieNeuSynthesizer =
    deps.fetchVieNeu ||
    ((t, v) => fetchVieNeuAudio(t, v, { fetchImpl }));
  const edgeSynthesizer = deps.synthesizeEdge || synthesizeEdgeTts;
  const googleSynthesizer =
    deps.synthesizeGoogle ||
    ((t, l, s) => synthesizeGoogleFallback(t, l, s, fetchImpl));

  let audioBuffer = null;
  let contentType = "audio/wav";
  let cacheControl =
    "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";
  let provider = "vieneu-hf";
  let resolvedVoiceHeader = northernVoice.headerVoice || toSafeHeaderValue(northernVoice.hfVoice);
  let chunkCount = 1;
  let lastError = null;

  if (lang === "vi") {
    // Tier 1: Supabase Storage Shared Cache (~80ms)
    if (supabaseUrl || deps.fetchCache) {
      try {
        const cached = await cacheReader(cachePath);
        if (cached && cached.byteLength > 0) {
          audioBuffer = Buffer.isBuffer(cached) ? cached : Buffer.from(cached);
          contentType = "audio/wav";
          cacheControl = "public, max-age=31536000, immutable";
          provider = "vieneu-cache";
          resolvedVoiceHeader =
            northernVoice.headerVoice || toSafeHeaderValue(northernVoice.hfVoice);
          chunkCount = 1;
        }
      } catch {
        // Ignore cache read failures and fall through to Tier 2
      }
    }

    // Tier 2: nam194/VieNeu-TTS-v3-Turbo Gradio API on Hugging Face
    if (!audioBuffer) {
      try {
        const synthesized = await vieNeuSynthesizer(normalizedText, northernVoice);
        if (synthesized && synthesized.byteLength > 0) {
          audioBuffer = Buffer.isBuffer(synthesized)
            ? synthesized
            : Buffer.from(synthesized);
          contentType = "audio/wav";
          cacheControl =
            "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";
          provider = "vieneu-hf";
          resolvedVoiceHeader =
            northernVoice.headerVoice || toSafeHeaderValue(northernVoice.hfVoice);
          chunkCount = 1;

          // Persist to Supabase Storage (capped 1200ms, <= 4MB, swallow errors)
          if (
            (supabaseUrl && supabaseKey) ||
            deps.persistCache
          ) {
            if (audioBuffer.byteLength <= MAX_CACHE_BYTES) {
              try {
                await cacheWriter(cachePath, audioBuffer);
              } catch {
                // Never fail response on cache write error
              }
            }
          }
        } else {
          lastError = new Error("VieNeu-TTS returned empty audio buffer");
        }
      } catch (err) {
        lastError = err;
      }
    }
  }

  // Tier 3a: Automatic Fast Fallback -> Microsoft Edge Neural TTS
  if (!audioBuffer && edgeVoice) {
    try {
      const edgeTimeout = lang === "vi" ? EDGE_FALLBACK_TIMEOUT_MS : EDGE_TIMEOUT_MS;
      const synthesized = await edgeSynthesizer(
        normalizedText,
        edgeVoice,
        edgeRate,
        edgeTimeout
      );
      if (synthesized && synthesized.byteLength > 0) {
        audioBuffer = Buffer.isBuffer(synthesized)
          ? synthesized
          : Buffer.from(synthesized);
        contentType = "audio/mpeg";
        cacheControl =
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";
        provider = lang === "vi" ? "edge-fallback" : "edge-neural";
        resolvedVoiceHeader = edgeVoice.edgeName;
        chunkCount = 1;
      } else {
        lastError = new Error("Edge Neural TTS returned empty audio buffer");
      }
    } catch (err) {
      lastError = err;
    }
  }

  // Tier 3b: Last-resort Fallback -> Google Translate TTS
  if (!audioBuffer) {
    try {
      const fallback = await googleSynthesizer(normalizedText, lang, googleSpeed);
      audioBuffer = fallback.audio;
      contentType = "audio/mpeg";
      cacheControl =
        "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";
      provider = "google-fallback";
      resolvedVoiceHeader = `google-${lang}`;
      chunkCount = fallback.chunkCount;
    } catch (fallbackErr) {
      const isTimeout =
        fallbackErr?.name === "AbortError" ||
        (lastError?.name === "AbortError" && !fallbackErr?.upstreamStatus);
      const status = isTimeout ? 504 : 502;
      res.setHeader("Cache-Control", "no-store");
      return res.status(status).json({
        error: isTimeout
          ? "TTS upstream timed out"
          : "Failed to synthesize Vietnamese audio from upstream TTS",
        upstreamStatus: fallbackErr?.upstreamStatus || lastError?.upstreamStatus || null,
        details: fallbackErr?.message || lastError?.message || "Unknown upstream error",
      });
    }
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", String(audioBuffer.byteLength));
  res.setHeader("Cache-Control", cacheControl);
  res.setHeader("X-TTS-Provider", provider);
  res.setHeader("X-TTS-Voice", toSafeHeaderValue(resolvedVoiceHeader));
  res.setHeader("X-TTS-Voice-Id", northernVoice.id);
  res.setHeader("X-TTS-Lang", lang);
  res.setHeader("X-TTS-Chunks", String(chunkCount));
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (method === "HEAD") {
    return res.status(200).end();
  }

  return res.status(200).send(audioBuffer);
}
