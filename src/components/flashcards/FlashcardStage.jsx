import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Mic,
  MicOff,
  RotateCcw,
  SlidersHorizontal,
  Volume2,
  X,
} from "lucide-react";
import { MASTERY_LEVELS } from "../../lib/contracts.js";
import * as speechApi from "../../lib/speech.js";
import { scoreVietnamesePronunciation } from "../../lib/pronunciation.js";

const SPEED_OPTIONS = [0.75, 0.9, 1, 1.15];

const FALLBACK_VIETNAMESE_VOICES = Object.freeze([
  Object.freeze({
    id: "ngochuyen",
    label: "Ngọc Huyền",
    shortLabel: "Nữ · Bắc · Tự nhiên",
    gender: "female",
    region: "Bắc",
    style: "Giọng đọc tự nhiên",
  }),
  Object.freeze({
    id: "trucly",
    label: "Trúc Ly",
    shortLabel: "Nữ · Bắc · Tự nhiên",
    gender: "female",
    region: "Bắc",
    style: "Phong cách tự nhiên",
  }),
  Object.freeze({
    id: "maianh",
    label: "Mai Anh",
    shortLabel: "Nữ · Bắc · Tin tức",
    gender: "female",
    region: "Bắc",
    style: "Phong cách tin tức",
  }),
  Object.freeze({
    id: "haidang",
    label: "Hải Đăng",
    shortLabel: "Nam · Bắc · Tự nhiên",
    gender: "male",
    region: "Bắc",
    style: "Phong cách tự nhiên",
  }),
  Object.freeze({
    id: "thienminh",
    label: "Thiện Minh",
    shortLabel: "Nam · Bắc · Kể chuyện",
    gender: "male",
    region: "Bắc",
    style: "Phong cách kể chuyện",
  }),
]);

function getAvailableVoices() {
  if (Array.isArray(speechApi.VIETNAMESE_VOICES) && speechApi.VIETNAMESE_VOICES.length > 0) {
    return speechApi.VIETNAMESE_VOICES;
  }
  return FALLBACK_VIETNAMESE_VOICES;
}

function formatVoiceSublabel(voice) {
  if (!voice) return "";
  if (voice.shortLabel) {
    return voice.shortLabel.replace(/\s*·\s*Bắc(?=\s*·|\s*$)/u, "").trim();
  }
  const genderLabel = voice.gender === "male" ? "Nam" : "Nữ";
  return voice.style ? `${genderLabel} · ${voice.style}` : genderLabel;
}

function readSelectedVoice() {
  if (typeof speechApi.getSelectedVoice === "function") {
    try {
      return speechApi.getSelectedVoice() || "ngochuyen";
    } catch {
      return "ngochuyen";
    }
  }
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(
        speechApi.VOICE_STORAGE_KEY || "vietflow_tts_voice"
      );
      if (saved === "hoaimy") return "ngochuyen";
      if (saved === "namminh") return "haidang";
      const validIds = new Set(getAvailableVoices().map((v) => v.id));
      if (saved && validIds.has(saved)) return saved;
    } catch {
      // ignore
    }
  }
  return "ngochuyen";
}

function writeSelectedVoice(voiceId) {
  if (typeof speechApi.setSelectedVoice === "function") {
    try {
      return speechApi.setSelectedVoice(voiceId) || voiceId;
    } catch {
      // fallback below
    }
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage?.setItem(
        speechApi.VOICE_STORAGE_KEY || "vietflow_tts_voice",
        voiceId
      );
      window.dispatchEvent(
        new CustomEvent(speechApi.VOICE_CHANGE_EVENT || "vietflow:voice-change", {
          detail: { voice: voiceId },
        })
      );
    } catch {
      // ignore
    }
  }
  return voiceId;
}

function isTypingElement(target) {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderHighlightedExample(exampleVi, frontVi) {
  if (!exampleVi || !frontVi) return exampleVi;
  const trimmedFront = frontVi.trim();
  if (!trimmedFront) return exampleVi;
  try {
    const regex = new RegExp(`(${escapeRegExp(trimmedFront)})`, "giu");
    const parts = exampleVi.split(regex);
    return parts.map((part, idx) =>
      part.toLocaleLowerCase("vi") === trimmedFront.toLocaleLowerCase("vi") ? (
        <mark key={idx}>{part}</mark>
      ) : (
        <React.Fragment key={idx}>{part}</React.Fragment>
      )
    );
  } catch {
    return exampleVi;
  }
}

function normalizeRatingKey(rating) {
  if (rating === "excellent") return "excellent";
  if (rating === "good") return "good";
  if (rating === "fair") return "fair";
  return "retry";
}

function ratingLabelVi(rating) {
  switch (normalizeRatingKey(rating)) {
    case "excellent":
      return "Rất chuẩn!";
    case "good":
      return "Khá tốt!";
    case "fair":
      return "Gần đúng, chú ý thanh điệu";
    default:
      return "Thử phát âm lại nhé";
  }
}

function normalizeDiffStatus(status) {
  if (status === "exact") return "exact";
  if (status === "tone-mismatch" || status === "tone_mismatch") return "tone-mismatch";
  if (status === "close") return "close";
  return "missed";
}

export function FlashcardStage({
  cards = [],
  currentIndex = 0,
  onIndexChange,
  onUpdateMastery,
  onRecordPractice,
  onOpenCreate,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rate, setRate] = useState(1);
  const [selectedVoice, setSelectedVoiceState] = useState(() => readSelectedVoice());
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [autoSpeakExample, setAutoSpeakExample] = useState(false);
  const [showPos, setShowPos] = useState(true);
  const [reverseMode, setReverseMode] = useState(false);
  const [showTooltipHint, setShowTooltipHint] = useState(true);

  const [speakingTarget, setSpeakingTarget] = useState(null); // "word" | "example" | null
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [pronResult, setPronResult] = useState(null);
  const [micNotice, setMicNotice] = useState("");

  const recognizerRef = useRef(null);
  const settingsRef = useRef(null);
  const lastAutoSpokenIdRef = useRef(null);
  const tooltipTimerRef = useRef(null);

  const safeIndex = cards.length > 0 ? Math.min(Math.max(0, currentIndex), cards.length - 1) : 0;
  const card = cards[safeIndex] || null;
  const availableVoices = useMemo(() => getAvailableVoices(), []);
  const sttSupported = useMemo(() => {
    try {
      return Boolean(speechApi.isSpeechRecognitionSupported?.());
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const voiceChangeEvent =
      speechApi.VOICE_CHANGE_EVENT || "vietflow:voice-change";
    const voiceStorageKey = speechApi.VOICE_STORAGE_KEY || "vietflow_tts_voice";

    const handleVoiceSync = (event) => {
      const nextVoice = event?.detail?.voice || readSelectedVoice();
      if (nextVoice) setSelectedVoiceState(nextVoice);
    };
    const handleStorage = (event) => {
      if (!event?.key || event.key === voiceStorageKey) {
        setSelectedVoiceState(readSelectedVoice());
      }
    };

    window.addEventListener(voiceChangeEvent, handleVoiceSync);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(voiceChangeEvent, handleVoiceSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleSelectVoice = useCallback((voiceId) => {
    speechApi.stopSpeaking?.();
    const updated = writeSelectedVoice(voiceId) || voiceId;
    setSelectedVoiceState(updated);
  }, []);

  // Smart background pre-fetching for active card + example + next 2 cards
  const nextCard1FrontVi = cards[safeIndex + 1]?.frontVi || "";
  const nextCard2FrontVi = cards[safeIndex + 2]?.frontVi || "";

  useEffect(() => {
    if (!card) return;
    if (typeof speechApi.prefetchVietnamese !== "function") return;
    const texts = [
      card.frontVi,
      card.exampleVi,
      nextCard1FrontVi,
      nextCard2FrontVi,
    ].filter(Boolean);
    if (texts.length > 0) {
      speechApi.prefetchVietnamese(texts, { voice: selectedVoice });
    }
  }, [
    card?.id,
    card?.frontVi,
    card?.exampleVi,
    nextCard1FrontVi,
    nextCard2FrontVi,
    selectedVoice,
  ]);

  const stopActiveListening = useCallback(() => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop?.();
      } catch {
        // ignore
      }
      recognizerRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
  }, []);

  // Show tooltip initially briefly so user immediately sees their screenshot layout, then hover/focus reveals it
  useEffect(() => {
    tooltipTimerRef.current = window.setTimeout(() => {
      setShowTooltipHint(false);
    }, 5500);
    return () => {
      window.clearTimeout(tooltipTimerRef.current);
    };
  }, []);

  // Cleanup speech / mic on unmount
  useEffect(() => {
    return () => {
      speechApi.stopSpeaking?.();
      stopActiveListening();
    };
  }, [stopActiveListening]);

  // Close settings popover on outside click
  useEffect(() => {
    if (!settingsOpen) return undefined;
    const handleOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [settingsOpen]);

  // Reset flip & pronunciation feedback when card changes
  useEffect(() => {
    setIsFlipped(false);
    setPronResult(null);
    setMicNotice("");
    stopActiveListening();
  }, [card?.id, stopActiveListening]);

  const handleSpeak = useCallback(
    (text, target = "word") => {
      if (!text) return;
      stopActiveListening();
      setSpeakingTarget(target);
      Promise.resolve(
        speechApi.speakVietnamese?.(text, {
          rate,
          voice: selectedVoice,
          onStart: () => setSpeakingTarget(target),
          onEnd: () => setSpeakingTarget((curr) => (curr === target ? null : curr)),
          onError: () => setSpeakingTarget((curr) => (curr === target ? null : curr)),
        })
      )
        .then(() => {
          setSpeakingTarget((curr) => (curr === target ? null : curr));
        })
        .catch(() => {
          setSpeakingTarget((curr) => (curr === target ? null : curr));
        });
    },
    [rate, selectedVoice, stopActiveListening]
  );

  // Auto-pronounce when switching to a new card (not on initial mount if unchanged, yes when card switches)
  useEffect(() => {
    if (!card?.frontVi) return;
    if (lastAutoSpokenIdRef.current === null) {
      lastAutoSpokenIdRef.current = card.id;
      return;
    }
    if (lastAutoSpokenIdRef.current !== card.id) {
      lastAutoSpokenIdRef.current = card.id;
      if (autoSpeak) {
        handleSpeak(card.frontVi, "word");
      }
    }
  }, [card?.id, card?.frontVi, autoSpeak, handleSpeak]);

  // Auto-speak example sentence on flip if enabled in settings
  useEffect(() => {
    if (isFlipped && autoSpeakExample && card?.exampleVi) {
      handleSpeak(card.exampleVi, "example");
    }
  }, [isFlipped, autoSpeakExample, card?.exampleVi, handleSpeak]);

  const handlePrev = useCallback(() => {
    if (safeIndex > 0) {
      onIndexChange?.(safeIndex - 1);
    }
  }, [safeIndex, onIndexChange]);

  const handleNext = useCallback(() => {
    if (safeIndex < cards.length - 1) {
      onIndexChange?.(safeIndex + 1);
    }
  }, [safeIndex, cards.length, onIndexChange]);

  const handleFlip = useCallback(() => {
    setSettingsOpen(false);
    setIsFlipped((prev) => !prev);
  }, []);

  const handleMarkMastery = useCallback(
    (level) => {
      if (!card) return;
      onUpdateMastery?.(card.id, level);
      onRecordPractice?.({
        gameType: "flashcard_review",
        topicId: card.topicId || null,
        skillTags: ["reading"],
        score: level >= MASTERY_LEVELS.STRONG ? 10 : 5,
        maxScore: 10,
        accuracy: level >= MASTERY_LEVELS.STRONG ? 100 : 60,
        durationSeconds: 5,
        details: { cardId: card.id, frontVi: card.frontVi, masteryLevel: level },
      });
    },
    [card, onUpdateMastery, onRecordPractice]
  );

  const handleToggleAutoSpeak = useCallback((e) => {
    e?.stopPropagation?.();
    setAutoSpeak((prev) => !prev);
    setShowTooltipHint(true);
    window.clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = window.setTimeout(() => {
      setShowTooltipHint(false);
    }, 2600);
  }, []);

  const handleMicClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (!card?.frontVi) return;

      if (isListening) {
        stopActiveListening();
        return;
      }

      speechApi.stopSpeaking?.();
      setSpeakingTarget(null);
      setPronResult(null);
      setMicNotice("");

      if (!sttSupported) {
        setMicNotice(
          "Trình duyệt này chưa hỗ trợ nhận diện giọng nói tiếng Việt (hãy dùng Chrome/Edge). Bạn vẫn có thể bấm loa để nghe và luyện đọc theo!"
        );
        return;
      }

      try {
        setIsListening(true);
        setInterimText("");
        recognizerRef.current = speechApi.startVietnameseListening?.({
          continuous: false,
          maxDurationMs: 7500,
          onInterim: (payload) => {
            const text = typeof payload === "string" ? payload : payload?.transcript || "";
            setInterimText(text);
          },
          onResult: (payload) => {
            const spoken = (typeof payload === "string" ? payload : payload?.transcript || "").trim();
            setIsListening(false);
            setInterimText("");
            recognizerRef.current = null;
            if (!spoken) {
              setMicNotice("Chưa nghe rõ giọng nói. Hãy bấm micro và đọc lại từ tiếng Việt nhé.");
              return;
            }
            const evalResult = scoreVietnamesePronunciation(card.frontVi, spoken);
            setPronResult({ spoken, ...evalResult });
            onRecordPractice?.({
              gameType: "flashcard_review",
              topicId: card.topicId || null,
              skillTags: ["pronunciation", "speaking"],
              score: Math.round(evalResult.score || 0),
              maxScore: 100,
              accuracy: evalResult.score || 0,
              durationSeconds: 4,
              details: {
                cardId: card.id,
                frontVi: card.frontVi,
                spoken,
                score: evalResult.score,
              },
            });
          },
          onError: (err) => {
            setIsListening(false);
            setInterimText("");
            recognizerRef.current = null;
            const msg = typeof err === "string" ? err : err?.message || "Không thể ghi âm lúc này.";
            setMicNotice(msg);
          },
          onEnd: () => {
            setIsListening(false);
            recognizerRef.current = null;
          },
        });
      } catch (err) {
        setIsListening(false);
        setMicNotice(err?.message || "Không thể khởi động micro.");
      }
    },
    [card, isListening, sttSupported, stopActiveListening, onRecordPractice]
  );

  // Keyboard shortcuts (safely disabled while focused inside form fields)
  useEffect(() => {
    if (!card) return undefined;
    const onKeyDown = (e) => {
      if (isTypingElement(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "Space" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped && e.key === "1") {
        e.preventDefault();
        handleMarkMastery(MASTERY_LEVELS.REVIEW);
      } else if (isFlipped && e.key === "2") {
        e.preventDefault();
        handleMarkMastery(MASTERY_LEVELS.MASTERED);
      } else if (e.key === "Escape" && settingsOpen) {
        setSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [card, handlePrev, handleNext, handleFlip, handleMarkMastery, isFlipped, settingsOpen]);

  if (!card) {
    return (
      <div className="fc-empty-card">
        <h3>Chưa có flashcard nào trong bộ lọc này</h3>
        <p>
          Bạn có thể đổi bộ lọc phía trên hoặc thêm ngay từ vựng tiếng Việt kèm định nghĩa và ví dụ
          để tạo flashcard mới.
        </p>
        {onOpenCreate && (
          <button type="button" className="fc-btn-primary" onClick={onOpenCreate}>
            Tạo flashcard ngay
          </button>
        )}
      </div>
    );
  }

  const isMastered = (card.masteryLevel || 0) >= MASTERY_LEVELS.STRONG;
  const isReview = (card.masteryLevel || 0) >= MASTERY_LEVELS.REVIEW && !isMastered;

  const renderBottomRightControls = () => (
    <div
      className="fc-card-controls-br"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={`fc-mic-btn ${isListening ? "is-listening" : ""}`}
        onClick={handleMicClick}
        aria-label={isListening ? "Dừng ghi âm phát âm" : "Luyện phát âm tiếng Việt bằng micro"}
        title={isListening ? "Đang nghe... bấm để dừng" : "Bấm để đọc từ và chấm phát âm"}
      >
        {isListening ? <MicOff size={22} /> : <Mic size={22} />}
      </button>

      <div className="fc-autospeak-wrap">
        <div
          role="tooltip"
          className={`fc-autospeak-tooltip ${showTooltipHint ? "is-visible" : ""}`}
        >
          Tự động phát âm khi chuyển thẻ
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={autoSpeak}
          aria-label="Tự động phát âm khi chuyển thẻ"
          className={`fc-toggle-switch ${autoSpeak ? "is-on" : ""}`}
          onClick={handleToggleAutoSpeak}
        >
          <span className="fc-toggle-thumb" />
        </button>
      </div>

      <button
        type="button"
        className={`fc-speaker-btn ${speakingTarget === "word" ? "is-speaking" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          handleSpeak(card.frontVi, "word");
        }}
        aria-label={`Nghe phát âm ${card.frontVi}`}
        title="Nghe phát âm tiếng Việt"
      >
        <Volume2 size={24} />
      </button>
    </div>
  );

  const renderSettingsAnchor = () => (
    <div
      className="fc-settings-anchor"
      ref={settingsRef}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={`fc-icon-ghost ${settingsOpen ? "is-open" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setSettingsOpen((o) => !o);
        }}
        aria-label="Cài đặt thẻ flashcard"
        aria-expanded={settingsOpen}
        title="Cài đặt hiển thị & phát âm"
      >
        <SlidersHorizontal size={20} strokeWidth={1.8} />
      </button>

      {settingsOpen && (
        <div className="fc-settings-popover" role="dialog" aria-label="Cài đặt flashcard">
          <div className="fc-popover-head">
            <span>Tùy chỉnh học thẻ</span>
            <button
              type="button"
              className="fc-pron-dismiss"
              onClick={() => setSettingsOpen(false)}
              aria-label="Đóng cài đặt"
            >
              <X size={15} />
            </button>
          </div>

          <div className="fc-popover-section">
            <span className="fc-popover-label">Tốc độ phát âm</span>
            <div className="fc-speed-row">
              {SPEED_OPTIONS.map((sp) => (
                <button
                  key={sp}
                  type="button"
                  className={`fc-speed-pill ${rate === sp ? "is-active" : ""}`}
                  onClick={() => setRate(sp)}
                >
                  {sp}x
                </button>
              ))}
            </div>
          </div>

          <div className="fc-popover-section">
            <span className="fc-popover-label">Giọng đọc tiếng Việt (Miền Bắc)</span>
            <div
              className="fc-voice-list"
              role="group"
              aria-label="Giọng đọc tiếng Việt (Miền Bắc)"
            >
              {availableVoices.map((voiceOpt) => {
                const isActive = selectedVoice === voiceOpt.id;
                const sublabel = formatVoiceSublabel(voiceOpt);
                return (
                  <button
                    key={voiceOpt.id}
                    type="button"
                    aria-pressed={isActive}
                    className={`fc-voice-option ${isActive ? "is-active" : ""}`}
                    onClick={() => handleSelectVoice(voiceOpt.id)}
                    data-voice-option={voiceOpt.id}
                  >
                    <span className="fc-voice-option-name">{voiceOpt.label}</span>
                    <span className="fc-voice-option-meta">
                      {sublabel && (
                        <span className="fc-voice-option-sub">{sublabel}</span>
                      )}
                      {isActive && (
                        <Check
                          size={14}
                          strokeWidth={2.2}
                          className="fc-voice-option-check"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="fc-popover-section">
            <span className="fc-popover-label">Mặt trước hiển thị</span>
            <div className="fc-direction-row">
              <button
                type="button"
                className={`fc-dir-pill ${!reverseMode ? "is-active" : ""}`}
                onClick={() => setReverseMode(false)}
              >
                Tiếng Việt → Nghĩa
              </button>
              <button
                type="button"
                className={`fc-dir-pill ${reverseMode ? "is-active" : ""}`}
                onClick={() => setReverseMode(true)}
              >
                Nghĩa → Tiếng Việt
              </button>
            </div>
          </div>

          <div className="fc-popover-section">
            <label className="fc-setting-toggle-row">
              <span>Hiển thị loại từ</span>
              <input
                type="checkbox"
                checked={showPos}
                onChange={(e) => setShowPos(e.target.checked)}
              />
            </label>
            <label className="fc-setting-toggle-row">
              <span>Tự động phát âm khi chuyển thẻ</span>
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
              />
            </label>
            <label className="fc-setting-toggle-row">
              <span>Tự động đọc ví dụ khi lật thẻ</span>
              <input
                type="checkbox"
                checked={autoSpeakExample}
                onChange={(e) => setAutoSpeakExample(e.target.checked)}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fc-stage-wrap">
      <div className="fc-stage-topbar">
        <span className="fc-card-counter" data-testid="fc-card-counter">
          Thẻ {safeIndex + 1} / {cards.length}
        </span>

        <div className="fc-stage-nav-mini">
          <button
            type="button"
            className="fc-nav-circle"
            onClick={handlePrev}
            disabled={safeIndex === 0}
            aria-label="Thẻ trước"
            title="Thẻ trước (←)"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="fc-nav-circle"
            onClick={handleFlip}
            aria-label="Lật thẻ"
            title="Lật thẻ (Space / Enter)"
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            className="fc-nav-circle"
            onClick={handleNext}
            disabled={safeIndex >= cards.length - 1}
            aria-label="Thẻ tiếp theo"
            title="Thẻ tiếp theo (→)"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="fc-card-scene">
        <div
          className={`fc-card-3d ${isFlipped ? "is-flipped" : ""}`}
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          aria-label={
            isFlipped
              ? `Mặt sau thẻ ${card.frontVi}. Bấm để quay lại mặt trước.`
              : `Thẻ từ vựng ${card.frontVi}. Bấm để lật xem định nghĩa và ví dụ.`
          }
          data-testid="fc-flashcard"
        >
          {/* FRONT FACE */}
          <div className="fc-card-face fc-card-front">
            {renderSettingsAnchor()}

            {(isMastered || isReview) && (
              <div className="fc-card-status-corner">
                <span className={`fc-status-dot-badge ${isMastered ? "mastered" : "review"}`}>
                  {isMastered ? "Đã thuộc" : "Cần ôn"}
                </span>
              </div>
            )}

            <div className="fc-front-center">
              <h3 className={`fc-word-main ${reverseMode ? "is-reverse" : ""}`}>
                {reverseMode ? card.definition : card.frontVi}
              </h3>

              {showPos && !reverseMode && card.pos && (
                <div className="fc-word-subline" data-testid="fc-front-subline">
                  <span className="fc-pos-text">{card.pos}</span>
                </div>
              )}

              {/* Live listening status */}
              {isListening && (
                <div
                  className="fc-pron-feedback"
                  onClick={(e) => e.stopPropagation()}
                  role="status"
                  aria-live="polite"
                >
                  <div className="fc-listening-live">
                    <span className="fc-wave-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    <span>Đang nghe bạn phát âm...</span>
                  </div>
                  {interimText && (
                    <div className="fc-pron-heard">
                      Nhận diện: <strong>{interimText}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Pronunciation evaluation feedback */}
              {!isListening && pronResult && (
                <div
                  className={`fc-pron-feedback rating-${normalizeRatingKey(pronResult.rating)}`}
                  onClick={(e) => e.stopPropagation()}
                  role="status"
                  aria-live="polite"
                  data-testid="fc-pron-feedback"
                >
                  <div className="fc-pron-head">
                    <span className={`fc-pron-score-pill ${normalizeRatingKey(pronResult.rating)}`}>
                      {Math.round(pronResult.score || 0)}% · {ratingLabelVi(pronResult.rating)}
                    </span>
                    <button
                      type="button"
                      className="fc-pron-dismiss"
                      onClick={() => setPronResult(null)}
                      aria-label="Đóng phản hồi phát âm"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="fc-pron-heard">
                    Bạn đã đọc: <strong>{pronResult.spoken}</strong>
                  </div>
                  {Array.isArray(pronResult.wordDiffs) && pronResult.wordDiffs.length > 0 && (
                    <div className="fc-pron-diffs">
                      {pronResult.wordDiffs.map((diff, i) => {
                        const status = normalizeDiffStatus(diff.status);
                        return (
                          <span
                            key={`${diff.expected}-${i}`}
                            className={`fc-diff-chip ${status}`}
                            title={
                              status === "tone-mismatch"
                                ? `Khác thanh điệu: cần "${diff.expected}" (nghe "${diff.spoken || "—"}")`
                                : diff.expected
                            }
                          >
                            {diff.expected}
                            {status === "tone-mismatch" && diff.spoken ? ` (${diff.spoken})` : ""}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {pronResult.feedbackVi && (
                    <div className="fc-pron-tip">{pronResult.feedbackVi}</div>
                  )}
                </div>
              )}

              {/* Graceful mic notice when STT unsupported or denied */}
              {!isListening && micNotice && (
                <div
                  className="fc-pron-feedback rating-fair"
                  onClick={(e) => e.stopPropagation()}
                  role="status"
                >
                  <div className="fc-pron-head">
                    <span className="fc-pron-score-pill fair">Thông báo micro</span>
                    <button
                      type="button"
                      className="fc-pron-dismiss"
                      onClick={() => setMicNotice("")}
                      aria-label="Đóng thông báo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="fc-pron-tip">{micNotice}</div>
                </div>
              )}
            </div>

            {renderBottomRightControls()}
          </div>

          {/* BACK FACE */}
          <div className="fc-card-face fc-card-back">
            <div className="fc-back-reminder">
              <strong>{card.frontVi}</strong>
              {card.pos && <span>· {card.pos}</span>}
            </div>

            <div className="fc-back-body">
              <span className="fc-back-label">
                {reverseMode ? "Từ vựng tiếng Việt" : "Định nghĩa"}
              </span>
              <p className="fc-definition-text">
                {reverseMode ? card.frontVi : card.definition}
              </p>

              {card.exampleVi && (
                <div
                  className="fc-example-box"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="fc-example-copy">
                    <span className="fc-back-label">Ví dụ</span>
                    <p className="fc-example-vi">
                      {renderHighlightedExample(card.exampleVi, card.frontVi)}
                    </p>
                    {card.exampleEn && <p className="fc-example-en">{card.exampleEn}</p>}
                  </div>
                  <button
                    type="button"
                    className={`fc-example-audio-btn ${speakingTarget === "example" ? "is-speaking" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(card.exampleVi, "example");
                    }}
                    aria-label="Nghe câu ví dụ tiếng Việt"
                    title="Nghe câu ví dụ"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>
              )}

              {card.notes && (
                <div className="fc-note-pill" onClick={(e) => e.stopPropagation()}>
                  <Lightbulb size={15} />
                  <span>{card.notes}</span>
                </div>
              )}
            </div>

            <div
              className="fc-mastery-actions"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={`fc-mastery-btn review ${isReview ? "is-active" : ""}`}
                onClick={() => handleMarkMastery(MASTERY_LEVELS.REVIEW)}
              >
                <RotateCcw size={15} />
                <span>Cần ôn</span>
                <kbd>1</kbd>
              </button>
              <button
                type="button"
                className={`fc-mastery-btn mastered ${isMastered ? "is-active" : ""}`}
                onClick={() => handleMarkMastery(MASTERY_LEVELS.MASTERED)}
              >
                <Check size={15} />
                <span>Đã thuộc</span>
                <kbd>2</kbd>
              </button>
            </div>

            {renderBottomRightControls()}
          </div>
        </div>
      </div>

      {/* Bottom Keyboard Shortcut Bar Outside the Card (Matches Screenshot!) */}
      <div className="fc-shortcut-bar" aria-label="Hướng dẫn phím tắt">
        <span>Phím tắt:</span>
        <kbd>←</kbd>
        <kbd>→</kbd>
        <span>để chuyển thẻ</span>
        <span className="fc-shortcut-sep">•</span>
        <kbd>Space</kbd>
        <span className="fc-shortcut-sep">/</span>
        <kbd>Enter</kbd>
        <span>hoặc bấm để lật thẻ</span>
      </div>
    </div>
  );
}

export default FlashcardStage;
