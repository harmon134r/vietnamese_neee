/**
 * Vietnamese Speech Synthesis (TTS) & Speech Recognition (STT) Engine.
 * - TTS prefers `/api/tts` (server-proxied Vietnamese MP3 with in-memory blob cache)
 *   and automatically falls back to browser `window.speechSynthesis` (`vi-VN`).
 * - STT wraps `SpeechRecognition || webkitSpeechRecognition` with `lang = 'vi-VN'`.
 * - Optional `MediaRecorder` + Web Audio `AnalyserNode` helper for mic meter & self-playback.
 */

const MAX_CACHE_ENTRIES = 120;
const audioBlobCache = new Map();

let playbackSeq = 0;
let activeAudio = null;
let activeAbortController = null;
let activeResolve = null;

function clampRate(rate) {
  const num = Number(rate);
  if (!Number.isFinite(num) || num <= 0) return 1;
  return Math.min(1.5, Math.max(0.5, num));
}

function getCacheKey(text) {
  return text.trim();
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
 * Revoke and clear cached TTS blob URLs.
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
}

/**
 * Stop any active Audio playback or browser SpeechSynthesis utterance immediately.
 */
export function stopSpeaking() {
  playbackSeq += 1;

  if (activeAbortController) {
    try {
      activeAbortController.abort();
    } catch {
      // ignore
    }
    activeAbortController = null;
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
 * Play Vietnamese TTS via `/api/tts` with in-memory blob URL caching.
 * @param {string} cleanText
 * @param {number} rate
 * @param {number} token
 * @param {{ onStart?: Function, onEnd?: Function }} callbacks
 * @returns {Promise<{ source: "api", stopped?: boolean }>}
 */
async function speakViaApi(cleanText, rate, token, { onStart, onEnd }) {
  if (
    typeof fetch !== "function" ||
    typeof Audio === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    throw new Error("Audio/Fetch API unavailable");
  }

  const cacheKey = getCacheKey(cleanText);
  let blobUrl = audioBlobCache.get(cacheKey);

  if (!blobUrl) {
    const controller = new AbortController();
    activeAbortController = controller;

    // Request speed=1 from upstream and apply exact pitch-preserved playbackRate client-side
    const endpoint = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=vi&speed=1`;
    const response = await fetch(endpoint, {
      method: "GET",
      signal: controller.signal,
    });

    if (activeAbortController === controller) {
      activeAbortController = null;
    }

    if (token !== playbackSeq) {
      return { source: "api", stopped: true };
    }

    if (!response.ok) {
      throw new Error(`TTS API failed with HTTP ${response.status}`);
    }

    const contentType = String(response.headers?.get?.("content-type") || "").toLowerCase();
    if (contentType && !contentType.includes("audio") && !contentType.includes("octet-stream")) {
      throw new Error(`Unexpected TTS content-type: ${contentType}`);
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error("TTS API returned empty audio blob");
    }

    blobUrl = URL.createObjectURL(blob);
    setCachedBlobUrl(cacheKey, blobUrl);
  }

  if (token !== playbackSeq) {
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
 * @param {number} token
 * @param {{ onStart?: Function, onEnd?: Function }} callbacks
 * @returns {Promise<{ source: "webspeech", stopped?: boolean }>}
 */
function speakViaWebSpeech(cleanText, rate, voiceName, token, { onStart, onEnd }) {
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
    const chosenVoice = voiceName
      ? viVoices.find((v) => v.name === voiceName) || viVoices[0]
      : viVoices[0];
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
 * Tries `/api/tts` first (cached MP3 blob URL), then falls back to `window.speechSynthesis`.
 * Cancels any currently playing audio before starting.
 *
 * @param {string} text
 * @param {{ rate?: number, voiceName?: string, onStart?: Function, onEnd?: Function, onError?: Function }} [options={}]
 * @returns {Promise<{ source: "api" | "webspeech" | "none", stopped?: boolean }>}
 */
export async function speakVietnamese(text, options = {}) {
  const { rate = 1, voiceName = "", onStart, onEnd, onError } = options;
  const cleanText = String(text || "").replace(/\s+/g, " ").trim();

  stopSpeaking();

  if (!cleanText) {
    const emptyRes = { source: "none" };
    onEnd?.(emptyRes);
    return emptyRes;
  }

  const clampedRate = clampRate(rate);
  const myToken = playbackSeq;

  // 1. Primary path: /api/tts MP3 audio
  try {
    const apiResult = await speakViaApi(cleanText, clampedRate, myToken, { onStart, onEnd });
    return apiResult;
  } catch (apiErr) {
    if (myToken !== playbackSeq) {
      return { source: "api", stopped: true };
    }
    // Fall through to Web Speech API
    void apiErr;
  }

  // 2. Fallback path: Browser Web Speech API (preferring vi-VN voice)
  try {
    const webResult = await speakViaWebSpeech(cleanText, clampedRate, voiceName, myToken, {
      onStart,
      onEnd,
    });
    return webResult;
  } catch (webErr) {
    if (myToken !== playbackSeq) {
      return { source: "webspeech", stopped: true };
    }
    const fallbackError =
      webErr instanceof Error ? webErr : new Error("Không thể phát âm tiếng Việt trên trình duyệt này.");
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

    // If stopped before browser marked result final, deliver best interim transcript
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

    if (sessionFinal && !continuous) {
      emittedFinal = true;
      onResult?.(sessionFinal, {
        confidence: bestConfidence,
        alternatives,
        isFinal: true,
      });
    } else if (sessionFinal && continuous) {
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

        // Setup Web Audio AnalyserNode for live mic meter
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

        // Setup MediaRecorder for self-playback
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
        // Scale typical speech RMS (~0.02..0.28) into crisp 0..1 visual meter
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
