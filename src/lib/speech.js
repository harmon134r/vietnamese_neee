/**
 * Vietnamese Speech Synthesis (TTS) & Speech Recognition (STT) Engine.
 * - TTS resolves audio in ultra-fast order:
 *   1. In-memory Blob URL cache (`0ms`)
 *   2. Browser Cache API (`vietflow-tts-v2`, `~2–5ms`)
 *   3. In-flight request deduplication (`inFlightFetches`)
 *   4. Direct Supabase Storage public CDN (`tts-cache`, `~60–150ms`, bypassing Vercel Serverless)
 *   5. `/api/tts` serverless fallback (VieNeu-TTS-v3-Turbo HF + Supabase persist + Edge/Google fallback)
 *   6. Automatic browser `window.speechSynthesis` (`vi-VN`) fallback
 * - Multi-sentence passages are split via `splitVietnameseSentences` and played with
 *   sentence-by-sentence pipelining (lookahead concurrency = 2) so sentence 1 starts ASAP.
 * - STT wraps `SpeechRecognition || webkitSpeechRecognition` with `lang = 'vi-VN'`.
 * - Optional `MediaRecorder` + Web Audio `AnalyserNode` helper for mic meter & self-playback.
 */

import {
  NORTHERN_VOICE_IDS,
  computeTtsCachePath,
  normalizeTtsText,
  pickRandomVoiceForText,
  splitVietnameseSentences,
} from "./ttsText.js";

const MAX_CACHE_ENTRIES = 160;
const MAX_PREFETCH_CONCURRENCY = 2;
const MAX_PREFETCH_QUEUE_SIZE = 40;
const MAX_TTS_TEXT_LENGTH = 1000;
const SUPABASE_CDN_TIMEOUT_MS = 4500;
const PIPELINE_LOOKAHEAD = 2;

export { pickRandomVoiceForText, splitVietnameseSentences };

export const TTS_BROWSER_CACHE_NAME = "vietflow-tts-v2";
export const VOICE_STORAGE_KEY = "vietflow_tts_voice";
export const VOICE_CHANGE_EVENT = "vietflow:voice-change";
export const RANDOM_VOICE_ID = "random";
export const DEFAULT_VOICE_ID = RANDOM_VOICE_ID;

export const VIETNAMESE_VOICES = Object.freeze([
  Object.freeze({
    id: "ngochuyen",
    label: "Ngọc Huyền",
    shortLabel: "Nữ · Bắc · Tự nhiên",
    gender: "female",
    region: "Bắc",
    style: "Giọng đọc tự nhiên",
    hfVoice: "Ngọc Huyền",
    fallbackEdgeVoice: "vi-VN-HoaiMyNeural",
  }),
  Object.freeze({
    id: "trucly",
    label: "Trúc Ly",
    shortLabel: "Nữ · Bắc · Tự nhiên",
    gender: "female",
    region: "Bắc",
    style: "Phong cách tự nhiên",
    hfVoice: "Trúc Ly",
    fallbackEdgeVoice: "vi-VN-HoaiMyNeural",
  }),
  Object.freeze({
    id: "maianh",
    label: "Mai Anh",
    shortLabel: "Nữ · Bắc · Tin tức rõ chữ",
    gender: "female",
    region: "Bắc",
    style: "Phong cách tin tức rõ chữ",
    hfVoice: "Mai Anh",
    fallbackEdgeVoice: "vi-VN-HoaiMyNeural",
  }),
  Object.freeze({
    id: "haidang",
    label: "Hải Đăng",
    shortLabel: "Nam · Bắc · Tự nhiên",
    gender: "male",
    region: "Bắc",
    style: "Phong cách tự nhiên",
    hfVoice: "Hải Đăng",
    fallbackEdgeVoice: "vi-VN-NamMinhNeural",
  }),
  Object.freeze({
    id: "thienminh",
    label: "Thiện Minh",
    shortLabel: "Nam · Bắc · Kể chuyện",
    gender: "male",
    region: "Bắc",
    style: "Phong cách kể chuyện",
    hfVoice: "Thiện Minh",
    fallbackEdgeVoice: "vi-VN-NamMinhNeural",
  }),
]);

export const RANDOM_VOICE_OPTION = Object.freeze({
  id: RANDOM_VOICE_ID,
  label: "Ngẫu nhiên",
  shortLabel: "Xoay vòng 5 giọng Bắc",
  gender: "mixed",
  region: "Bắc",
  style: "Tự động chọn trong 5 giọng Miền Bắc",
});

export const VOICE_OPTIONS = Object.freeze([
  RANDOM_VOICE_OPTION,
  ...VIETNAMESE_VOICES,
]);

const VOICE_META_BY_ID = new Map(VOICE_OPTIONS.map((v) => [v.id, v]));

const VOICE_ALIAS_MAP = Object.freeze({
  random: RANDOM_VOICE_ID,
  ngaunhien: RANDOM_VOICE_ID,
  auto: RANDOM_VOICE_ID,
  shuffle: RANDOM_VOICE_ID,
  ngochuyen: "ngochuyen",
  trucly: "trucly",
  maianh: "maianh",
  haidang: "haidang",
  thienminh: "thienminh",
  // Legacy Microsoft Edge migration
  hoaimy: "ngochuyen",
  vivnhoaimyneural: "ngochuyen",
  female: "ngochuyen",
  nu: "ngochuyen",
  namminh: "haidang",
  vivnnamminhneural: "haidang",
  male: "haidang",
  nam: "haidang",
});

const audioBlobCache = new Map();
const inFlightFetches = new Map();
const prefetchQueue = [];
const queuedPrefetchKeys = new Set();

let activePrefetchCount = 0;
let activeHighPriorityFetches = 0;

let playbackSeq = 0;
let activeAudio = null;
let activeResolve = null;
let activeFetchController = null;

function cleanTtsText(text) {
  return normalizeTtsText(text);
}

function getSupabasePublicUrl() {
  return String(import.meta.env?.VITE_SUPABASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
}

export function normalizeVoiceId(rawVoice) {
  if (typeof rawVoice !== "string") return DEFAULT_VOICE_ID;
  const canonical = rawVoice
    .trim()
    .replace(/^['"]+|['"]+$/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  if (VOICE_ALIAS_MAP[canonical]) {
    return VOICE_ALIAS_MAP[canonical];
  }
  if (canonical.includes("namminh")) return "haidang";
  if (canonical.includes("hoaimy")) return "ngochuyen";
  return DEFAULT_VOICE_ID;
}

/**
 * Resolve a requested voice ID (`'random'` or one of the 5 Northern voices) into
 * a concrete Northern Vietnamese voice ID for caching and `/api/tts` calls.
 *
 * @param {string} [rawVoice]
 * @param {string} [text=""]
 * @returns {"ngochuyen" | "trucly" | "maianh" | "haidang" | "thienminh"}
 */
export function resolveEffectiveVoice(rawVoice, text = "") {
  const normalized = normalizeVoiceId(rawVoice ?? getSelectedVoice());
  if (normalized === RANDOM_VOICE_ID) {
    return pickRandomVoiceForText(text);
  }
  return normalized;
}

/**
 * Return metadata for a voice ID (`'random'` or one of the 5 Northern voices;
 * defaults to the currently selected voice).
 * @param {string} [voiceId]
 */
export function getVoiceMeta(voiceId) {
  const resolved = voiceId === undefined ? getSelectedVoice() : normalizeVoiceId(voiceId);
  return VOICE_META_BY_ID.get(resolved) || RANDOM_VOICE_OPTION;
}

/**
 * Return the currently selected TTS voice preference (`'random'` or one of the 5 Northern IDs).
 * Reads `localStorage` key `'vietflow_tts_voice'` safely, migrating legacy
 * `'hoaimy'` -> `'ngochuyen'` and `'namminh'` -> `'haidang'`, defaulting to `'random'`.
 * @returns {"random" | "ngochuyen" | "trucly" | "maianh" | "haidang" | "thienminh"}
 */
export function getSelectedVoice() {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_VOICE_ID;
  }
  try {
    const stored = window.localStorage.getItem(VOICE_STORAGE_KEY);
    const normalized = normalizeVoiceId(stored);
    if (stored && stored !== normalized) {
      try {
        window.localStorage.setItem(VOICE_STORAGE_KEY, normalized);
      } catch {
        // ignore storage write failures during silent migration
      }
    }
    return normalized;
  } catch {
    return DEFAULT_VOICE_ID;
  }
}

/**
 * Persist the selected TTS voice preference (`'random'` or one of the 5 Northern IDs)
 * and notify mounted components via the custom `window` event `'vietflow:voice-change'`.
 * @param {string} voiceId
 * @returns {"random" | "ngochuyen" | "trucly" | "maianh" | "haidang" | "thienminh"}
 */
export function setSelectedVoice(voiceId) {
  const normalized = normalizeVoiceId(voiceId);

  if (typeof window !== "undefined") {
    try {
      window.localStorage?.setItem(VOICE_STORAGE_KEY, normalized);
    } catch {
      // ignore storage quota/privacy mode errors
    }

    try {
      const event =
        typeof CustomEvent === "function"
          ? new CustomEvent(VOICE_CHANGE_EVENT, { detail: { voice: normalized } })
          : new Event(VOICE_CHANGE_EVENT);
      window.dispatchEvent(event);
    } catch {
      // ignore event dispatch errors in non-DOM runtimes
    }
  }

  return normalized;
}

function clampRate(rate) {
  const num = Number(rate);
  if (!Number.isFinite(num) || num <= 0) return 1;
  return Math.min(1.5, Math.max(0.5, num));
}

function getCacheKey(text, voice) {
  const cleanText = cleanTtsText(text);
  const effectiveVoice = resolveEffectiveVoice(voice, cleanText);
  return `${effectiveVoice}::${cleanText}`;
}

function buildTtsEndpoint(cleanText, resolvedVoice) {
  // Intentionally omit `speed` so Browser Cache API, Vercel CDN, and Supabase Storage
  // share a single deterministic audio clip while `<audio>.playbackRate` adjusts speed smoothly.
  return `/api/tts?text=${encodeURIComponent(cleanText)}&lang=vi&voice=${encodeURIComponent(resolvedVoice)}`;
}

function setCachedBlobUrl(key, url) {
  if (audioBlobCache.has(key)) return;
  if (audioBlobCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = audioBlobCache.keys().next().value;
    const oldestUrl = audioBlobCache.get(oldestKey);
    audioBlobCache.delete(oldestKey);
    if (oldestUrl && typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
      try {
        URL.revokeObjectURL(oldestUrl);
      } catch {
        // ignore
      }
    }
  }
  audioBlobCache.set(key, url);
}

/**
 * Check synchronously whether the audio blob URL (or first sentence of a passage)
 * is already cached in memory for instant 0ms playback.
 * @param {string} text
 * @param {string} [voice]
 * @returns {boolean}
 */
export function isCachedInMemory(text, voice) {
  const cleanText = cleanTtsText(text);
  if (!cleanText) return false;
  const effectiveVoice = resolveEffectiveVoice(voice ?? getSelectedVoice(), cleanText);
  const units = splitVietnameseSentences(cleanText);
  const firstUnit = units[0] || cleanText;
  return audioBlobCache.has(getCacheKey(firstUnit, effectiveVoice));
}

async function openTtsBrowserCache() {
  if (
    typeof window === "undefined" ||
    !window.caches ||
    typeof window.caches.open !== "function"
  ) {
    return null;
  }
  try {
    return await window.caches.open(TTS_BROWSER_CACHE_NAME);
  } catch {
    return null;
  }
}

/**
 * Direct Browser -> Supabase Storage Public CDN fast-path,
 * bypassing Vercel Serverless `/api/tts` whenever a clip is already cached in `tts-cache`.
 * Uses a `4500ms` timeout for initial headers (TTFB) and clears it as soon as `response`
 * headers arrive so an accepted `200 OK` WAV transfer is never aborted mid-download.
 * Returns `null` on miss (`404`), header timeout, or network error so caller falls
 * through seamlessly to `/api/tts`.
 *
 * @param {string} sentenceText
 * @param {string} effectiveVoice
 * @param {AbortSignal} [signal]
 * @returns {Promise<Response | null>}
 */
async function fetchCachedFromSupabase(sentenceText, effectiveVoice, signal) {
  const supabasePublicUrl = getSupabasePublicUrl();
  if (!supabasePublicUrl || typeof fetch !== "function") {
    return null;
  }

  const cachePath = await computeTtsCachePath(effectiveVoice, sentenceText);
  const cdnUrl = `${supabasePublicUrl}/storage/v1/object/public/tts-cache/${cachePath}`;

  if (signal?.aborted) {
    const abortErr = new Error("TTS request aborted");
    abortErr.name = "AbortError";
    throw abortErr;
  }

  const controller = typeof AbortController === "function" ? new AbortController() : null;
  let timedOut = false;
  let timerId = controller
    ? setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, SUPABASE_CDN_TIMEOUT_MS)
    : null;

  const onOuterAbort = () => {
    if (controller && !controller.signal.aborted) {
      controller.abort();
    }
  };
  if (signal) {
    signal.addEventListener?.("abort", onOuterAbort, { once: true });
  }

  try {
    const response = await fetch(cdnUrl, {
      method: "GET",
      headers: {
        Accept: "audio/wav, audio/x-wav, audio/*;q=0.9, */*;q=0.5",
      },
      ...(controller ? { signal: controller.signal } : {}),
    });

    // Clear TTFB header timeout immediately once response headers arrive so valid
    // 200 OK WAV body streams are never prematurely aborted mid-download.
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }

    if (!response || !response.ok) {
      return null;
    }

    const contentType = String(response.headers?.get?.("content-type") || "").toLowerCase();
    if (contentType && !contentType.includes("audio") && !contentType.includes("octet-stream")) {
      return null;
    }

    return response;
  } catch (err) {
    if (signal?.aborted && !timedOut) {
      throw err;
    }
    return null;
  } finally {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    signal?.removeEventListener?.("abort", onOuterAbort);
  }
}

/**
 * Fetch or retrieve a cached Blob URL for `(effectiveVoice, sentenceText)` in ultra-fast order:
 * 1. In-memory `audioBlobCache` (0ms)
 * 2. Browser Cache API (`vietflow-tts-v2`, ~2-5ms)
 * 3. In-flight Promise deduplication (`inFlightFetches`)
 * 4. Direct Supabase Storage Public CDN (`tts-cache`, ~60-150ms)
 * 5. Network `GET /api/tts?text=...&lang=vi&voice=...`
 *
 * @param {string} sentenceText
 * @param {string} resolvedVoice
 * @param {{ signal?: AbortSignal }} [options={}]
 * @returns {Promise<string>}
 */
async function resolveAudioForUnit(sentenceText, resolvedVoice, { signal } = {}) {
  const cleanText = cleanTtsText(sentenceText);
  const effectiveVoice = resolveEffectiveVoice(resolvedVoice, cleanText);
  const cacheKey = getCacheKey(cleanText, effectiveVoice);

  // 1. In-memory Blob URL cache (0ms)
  const memHit = audioBlobCache.get(cacheKey);
  if (memHit) {
    return memHit;
  }

  // 3. Join existing in-flight fetch immediately (avoids duplicate Cache API or network work)
  const existingPromise = inFlightFetches.get(cacheKey);
  if (existingPromise) {
    return existingPromise;
  }

  const fetchPromise = (async () => {
    if (
      typeof URL === "undefined" ||
      typeof URL.createObjectURL !== "function"
    ) {
      throw new Error("Object URL API unavailable");
    }

    const endpoint = buildTtsEndpoint(cleanText, effectiveVoice);
    const browserCache =
      typeof window !== "undefined" &&
      window.caches &&
      typeof window.caches.open === "function"
        ? await openTtsBrowserCache()
        : null;

    // 2. Persistent Browser Cache API (~2-5ms)
    if (browserCache) {
      try {
        const cachedResponse = await browserCache.match(endpoint);
        if (cachedResponse && cachedResponse.ok) {
          const cachedBlob = await cachedResponse.blob();
          if (cachedBlob && cachedBlob.size > 0) {
            const cachedUrl = URL.createObjectURL(cachedBlob);
            setCachedBlobUrl(cacheKey, cachedUrl);
            return cachedUrl;
          }
        }
      } catch {
        // Ignore Browser Cache read failures and proceed to network
      }
    }

    if (signal?.aborted) {
      const abortErr = new Error("TTS request aborted");
      abortErr.name = "AbortError";
      throw abortErr;
    }

    if (typeof fetch !== "function") {
      throw new Error("Fetch API unavailable");
    }

    // 4. Direct Browser -> Supabase Storage Public CDN (skips Vercel Serverless)
    let blob = null;
    let responseForCache = null;

    const cdnResponse = await fetchCachedFromSupabase(cleanText, effectiveVoice, signal);
    if (cdnResponse) {
      try {
        const cdnClone =
          browserCache && typeof cdnResponse.clone === "function"
            ? cdnResponse.clone()
            : null;
        const cdnBlob = await cdnResponse.blob();
        if (cdnBlob && cdnBlob.size > 0) {
          blob = cdnBlob;
          responseForCache = cdnClone;
        }
      } catch (err) {
        if (signal?.aborted) {
          throw err;
        }
        // Transient CDN body stream error -> fall through cleanly to /api/tts
      }
    }

    // 5. Fallback to Vercel Serverless `/api/tts` (generates via VieNeu-TTS HF & persists to Supabase)
    if (!blob) {
      if (signal?.aborted) {
        const abortErr = new Error("TTS request aborted");
        abortErr.name = "AbortError";
        throw abortErr;
      }

      const fetchInit = signal ? { method: "GET", signal } : { method: "GET" };
      const response = await fetch(endpoint, fetchInit);
      if (!response || !response.ok) {
        throw new Error(`TTS API failed with HTTP ${response?.status ?? "unknown"}`);
      }

      const contentType = String(response.headers?.get?.("content-type") || "").toLowerCase();
      if (contentType && !contentType.includes("audio") && !contentType.includes("octet-stream")) {
        throw new Error(`Unexpected TTS content-type: ${contentType}`);
      }

      responseForCache =
        browserCache && typeof response.clone === "function" ? response.clone() : null;

      blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error("TTS API returned empty audio blob");
      }
    }

    if (browserCache && responseForCache) {
      try {
        const putResult = browserCache.put(endpoint, responseForCache);
        if (putResult && typeof putResult.catch === "function") {
          putResult.catch(() => {});
        }
      } catch {
        // Ignore cache write errors (private mode / quota)
      }
    }

    const blobUrl = URL.createObjectURL(blob);
    setCachedBlobUrl(cacheKey, blobUrl);
    return blobUrl;
  })();

  inFlightFetches.set(cacheKey, fetchPromise);

  try {
    return await fetchPromise;
  } finally {
    if (inFlightFetches.get(cacheKey) === fetchPromise) {
      inFlightFetches.delete(cacheKey);
    }
  }
}

function pumpPrefetchQueue() {
  // Yield cleanly whenever an interactive speakVietnamese() fetch is in progress
  if (activeHighPriorityFetches > 0) return;

  while (activePrefetchCount < MAX_PREFETCH_CONCURRENCY && prefetchQueue.length > 0) {
    const item = prefetchQueue.shift();
    if (!item) break;
    queuedPrefetchKeys.delete(item.cacheKey);

    if (audioBlobCache.has(item.cacheKey) || inFlightFetches.has(item.cacheKey)) {
      continue;
    }

    activePrefetchCount += 1;
    resolveAudioForUnit(item.cleanText, item.voice)
      .catch(() => {
        // Background prefetch must fail silently
      })
      .finally(() => {
        activePrefetchCount = Math.max(0, activePrefetchCount - 1);
        pumpPrefetchQueue();
      });
  }
}

/**
 * Quietly pre-fetch Vietnamese audio clips into Browser Cache API + memory
 * so clicking Speak plays instantaneously (`0ms`).
 * - Expands multi-sentence passages with `splitVietnameseSentences` and prioritizes
 *   the FIRST sentence of the first text ahead of later sentences.
 * - Deduplicates & promotes already-queued items when they become current.
 * - Runs at low concurrency (`maxConcurrent = 2`) and yields while `speakVietnamese` fetches.
 *
 * @param {string | string[]} texts
 * @param {{ voice?: string }} [options={}]
 */
export function prefetchVietnamese(texts, options = {}) {
  if (
    typeof fetch !== "function" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return;
  }

  const rawList = Array.isArray(texts) ? texts : [texts];
  if (rawList.length === 0) return;

  const requestedVoice = normalizeVoiceId(options?.voice ?? getSelectedVoice());
  const seenInBatch = new Set();
  const batchItems = [];

  for (const entry of rawList) {
    if (typeof entry !== "string") continue;
    const fullClean = cleanTtsText(entry);
    if (!fullClean || fullClean.length > MAX_TTS_TEXT_LENGTH) continue;

    const passageVoice = resolveEffectiveVoice(requestedVoice, fullClean);
    const sentences = splitVietnameseSentences(fullClean);

    for (const sentence of sentences) {
      const cacheKey = getCacheKey(sentence, passageVoice);
      if (
        seenInBatch.has(cacheKey) ||
        audioBlobCache.has(cacheKey) ||
        inFlightFetches.has(cacheKey)
      ) {
        continue;
      }

      // Promote already-queued items so current screen's first sentence always runs first
      if (queuedPrefetchKeys.has(cacheKey)) {
        const existingIdx = prefetchQueue.findIndex((q) => q.cacheKey === cacheKey);
        if (existingIdx >= 0) {
          prefetchQueue.splice(existingIdx, 1);
        }
        queuedPrefetchKeys.delete(cacheKey);
      }

      seenInBatch.add(cacheKey);
      batchItems.push({ cleanText: sentence, voice: passageVoice, cacheKey });
    }
  }

  if (batchItems.length > 0) {
    for (let i = batchItems.length - 1; i >= 0; i -= 1) {
      const item = batchItems[i];
      prefetchQueue.unshift(item);
      queuedPrefetchKeys.add(item.cacheKey);
    }

    while (prefetchQueue.length > MAX_PREFETCH_QUEUE_SIZE) {
      const dropped = prefetchQueue.pop();
      if (dropped) queuedPrefetchKeys.delete(dropped.cacheKey);
    }
  }

  pumpPrefetchQueue();
}

/**
 * Revoke and clear cached TTS blob URLs, pending prefetch queue, and in-flight trackers.
 */
export function clearTtsCache() {
  for (const url of audioBlobCache.values()) {
    if (url && typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    }
  }
  audioBlobCache.clear();
  inFlightFetches.clear();
  prefetchQueue.length = 0;
  queuedPrefetchKeys.clear();
  activePrefetchCount = 0;
  activeHighPriorityFetches = 0;
}

/**
 * Stop any active Audio playback, pending TTS fetches, or browser SpeechSynthesis utterance immediately.
 */
export function stopSpeaking() {
  playbackSeq += 1;

  if (activeFetchController) {
    try {
      activeFetchController.abort();
    } catch {
      // ignore
    }
    activeFetchController = null;
  }

  if (activeAudio) {
    try {
      activeAudio.onended = null;
      activeAudio.onerror = null;
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activeAudio = null;
  }

  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  if (activeResolve) {
    const resolvePrev = activeResolve;
    activeResolve = null;
    resolvePrev({ source: "none", stopped: true });
  }
}

/**
 * Return available Vietnamese voices from `window.speechSynthesis` safely.
 * Returns an empty array in SSR/jsdom or unsupported browsers.
 * @returns {SpeechSynthesisVoice[]}
 */
export function getVietnameseVoices() {
  if (
    typeof window === "undefined" ||
    !window.speechSynthesis ||
    typeof window.speechSynthesis.getVoices !== "function"
  ) {
    return [];
  }

  try {
    const voices = window.speechSynthesis.getVoices() || [];
    return voices
      .filter((v) => {
        const lang = String(v?.lang || "").toLowerCase();
        const name = String(v?.name || "").toLowerCase();
        return (
          lang.startsWith("vi") ||
          name.includes("vietnam") ||
          name.includes("tiếng việt")
        );
      })
      .sort((a, b) => {
        const aExact = String(a?.lang || "").toLowerCase() === "vi-vn" ? 0 : 1;
        const bExact = String(b?.lang || "").toLowerCase() === "vi-vn" ? 0 : 1;
        return aExact - bExact;
      });
  } catch {
    return [];
  }
}

/**
 * Play a single resolved audio Blob URL via HTMLAudioElement with pitch-preserved playbackRate.
 */
function playAudioBlobUnit(blobUrl, rate, token, { isFirst, onPlayStart, onStart }) {
  if (token !== playbackSeq || !blobUrl) {
    return Promise.resolve({ source: "api", stopped: true });
  }

  return new Promise((resolve, reject) => {
    const audio = new Audio(blobUrl);
    audio.playbackRate = rate;
    if ("preservesPitch" in audio) audio.preservesPitch = true;
    if ("mozPreservesPitch" in audio) audio.mozPreservesPitch = true;
    if ("webkitPreservesPitch" in audio) audio.webkitPreservesPitch = true;

    activeAudio = audio;
    let settled = false;

    const finish = (result, shouldReject = false, err = null) => {
      if (settled) return;
      settled = true;
      if (activeAudio === audio) activeAudio = null;
      if (activeResolve === stopWrapper) activeResolve = null;
      audio.onended = null;
      audio.onerror = null;

      if (shouldReject) {
        reject(err);
      } else {
        resolve(result);
      }
    };

    const stopWrapper = () => finish({ source: "api", stopped: true });
    activeResolve = stopWrapper;

    audio.onended = () => finish({ source: "api" });
    audio.onerror = () => finish(null, true, new Error("HTMLAudioElement playback failed"));

    if (isFirst) {
      onPlayStart?.({ source: "api" });
      onStart?.({ source: "api" });
    }

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((err) => {
        if (token !== playbackSeq) {
          finish({ source: "api", stopped: true });
        } else {
          finish(null, true, err);
        }
      });
    }
  });
}

/**
 * Play Vietnamese TTS via Direct Supabase CDN / `/api/tts` with sentence-by-sentence
 * pipelining (max 2 sentences ahead) so playback starts as soon as sentence 1 resolves.
 *
 * @param {string[]} sentences
 * @param {number} rate
 * @param {string} passageVoice
 * @param {number} token
 * @param {{ onPlayStart?: Function, onStart?: Function, onEnd?: Function }} callbacks
 * @returns {Promise<{ source: "api", stopped?: boolean }>}
 */
async function speakViaApi(sentences, rate, passageVoice, token, { onPlayStart, onStart, onEnd }) {
  if (
    typeof fetch !== "function" ||
    typeof Audio === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    throw new Error("Audio/Fetch API unavailable");
  }

  const fetchController =
    typeof AbortController === "function" ? new AbortController() : null;
  activeFetchController = fetchController;

  const unitPromises = new Array(sentences.length);
  const ensureUnitFetch = (idx) => {
    if (idx < 0 || idx >= sentences.length) return null;
    if (!unitPromises[idx]) {
      const p = resolveAudioForUnit(sentences[idx], passageVoice, {
        signal: fetchController?.signal,
      });
      // Avoid unhandled rejection if playback stops while lookahead is still running
      p.catch(() => {});
      unitPromises[idx] = p;
    }
    return unitPromises[idx];
  };

  const raceWithStop = async (promise) => {
    activeHighPriorityFetches += 1;
    let cancelFetchWait = null;
    const cancelPromise = new Promise((resolve) => {
      cancelFetchWait = () => resolve(null);
    });
    activeResolve = cancelFetchWait;

    try {
      return await Promise.race([promise, cancelPromise]);
    } finally {
      if (activeResolve === cancelFetchWait) {
        activeResolve = null;
      }
      activeHighPriorityFetches = Math.max(0, activeHighPriorityFetches - 1);
      pumpPrefetchQueue();
    }
  };

  let startedPlayback = false;
  let currentIndex = 0;

  try {
    // Fire sentence[0] FIRST, then kick off lookahead sentences (max 2 ahead) concurrently
    ensureUnitFetch(0);
    for (let ahead = 1; ahead <= PIPELINE_LOOKAHEAD && ahead < sentences.length; ahead += 1) {
      ensureUnitFetch(ahead);
    }

    for (currentIndex = 0; currentIndex < sentences.length; currentIndex += 1) {
      if (token !== playbackSeq) {
        const stoppedRes = { source: "api", stopped: true };
        if (startedPlayback) onEnd?.(stoppedRes);
        return stoppedRes;
      }

      const sentence = sentences[currentIndex];
      const cacheKey = getCacheKey(sentence, passageVoice);
      let blobUrl = audioBlobCache.get(cacheKey);

      for (
        let ahead = currentIndex + 1;
        ahead <= currentIndex + PIPELINE_LOOKAHEAD && ahead < sentences.length;
        ahead += 1
      ) {
        ensureUnitFetch(ahead);
      }

      if (!blobUrl) {
        blobUrl = await raceWithStop(ensureUnitFetch(currentIndex));
      }

      if (token !== playbackSeq || !blobUrl) {
        const stoppedRes = { source: "api", stopped: true };
        if (startedPlayback) onEnd?.(stoppedRes);
        return stoppedRes;
      }

      const playResult = await playAudioBlobUnit(blobUrl, rate, token, {
        isFirst: !startedPlayback,
        onPlayStart,
        onStart,
      });
      startedPlayback = true;

      if (playResult?.stopped || token !== playbackSeq) {
        const stoppedRes = { source: "api", stopped: true };
        onEnd?.(stoppedRes);
        return stoppedRes;
      }
    }

    const doneRes = { source: "api" };
    onEnd?.(doneRes);
    return doneRes;
  } catch (err) {
    if (fetchController && !fetchController.signal.aborted) {
      try {
        fetchController.abort();
      } catch {
        // ignore
      }
    }
    if (token !== playbackSeq) {
      const stoppedRes = { source: "api", stopped: true };
      if (startedPlayback) onEnd?.(stoppedRes);
      return stoppedRes;
    }
    err.startedPlayback = startedPlayback;
    err.failedSentenceIndex = currentIndex;
    throw err;
  } finally {
    if (activeFetchController === fetchController) {
      activeFetchController = null;
    }
  }
}

/**
 * Play Vietnamese TTS via browser `window.speechSynthesis`.
 * @param {string} cleanText
 * @param {number} rate
 * @param {string} voiceName
 * @param {string} voice
 * @param {number} token
 * @param {{ onPlayStart?: Function, onStart?: Function, onEnd?: Function }} callbacks
 * @returns {Promise<{ source: "webspeech", stopped?: boolean }>}
 */
function speakViaWebSpeech(
  cleanText,
  rate,
  voiceName,
  voice,
  token,
  { onPlayStart, onStart, onEnd }
) {
  return new Promise((resolve, reject) => {
    if (
      typeof window === "undefined" ||
      !window.speechSynthesis ||
      typeof window.SpeechSynthesisUtterance !== "function"
    ) {
      reject(new Error("Web Speech synthesis unavailable"));
      return;
    }

    if (token !== playbackSeq) {
      resolve({ source: "webspeech", stopped: true });
      return;
    }

    const utterance = new window.SpeechSynthesisUtterance(cleanText);
    utterance.lang = "vi-VN";
    utterance.rate = rate;

    const viVoices = getVietnameseVoices();
    const effectiveVoice = resolveEffectiveVoice(voice, cleanText);
    const voiceMeta = getVoiceMeta(effectiveVoice);
    let chosenVoice = voiceName
      ? viVoices.find((v) => v.name === voiceName)
      : null;
    if (!chosenVoice && viVoices.length > 0) {
      if (voiceMeta.gender === "male") {
        chosenVoice =
          viVoices.find((v) => /namminh|nam\b|\ban\b|male/i.test(String(v?.name || ""))) ||
          viVoices[0];
      } else {
        chosenVoice =
          viVoices.find((v) => /hoaimy|hoai|linh|mai|female/i.test(String(v?.name || ""))) ||
          viVoices[0];
      }
    }
    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang || "vi-VN";
    }

    let settled = false;
    const finish = (result, shouldReject = false, err = null) => {
      if (settled) return;
      settled = true;
      if (activeResolve === stopWrapper) activeResolve = null;
      if (shouldReject) {
        reject(err);
      } else {
        onEnd?.(result);
        resolve(result);
      }
    };

    const stopWrapper = () => finish({ source: "webspeech", stopped: true });
    activeResolve = stopWrapper;

    utterance.onstart = () => {
      if (token === playbackSeq) {
        onPlayStart?.({ source: "webspeech" });
        onStart?.({ source: "webspeech" });
      }
    };
    utterance.onend = () => finish({ source: "webspeech" });
    utterance.onerror = (event) => {
      const errCode = event?.error;
      if (errCode === "canceled" || errCode === "interrupted" || token !== playbackSeq) {
        finish({ source: "webspeech", stopped: true });
      } else {
        finish(null, true, new Error(`SpeechSynthesis error: ${errCode || "unknown"}`));
      }
    };

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      finish(null, true, err);
    }
  });
}

/**
 * Speak Vietnamese text aloud.
 * Tries memory -> Browser Cache API -> Direct Supabase CDN -> `/api/tts` with
 * sentence-by-sentence pipelining, then falls back to `window.speechSynthesis`.
 * Cancels any currently playing audio and pending fetches before starting.
 *
 * @param {string} text
 * @param {{ rate?: number, voice?: string, voiceName?: string, onPlayStart?: Function, onStart?: Function, onEnd?: Function, onError?: Function }} [options={}]
 * @returns {Promise<{ source: "api" | "webspeech" | "none", stopped?: boolean }>}
 */
export async function speakVietnamese(text, options = {}) {
  const { rate = 1, voice, voiceName = "", onPlayStart, onStart, onEnd, onError } = options;
  const cleanText = cleanTtsText(text);

  stopSpeaking();

  if (!cleanText) {
    const emptyRes = { source: "none" };
    onEnd?.(emptyRes);
    return emptyRes;
  }

  const clampedRate = clampRate(rate);
  const effectiveVoice = resolveEffectiveVoice(voice ?? getSelectedVoice(), cleanText);
  const sentences = splitVietnameseSentences(cleanText);
  const myToken = playbackSeq;

  let fallbackText = cleanText;
  let alreadyStarted = false;

  // 1. Primary path: direct Supabase CDN / `/api/tts` with sentence pipelining
  try {
    const apiResult = await speakViaApi(sentences, clampedRate, effectiveVoice, myToken, {
      onPlayStart,
      onStart,
      onEnd,
    });
    return apiResult;
  } catch (apiErr) {
    if (myToken !== playbackSeq) {
      return { source: "api", stopped: true };
    }
    if (apiErr?.startedPlayback && typeof apiErr.failedSentenceIndex === "number") {
      alreadyStarted = true;
      fallbackText = sentences.slice(apiErr.failedSentenceIndex).join(" ").trim() || cleanText;
    }
  }

  // 2. Fallback path: Browser Web Speech API (preferring vi-VN voice matching gender)
  try {
    const webResult = await speakViaWebSpeech(
      fallbackText,
      clampedRate,
      voiceName,
      effectiveVoice,
      myToken,
      {
        onPlayStart: alreadyStarted ? undefined : onPlayStart,
        onStart: alreadyStarted ? undefined : onStart,
        onEnd,
      }
    );
    return webResult;
  } catch (webErr) {
    if (myToken !== playbackSeq) {
      return { source: "webspeech", stopped: true };
    }
    const fallbackError =
      webErr instanceof Error
        ? webErr
        : new Error("Không thể phát âm tiếng Việt trên trình duyệt này.");
    onError?.(fallbackError);
    const noneRes = { source: "none" };
    onEnd?.(noneRes);
    return noneRes;
  }
}

/**
 * Check whether browser SpeechRecognition is available.
 * @returns {boolean}
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

const STT_ERROR_MESSAGES_VI = Object.freeze({
  "not-allowed":
    "Bạn chưa cấp quyền sử dụng micro. Hãy cho phép Micro trên thanh địa chỉ trình duyệt rồi thử lại.",
  "service-not-allowed":
    "Trình duyệt đã chặn dịch vụ nhận diện giọng nói. Hãy kiểm tra cài đặt quyền Micro.",
  "no-speech":
    "Không nghe thấy giọng nói. Hãy lại gần micro và nói rõ tiếng Việt hơn nhé.",
  "audio-capture":
    "Không tìm thấy thiết bị micro. Hãy kiểm tra kết nối micro của bạn.",
  network:
    "Lỗi kết nối mạng khi nhận diện giọng nói. Vui lòng kiểm tra Internet rồi thử lại.",
});

/**
 * Start Vietnamese speech recognition (`lang = 'vi-VN'`, `interimResults = true`).
 *
 * @param {{
 *   onInterim?: (transcript: string) => void,
 *   onResult?: (transcript: string, meta?: { confidence: number, alternatives: string[], isFinal: boolean }) => void,
 *   onError?: (messageVi: string, code?: string) => void,
 *   onEnd?: () => void,
 *   continuous?: boolean,
 *   maxDurationMs?: number,
 * }} [options={}]
 * @returns {{ stop: () => void, abort: () => void }}
 */
export function startVietnameseListening(options = {}) {
  const {
    onInterim,
    onResult,
    onError,
    onEnd,
    continuous = false,
    maxDurationMs = 10000,
  } = options;

  if (!isSpeechRecognitionSupported()) {
    onError?.(
      "Trình duyệt hiện tại chưa hỗ trợ nhận diện giọng nói tiếng Việt. Hãy dùng Chrome/Edge hoặc chế độ nhập văn bản.",
      "unsupported"
    );
    onEnd?.();
    return { stop() {}, abort() {} };
  }

  const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new RecognitionCtor();
  recognition.lang = "vi-VN";
  recognition.interimResults = true;
  recognition.continuous = Boolean(continuous);
  recognition.maxAlternatives = 3;

  let finished = false;
  let manuallyAborted = false;
  let emittedFinal = false;
  let accumulatedFinal = "";
  let latestInterim = "";
  let latestConfidence = 0;
  let latestAlternatives = [];
  let timerId = null;

  const clearTimer = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const finalize = () => {
    if (finished) return;
    finished = true;
    clearTimer();

    if (!manuallyAborted && !emittedFinal) {
      const fallbackText = (accumulatedFinal || latestInterim).trim();
      if (fallbackText) {
        emittedFinal = true;
        onResult?.(fallbackText, {
          confidence: latestConfidence,
          alternatives: latestAlternatives,
          isFinal: true,
        });
      }
    }

    onEnd?.();
  };

  recognition.onresult = (event) => {
    let sessionFinal = "";
    let sessionInterim = "";
    let bestConfidence = 0;
    const alternatives = [];

    for (let i = 0; i < event.results.length; i += 1) {
      const res = event.results[i];
      const primary = res?.[0];
      const text = String(primary?.transcript || "").trim();
      if (!text) continue;

      if (res.isFinal) {
        sessionFinal = sessionFinal ? `${sessionFinal} ${text}` : text;
        if (typeof primary?.confidence === "number") {
          bestConfidence = Math.max(bestConfidence, primary.confidence);
        }
        for (let j = 0; j < res.length; j += 1) {
          const altText = String(res[j]?.transcript || "").trim();
          if (altText && !alternatives.includes(altText)) alternatives.push(altText);
        }
      } else {
        sessionInterim = sessionInterim ? `${sessionInterim} ${text}` : text;
      }
    }

    if (sessionFinal) {
      accumulatedFinal = sessionFinal;
      latestConfidence = bestConfidence;
      latestAlternatives = alternatives;
    }
    latestInterim = sessionInterim;

    const preview = [accumulatedFinal, sessionInterim].filter(Boolean).join(" ").trim();
    if (preview) {
      onInterim?.(preview);
    }

    if (sessionFinal) {
      emittedFinal = true;
      onResult?.(sessionFinal, {
        confidence: bestConfidence,
        alternatives,
        isFinal: true,
      });
    }
  };

  recognition.onerror = (event) => {
    const code = String(event?.error || "unknown");
    if (code === "aborted" && manuallyAborted) {
      finalize();
      return;
    }
    const messageVi =
      STT_ERROR_MESSAGES_VI[code] ||
      "Không thể nhận diện giọng nói. Vui lòng thử lại nhé.";
    onError?.(messageVi, code);
    finalize();
  };

  recognition.onend = () => {
    finalize();
  };

  if (Number(maxDurationMs) > 0) {
    timerId = setTimeout(() => {
      try {
        recognition.stop();
      } catch {
        finalize();
      }
    }, Number(maxDurationMs));
  }

  try {
    recognition.start();
  } catch (err) {
    onError?.(
      err?.message || "Không thể khởi động micro nhận diện giọng nói.",
      "start-failed"
    );
    finalize();
    return { stop() {}, abort() {} };
  }

  return {
    stop() {
      clearTimer();
      try {
        recognition.stop();
      } catch {
        finalize();
      }
    },
    abort() {
      manuallyAborted = true;
      clearTimer();
      try {
        recognition.abort();
      } catch {
        finalize();
      }
    },
  };
}

/**
 * Create an optional `MediaRecorder` + Web Audio `AnalyserNode` helper for
 * live microphone volume level (`0..1`) and self-playback recordings.
 * Degrades gracefully without throwing when unsupported or permission is denied.
 *
 * @returns {{
 *   start: () => Promise<boolean>,
 *   stop: () => Promise<{ audioUrl: string, blob: Blob } | null>,
 *   getLevel: () => number,
 *   cleanup: () => void,
 * }}
 */
export function createAudioRecorder() {
  let stream = null;
  let mediaRecorder = null;
  let audioContext = null;
  let analyser = null;
  let dataArray = null;
  let chunks = [];
  let isActive = false;

  const stopTracksAndAudio = () => {
    if (stream) {
      try {
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        // ignore
      }
      stream = null;
    }
    if (audioContext) {
      try {
        if (audioContext.state !== "closed") {
          audioContext.close().catch(() => {});
        }
      } catch {
        // ignore
      }
      audioContext = null;
    }
    analyser = null;
    dataArray = null;
    isActive = false;
  };

  return {
    async start() {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        return false;
      }

      stopTracksAndAudio();
      chunks = [];

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        isActive = true;

        const AudioCtx =
          typeof window !== "undefined"
            ? window.AudioContext || window.webkitAudioContext
            : null;
        if (AudioCtx) {
          try {
            audioContext = new AudioCtx();
            const source = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.75;
            source.connect(analyser);
            dataArray = new Uint8Array(analyser.frequencyBinCount);
          } catch {
            analyser = null;
          }
        }

        if (typeof MediaRecorder !== "undefined") {
          try {
            const preferredTypes = [
              "audio/webm;codecs=opus",
              "audio/webm",
              "audio/mp4",
              "audio/ogg",
            ];
            const supportedMime =
              typeof MediaRecorder.isTypeSupported === "function"
                ? preferredTypes.find((t) => MediaRecorder.isTypeSupported(t))
                : undefined;

            mediaRecorder = supportedMime
              ? new MediaRecorder(stream, { mimeType: supportedMime })
              : new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
              if (event?.data && event.data.size > 0) {
                chunks.push(event.data);
              }
            };
            mediaRecorder.start();
          } catch {
            mediaRecorder = null;
          }
        }

        return true;
      } catch {
        stopTracksAndAudio();
        return false;
      }
    },

    async stop() {
      if (!isActive && !mediaRecorder) {
        return null;
      }

      const recorder = mediaRecorder;
      mediaRecorder = null;

      if (!recorder || recorder.state === "inactive") {
        stopTracksAndAudio();
        return null;
      }

      return new Promise((resolve) => {
        const finalizeBlob = () => {
          const mimeType = recorder.mimeType || "audio/webm";
          const recordedChunks = chunks;
          chunks = [];
          stopTracksAndAudio();

          if (
            recordedChunks.length === 0 ||
            typeof Blob === "undefined" ||
            typeof URL === "undefined" ||
            typeof URL.createObjectURL !== "function"
          ) {
            resolve(null);
            return;
          }

          try {
            const blob = new Blob(recordedChunks, { type: mimeType });
            if (blob.size === 0) {
              resolve(null);
              return;
            }
            const audioUrl = URL.createObjectURL(blob);
            resolve({ audioUrl, blob });
          } catch {
            resolve(null);
          }
        };

        recorder.onstop = finalizeBlob;
        recorder.onerror = () => {
          chunks = [];
          stopTracksAndAudio();
          resolve(null);
        };

        try {
          recorder.stop();
        } catch {
          finalizeBlob();
        }
      });
    },

    getLevel() {
      if (!isActive || !analyser || !dataArray) return 0;
      try {
        analyser.getByteTimeDomainData(dataArray);
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i += 1) {
          const centered = (dataArray[i] - 128) / 128;
          sumSquares += centered * centered;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        return Math.min(1, Math.max(0, Number((rms * 3.8).toFixed(3))));
      } catch {
        return 0;
      }
    },

    cleanup() {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        try {
          mediaRecorder.onstop = null;
          mediaRecorder.ondataavailable = null;
          mediaRecorder.stop();
        } catch {
          // ignore
        }
      }
      mediaRecorder = null;
      chunks = [];
      stopTracksAndAudio();
    },
  };
}
