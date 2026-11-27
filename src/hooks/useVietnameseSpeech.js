import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  VIETNAMESE_VOICES,
  VOICE_CHANGE_EVENT,
  VOICE_OPTIONS,
  VOICE_STORAGE_KEY,
  createAudioRecorder,
  getSelectedVoice,
  getVoiceMeta,
  isSpeechRecognitionSupported,
  prefetchVietnamese,
  setSelectedVoice,
  speakVietnamese,
  startVietnameseListening,
  stopSpeaking,
} from "../lib/speech.js";

/**
 * React hook wrapping Vietnamese TTS (`/api/tts` + Web Speech fallback),
 * Vietnamese STT (`vi-VN`), live microphone level metering, and self-playback recording.
 *
 * @param {{ defaultRate?: number }} [options={}]
 */
export function useVietnameseSpeech({ defaultRate = 1 } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState("");
  const [rate, setRateState] = useState(() => {
    const n = Number(defaultRate);
    return Number.isFinite(n) && n > 0 ? Math.min(1.5, Math.max(0.5, n)) : 1;
  });
  const [voice, setVoiceState] = useState(() => getSelectedVoice());

  const [isListening, setIsListening] = useState(false);
  const [sttSupported] = useState(() => isSpeechRecognitionSupported());
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [micLevel, setMicLevel] = useState(0);
  const [lastRecordingUrl, setLastRecordingUrl] = useState(null);
  const [speechError, setSpeechError] = useState(null);

  const mountedRef = useRef(true);
  const speakRequestIdRef = useRef(0);
  const recognitionHandleRef = useRef(null);
  const recorderRef = useRef(null);
  const levelIntervalRef = useRef(null);
  const lastRecordingUrlRef = useRef(null);

  const revokePreviousRecording = useCallback(() => {
    if (
      lastRecordingUrlRef.current &&
      typeof URL !== "undefined" &&
      typeof URL.revokeObjectURL === "function"
    ) {
      try {
        URL.revokeObjectURL(lastRecordingUrlRef.current);
      } catch {
        // ignore
      }
      lastRecordingUrlRef.current = null;
    }
  }, []);

  const stopLevelPolling = useCallback(() => {
    if (levelIntervalRef.current !== null) {
      clearInterval(levelIntervalRef.current);
      levelIntervalRef.current = null;
    }
    if (mountedRef.current) {
      setMicLevel(0);
    }
  }, []);

  const finishRecorder = useCallback(async () => {
    stopLevelPolling();
    const rec = recorderRef.current;
    recorderRef.current = null;
    if (!rec) return null;

    try {
      const result = await rec.stop();
      if (result?.audioUrl && mountedRef.current) {
        revokePreviousRecording();
        lastRecordingUrlRef.current = result.audioUrl;
        setLastRecordingUrl(result.audioUrl);
        return result.audioUrl;
      }
    } catch {
      rec.cleanup();
    }
    return null;
  }, [revokePreviousRecording, stopLevelPolling]);

  const setRate = useCallback((nextRate) => {
    const num = Number(nextRate);
    if (!Number.isFinite(num) || num <= 0) return;
    setRateState(Math.min(1.5, Math.max(0.5, num)));
  }, []);

  const voiceMeta = useMemo(() => getVoiceMeta(voice), [voice]);

  const setVoice = useCallback((nextVoice) => {
    const normalized = setSelectedVoice(nextVoice);
    setVoiceState(normalized);
    return normalized;
  }, []);

  const prefetch = useCallback(
    (texts, overrideOptions = {}) => {
      prefetchVietnamese(texts, {
        voice: overrideOptions?.voice ?? voice,
      });
    },
    [voice]
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleVoiceChange = (event) => {
      const next = event?.detail?.voice || getSelectedVoice();
      if (mountedRef.current) {
        setVoiceState(next);
      }
    };

    const handleStorage = (event) => {
      if (!event?.key || event.key === VOICE_STORAGE_KEY) {
        if (mountedRef.current) {
          setVoiceState(getSelectedVoice());
        }
      }
    };

    window.addEventListener(VOICE_CHANGE_EVENT, handleVoiceChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(VOICE_CHANGE_EVENT, handleVoiceChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const stopSpeak = useCallback(() => {
    speakRequestIdRef.current += 1;
    stopSpeaking();
    if (mountedRef.current) {
      setIsSpeaking(false);
      setSpeakingText("");
    }
  }, []);

  const speak = useCallback(
    async (text, overrideOptions = {}) => {
      const cleanText = String(text || "").trim();
      if (!cleanText) return { source: "none" };

      const reqId = ++speakRequestIdRef.current;
      if (mountedRef.current) {
        setSpeechError(null);
        setIsSpeaking(true);
        setSpeakingText(cleanText);
      }

      const result = await speakVietnamese(cleanText, {
        rate: overrideOptions.rate ?? rate,
        voice: overrideOptions.voice ?? voice,
        voiceName: overrideOptions.voiceName || "",
        onStart(meta) {
          overrideOptions.onStart?.(meta);
        },
        onEnd(meta) {
          if (mountedRef.current && speakRequestIdRef.current === reqId) {
            setIsSpeaking(false);
            setSpeakingText("");
          }
          overrideOptions.onEnd?.(meta);
        },
        onError(err) {
          if (mountedRef.current && speakRequestIdRef.current === reqId) {
            setSpeechError(err?.message || "Không thể phát âm tiếng Việt.");
          }
          overrideOptions.onError?.(err);
        },
      });

      if (mountedRef.current && speakRequestIdRef.current === reqId) {
        setIsSpeaking(false);
        setSpeakingText("");
      }

      return result;
    },
    [rate, voice]
  );

  const stopListening = useCallback(() => {
    if (recognitionHandleRef.current) {
      const handle = recognitionHandleRef.current;
      recognitionHandleRef.current = null;
      handle.stop();
    } else if (mountedRef.current) {
      setIsListening(false);
    }
    void finishRecorder();
  }, [finishRecorder]);

  const startListening = useCallback(
    (listenOptions = {}) => {
      const {
        continuous = false,
        maxDurationMs = 10000,
        recordAudio = true,
        onInterim: userOnInterim,
        onResult: userOnResult,
        onError: userOnError,
        onEnd: userOnEnd,
      } = listenOptions;

      // Cancel any ongoing TTS or previous recognition before opening the mic
      stopSpeak();
      if (recognitionHandleRef.current) {
        recognitionHandleRef.current.abort();
        recognitionHandleRef.current = null;
      }
      if (recorderRef.current) {
        recorderRef.current.cleanup();
        recorderRef.current = null;
      }
      stopLevelPolling();

      if (mountedRef.current) {
        setSpeechError(null);
        setInterimTranscript("");
        setFinalTranscript("");
        setIsListening(true);
      }

      // Optional MediaRecorder + live mic level meter (degrades gracefully if denied/unsupported)
      if (recordAudio) {
        const recorder = createAudioRecorder();
        recorderRef.current = recorder;
        recorder.start().then((started) => {
          if (!started || recorderRef.current !== recorder || !mountedRef.current) {
            return;
          }
          levelIntervalRef.current = setInterval(() => {
            if (!mountedRef.current || recorderRef.current !== recorder) return;
            setMicLevel(recorder.getLevel());
          }, 60);
        });
      }

      const handle = startVietnameseListening({
        continuous,
        maxDurationMs,
        onInterim(text) {
          if (mountedRef.current) {
            setInterimTranscript(text);
          }
          userOnInterim?.(text);
        },
        onResult(text, meta) {
          if (mountedRef.current) {
            setFinalTranscript(text);
            setInterimTranscript(text);
          }
          userOnResult?.(text, meta);
        },
        onError(messageVi, code) {
          if (mountedRef.current) {
            setSpeechError(messageVi);
          }
          userOnError?.(messageVi, code);
        },
        onEnd() {
          if (recognitionHandleRef.current === handle) {
            recognitionHandleRef.current = null;
          }
          if (mountedRef.current) {
            setIsListening(false);
          }
          void finishRecorder();
          userOnEnd?.();
        },
      });

      recognitionHandleRef.current = handle;
      return handle;
    },
    [finishRecorder, stopLevelPolling, stopSpeak]
  );

  const resetTranscript = useCallback(() => {
    setInterimTranscript("");
    setFinalTranscript("");
    setSpeechError(null);
    revokePreviousRecording();
    setLastRecordingUrl(null);
  }, [revokePreviousRecording]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (recognitionHandleRef.current) {
        recognitionHandleRef.current.abort();
        recognitionHandleRef.current = null;
      }
      if (recorderRef.current) {
        recorderRef.current.cleanup();
        recorderRef.current = null;
      }
      if (levelIntervalRef.current !== null) {
        clearInterval(levelIntervalRef.current);
        levelIntervalRef.current = null;
      }
      revokePreviousRecording();
      stopSpeaking();
    };
  }, [revokePreviousRecording]);

  return {
    isSpeaking,
    speakingText,
    rate,
    setRate,
    voice,
    voiceMeta,
    voices: VIETNAMESE_VOICES,
    voiceOptions: VOICE_OPTIONS,
    setVoice,
    prefetch,
    speak,
    stopSpeak,
    isListening,
    sttSupported,
    interimTranscript,
    finalTranscript,
    micLevel,
    lastRecordingUrl,
    startListening,
    stopListening,
    resetTranscript,
    speechError,
  };
}

export default useVietnameseSpeech;
