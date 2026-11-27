/**
 * Vietnamese Speech Synthesis (TTS) & Speech Recognition (STT) Engine.
 * - TTS prefers `/api/tts` (VieNeu-TTS-v3-Turbo Northern Vietnamese voices with
 *   3-tier caching: in-memory Blob URL -> Browser Cache API -> Supabase/HF/Edge),
 *   in-flight request deduplication, low-priority background pre-fetching, and
 *   automatic browser `window.speechSynthesis` (`vi-VN`) fallback.
 * - STT wraps `SpeechRecognition || webkitSpeechRecognition` with `lang = 'vi-VN'`.
 * - Optional `MediaRecorder` + Web Audio `AnalyserNode` helper for mic meter & self-playback.
 */

const MAX_CACHE_ENTRIES = 160;
const MAX_PREFETCH_CONCURRENCY = 2;
const MAX_PREFETCH_QUEUE_SIZE = 40;
const MAX_TTS_TEXT_LENGTH = 1000;

export const TTS_BROWSER_CACHE_NAME = "vietflow-tts-v2";
export const VOICE_STORAGE_KEY = "vietflow_tts_voice";
export const VOICE_CHANGE_EVENT = "vietflow:voice-change";

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
    shortLabel: "Nữ · Bắc · Tin tức",
    gender: "female",
    region: "Bắc",
    style: "Phong cách tin tức",
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

const DEFAULT_VOICE_ID = "ngochuyen";
const VOICE_META_BY_ID = new Map(VIETNAMESE_VOICES.map((v) => [v.id, v]));

const VOICE_ALIAS_MAP = Object.freeze({
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

function normalizeVoiceId(rawVoice) {
  if (typeof rawVoice !== "string") return DEFAULT_VOICE_ID;
  const canonical = rawVoice
    .trim()
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
 * Return metadata for a Northern Vietnamese voice ID (defaults to current selected voice).
 * @param {string} [voiceId]
 */
export function getVoiceMeta(voiceId) {
  const resolved = voiceId === undefined ? getSelectedVoice() : normalizeVoiceId(voiceId);
  return VOICE_META_BY_ID.get(resolved) || VIETNAMESE_VOICES[0];
}

/**
 * Return the currently selected Northern Vietnamese TTS voice ID.
 * Reads `localStorage` key `'vietflow_tts_voice'` safely, migrating legacy
 * `'hoaimy'` -> `'ngochuyen'` and `'namminh'` -> `'haidang'`, defaulting to `'ngochuyen'`.
 * @returns {"ngochuyen" | "trucly" | "maianh" | "haidang" | "thienminh"}
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
 * Persist the selected Northern Vietnamese TTS voice ID and notify mounted components
 * via the custom `window` event `'vietflow:voice-change'`.
 * @param {string} voiceId
 * @returns {"ngochuyen" | "trucly" | "maianh" | "haidang" | "thienminh"}
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

function cleanTtsText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function getCacheKey(text, voice) {
  return `${normalizeVoiceId(voice)}::${cleanTtsText(text)}`;
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
 * Check synchronously whether an audio blob URL is already cached in memory
 * for instant 0ms playback.
 * @param {string} text
 * @param {string} [voice]
 * @returns {boolean}
 */
export function isCachedInMemory(text, voice) {
  const cleanText = cleanTtsText(text);
  if (!cleanText) return false;
  const resolvedVoice = normalizeVoiceId(voice ?? getSelectedVoice());
  return audioBlobCache.has(getCacheKey(cleanText, resolvedVoice));
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
 * Fetch or retrieve a cached Blob URL for `(resolvedVoice, cleanText)` using:
 * 1. In-memory `audioBlobCache` (0ms)
 * 2. In-flight Promise deduplication (`inFlightFetches`)
 * 3. Persistent Browser Cache API (`vietflow-tts-v2`)
 * 4. Network `GET /api/tts?text=...&lang=vi&voice=...`
 *
 * @param {string} cleanText
 * @param {string} resolvedVoice
 * @returns {Promise<string>}
 */
async function resolveAudioBlobUrl(cleanText, resolvedVoice) {
  const cacheKey = getCacheKey(cleanText, resolvedVoice);

  const memHit = audioBlobCache.get(cacheKey);
  if (memHit) {
    return memHit;
  }

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

    const endpoint = buildTtsEndpoint(cleanText, resolvedVoice);
    const browserCache =
      typeof window !== "undefined" &&
      window.caches &&
      typeof window.caches.open === "function"
        ? await openTtsBrowserCache()
        : null;

    // Check persistent Browser Cache API first
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

    if (typeof fetch !== "function") {
      throw new Error("Fetch API unavailable");
    }

    const response = await fetch(endpoint, { method: "GET" });
    if (!response || !response.ok) {
      throw new Error(`TTS API failed with HTTP ${response?.status ?? "unknown"}`);
    }

    const contentType = String(response.headers?.get?.("content-type") || "").toLowerCase();
    if (contentType && !contentType.includes("audio") && !contentType.includes("octet-stream")) {
      throw new Error(`Unexpected TTS content-type: ${contentType}`);
    }

    const responseForCache =
      browserCache && typeof response.clone === "function" ? response.clone() : null;

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error("TTS API returned empty audio blob");
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
    resolveAudioBlobUrl(item.cleanText, item.voice)
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
 * - Accepts a single string or an array of strings.
 * - Deduplicates & skips items already in memory, in-flight, or queued.
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

  const resolvedVoice = normalizeVoiceId(options?.voice ?? getSelectedVoice());
  const seenInBatch = new Set();

  for (const entry of rawList) {
    if (typeof entry !== "string") continue;
    const cleanText = cleanTtsText(entry);
    if (!cleanText || cleanText.length > MAX_TTS_TEXT_LENGTH) continue;

    const cacheKey = getCacheKey(cleanText, resolvedVoice);
    if (
      seenInBatch.has(cacheKey) ||
      audioBlobCache.has(cacheKey) ||
      inFlightFetches.has(cacheKey) ||
      queuedPrefetchKeys.has(cacheKey)
    ) {
      continue;
    }

    seenInBatch.add(cacheKey);

    // Keep queue focused on the most recent study screen if user navigates quickly
    while (prefetchQueue.length >= MAX_PREFETCH_QUEUE_SIZE) {
      const dropped = prefetchQueue.shift();
      if (dropped) queuedPrefetchKeys.delete(dropped.cacheKey);
    }

    prefetchQueue.push({ cleanText, voice: resolvedVoice, cacheKey });
    queuedPrefetchKeys.add(cacheKey);
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
 * Stop any active Audio playback or browser SpeechSynthesis utterance immediately.
 */
export function stopSpeaking() {
  playbackSeq += 1;

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
 * Play Vietnamese TTS via `/api/tts` with 2-layer client caching (memory + Cache API),
 * in-flight deduplication, and pitch-preserved client-side `playbackRate`.
 * @param {string} cleanText
 * @param {number} rate
 * @param {string} voice
 * @param {number} token
 * @param {{ onStart?: Function, onEnd?: Function }} callbacks
 * @returns {Promise<{ source: "api", stopped?: boolean }>}
 */
async function speakViaApi(cleanText, rate, voice, token, { onStart, onEnd }) {
  if (
    typeof fetch !== "function" ||
    typeof Audio === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    throw new Error("Audio/Fetch API unavailable");
  }

  const resolvedVoice = normalizeVoiceId(voice);
  const cacheKey = getCacheKey(cleanText, resolvedVoice);
  let blobUrl = audioBlobCache.get(cacheKey);

  if (!blobUrl) {
    activeHighPriorityFetches += 1;
    let cancelFetchWait = null;
    const cancelPromise = new Promise((resolve) => {
      cancelFetchWait = () => resolve(null);
    });
    activeResolve = cancelFetchWait;

    try {
      blobUrl = await Promise.race([
        resolveAudioBlobUrl(cleanText, resolvedVoice),
        cancelPromise,
      ]);
    } finally {
      if (activeResolve === cancelFetchWait) {
        activeResolve = null;
      }
      activeHighPriorityFetches = Math.max(0, activeHighPriorityFetches - 1);
      pumpPrefetchQueue();
    }
  }

  if (token !== playbackSeq || !blobUrl) {
    return { source: "api", stopped: true };
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
        onEnd?.(result);
        resolve(result);
      }
    };

    const stopWrapper = () => finish({ source: "api", stopped: true });
    activeResolve = stopWrapper;

    audio.onended = () => finish({ source: "api" });
    audio.onerror = () => finish(null, true, new Error("HTMLAudioElement playback failed"));

    onStart?.({ source: "api" });

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
 * Play Vietnamese TTS via browser `window.speechSynthesis`.
 * @param {string} cleanText
 * @param {number} rate
 * @param {string} voiceName
 * @param {string} voice
 * @param {number} token
 * @param {{ onStart?: Function, onEnd?: Function }} callbacks
 * @returns {Promise<{ source: "webspeech", stopped?: boolean }>}
 */
function speakViaWebSpeech(cleanText, rate, voiceName, voice, token, { onStart, onEnd }) {
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
    const voiceMeta = getVoiceMeta(voice);
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
 * Tries `/api/tts` first (memory + Cache API + in-flight dedup), then falls back
 * to `window.speechSynthesis`. Cancels any currently playing audio before starting.
 *
 * @param {string} text
 * @param {{ rate?: number, voice?: string, voiceName?: string, onStart?: Function, onEnd?: Function, onError?: Function }} [options={}]
 * @returns {Promise<{ source: "api" | "webspeech" | "none", stopped?: boolean }>}
 */
export async function speakVietnamese(text, options = {}) {
  const { rate = 1, voice, voiceName = "", onStart, onEnd, onError } = options;
  const cleanText = cleanTtsText(text);

  stopSpeaking();

  if (!cleanText) {
    const emptyRes = { source: "none" };
    onEnd?.(emptyRes);
    return emptyRes;
  }

  const clampedRate = clampRate(rate);
  const resolvedVoice = normalizeVoiceId(voice ?? getSelectedVoice());
  const myToken = playbackSeq;

  // 1. Primary path: /api/tts audio (WAV from VieNeu-TTS / cache or MP3 fallback)
  try {
    const apiResult = await speakViaApi(cleanText, clampedRate, resolvedVoice, myToken, {
      onStart,
      onEnd,
    });
    return apiResult;
  } catch (apiErr) {
    if (myToken !== playbackSeq) {
      return { source: "api", stopped: true };
    }
    void apiErr;
  }

  // 2. Fallback path: Browser Web Speech API (preferring vi-VN voice matching gender)
  try {
    const webResult = await speakViaWebSpeech(
      cleanText,
      clampedRate,
      voiceName,
      resolvedVoice,
      myToken,
      {
        onStart,
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
