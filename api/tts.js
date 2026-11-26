const MAX_CHUNK_LENGTH = 200;
const MAX_TOTAL_LENGTH = 1000;
const UPSTREAM_TIMEOUT_MS = 8000;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const LANG_PATTERN = /^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$/;

/**
 * Normalize a BCP-47 language code to the target language accepted by Google Translate TTS.
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
 * Clamp requested playback speed into Google Translate TTS `ttsspeed` parameter.
 * Google Translate TTS supports slow (~0.24-0.5) and normal (1).
 * Fine-grained playback speed adjustments can also be applied client-side via audio.playbackRate.
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

/**
 * Fetch a single MP3 chunk from Google Translate TTS.
 * @param {string} chunk
 * @param {string} lang
 * @param {number} ttsSpeed
 * @returns {Promise<Buffer>}
 */
async function fetchTtsChunk(chunk, lang, ttsSpeed) {
  const params = new URLSearchParams({
    ie: "UTF-8",
    client: "tw-ob",
    tl: lang,
    ttsspeed: String(ttsSpeed),
    q: chunk,
  });

  const url = `https://translate.google.com/translate_tts?${params.toString()}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
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
 * Vercel Serverless Function: GET /api/tts?text=...&lang=vi&speed=1
 * Returns MP3 audio (`audio/mpeg`) for reliable Vietnamese pronunciation across browsers.
 *
 * Query parameters:
 * - text (required): Vietnamese or target text (1..1000 chars, auto-chunked <= 200 chars/chunk)
 * - lang (optional, default "vi"): Language code (e.g. "vi", "vi-VN", "en")
 * - speed (optional, default "1"): Playback rate hint (e.g. "0.5", "0.75", "1")
 */
export default async function handler(req, res) {
  const method = (req?.method || "GET").toUpperCase();

  if (method === "OPTIONS") {
    res.setHeader("Allow", "GET, HEAD, OPTIONS");
    return res.status(204).end();
  }

  if (method !== "GET" && method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD, OPTIONS");
    res.setHeader("Cache-Control", "no-store");
    return res.status(405).json({
      error: "Method not allowed. Use GET /api/tts?text=...&lang=vi&speed=1",
    });
  }

  const query = getQueryParams(req);
  const rawText = Array.isArray(query.text) ? query.text[0] : query.text;
  const rawLang = Array.isArray(query.lang) ? query.lang[0] : query.lang;
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
  const ttsSpeed = normalizeSpeed(rawSpeed);
  const chunks = splitTextIntoChunks(text, MAX_CHUNK_LENGTH);

  try {
    const audioBuffers = [];
    for (const chunk of chunks) {
      const buffer = await fetchTtsChunk(chunk, lang, ttsSpeed);
      audioBuffers.push(buffer);
    }

    const combinedAudio =
      audioBuffers.length === 1 ? audioBuffers[0] : Buffer.concat(audioBuffers);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", String(combinedAudio.byteLength));
    res.setHeader(
      "Cache-Control",
      "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"
    );
    res.setHeader("X-TTS-Lang", lang);
    res.setHeader("X-TTS-Chunks", String(chunks.length));
    res.setHeader("X-Content-Type-Options", "nosniff");

    if (method === "HEAD") {
      return res.status(200).end();
    }

    return res.status(200).send(combinedAudio);
  } catch (err) {
    const isTimeout = err?.name === "AbortError";
    const status = isTimeout ? 504 : 502;
    res.setHeader("Cache-Control", "no-store");
    return res.status(status).json({
      error: isTimeout
        ? "TTS upstream timed out"
        : "Failed to synthesize Vietnamese audio from upstream TTS",
      upstreamStatus: err?.upstreamStatus || null,
      details: err?.message || "Unknown upstream error",
    });
  }
}
