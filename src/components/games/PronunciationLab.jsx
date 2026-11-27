import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  AudioLines,
  CheckCircle2,
  Keyboard,
  Mic,
  MicOff,
  RotateCcw,
  Volume2,
} from "lucide-react";
import {
  PRONUNCIATION_SENTENCES,
  TONE_MINIMAL_PAIRS,
  getTopicById,
} from "../../data";
import { GAME_TYPES, TOPIC_META } from "../../lib/contracts";
import {
  VIETNAMESE_TONES,
  scoreVietnamesePronunciation,
} from "../../lib/pronunciation";
import * as speechApi from "../../lib/speech";
import { useVietnameseSpeech } from "../../hooks/useVietnameseSpeech";

const DEFAULT_TONE_SPECS = [
  {
    id: "ngang",
    nameVi: "Thanh Ngang",
    shortVi: "Ngang",
    example: "ma",
    contourNote: "Đều, cao vừa, kéo thẳng",
    svgPath: "M 6 15 L 74 15",
  },
  {
    id: "huyen",
    nameVi: "Thanh Huyền",
    shortVi: "Huyền",
    example: "mà",
    contourNote: "Hạ thấp dần, nhẹ và êm",
    svgPath: "M 6 17 Q 40 23 74 28",
  },
  {
    id: "sac",
    nameVi: "Thanh Sắc",
    shortVi: "Sắc",
    example: "má",
    contourNote: "Lên cao nhanh và rõ",
    svgPath: "M 6 22 Q 42 15 74 5",
  },
  {
    id: "hoi",
    nameVi: "Thanh Hỏi",
    shortVi: "Hỏi",
    example: "mả",
    contourNote: "Hạ xuống rồi uốn lên nhẹ",
    svgPath: "M 6 17 Q 34 31 54 24 T 74 15",
  },
  {
    id: "nga",
    nameVi: "Thanh Ngã",
    shortVi: "Ngã",
    example: "mã",
    contourNote: "Ngắt thanh quản rồi vút lên",
    svgPath: "M 6 16 L 30 22 M 38 19 Q 54 11 74 5",
  },
  {
    id: "nang",
    nameVi: "Thanh Nặng",
    shortVi: "Nặng",
    example: "mạ",
    contourNote: "Rơi thấp, ngắn và dứt khoát",
    svgPath: "M 6 20 Q 28 29 44 30",
    dot: { cx: 48, cy: 30 },
  },
];

const RATING_LABELS = {
  excellent: { label: "Xuất sắc", tagClass: "vf-g-tag--good" },
  good: { label: "Khá tốt", tagClass: "vf-g-tag--slate" },
  fair: { label: "Cần chỉnh thanh điệu", tagClass: "vf-g-tag--warn" },
  retry: { label: "Thử lại nhé", tagClass: "vf-g-tag--bad" },
};

function resolveToneLegend(source) {
  const mapById = new Map();
  if (Array.isArray(source)) {
    for (const item of source) {
      if (item?.id) mapById.set(item.id, item);
    }
  } else if (source && typeof source === "object") {
    for (const [key, val] of Object.entries(source)) {
      mapById.set(key, val);
    }
  }

  return DEFAULT_TONE_SPECS.map((spec) => {
    const ext = mapById.get(spec.id) || {};
    return {
      ...spec,
      nameVi: ext.labelVi || ext.nameVi || ext.name || spec.nameVi,
      example: ext.example || ext.exampleWord || ext.sample || spec.example,
      contourNote:
        ext.contourTip || ext.tipVi || ext.descriptionVi || spec.contourNote,
    };
  });
}

function getToneShortLabel(toneKey) {
  const found = DEFAULT_TONE_SPECS.find((t) => t.id === toneKey);
  return found ? found.shortVi : toneKey || "—";
}

function formatToneBadge(toneValue) {
  const str = String(toneValue || "").trim();
  if (!str) return "Thanh điệu";
  if (/^thanh\s/i.test(str)) return str;
  return `Thanh ${getToneShortLabel(str)}`;
}

function WordDiffStrip({ wordDiffs = [], onSpeakWord }) {
  if (!Array.isArray(wordDiffs) || wordDiffs.length === 0) return null;

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "0.75rem",
          color: "var(--g-text-muted)",
          marginBottom: "6px",
        }}
      >
        <span>Nhấn từng từ để nghe phát âm mẫu:</span>
        <span style={{ color: "var(--g-good)" }}>● Chuẩn</span>
        <span style={{ color: "var(--g-warn)" }}>● Sai thanh điệu</span>
        <span style={{ color: "var(--g-slate)" }}>● Gần đúng</span>
        <span style={{ color: "var(--g-bad)" }}>● Bỏ sót</span>
      </div>

      <div className="vf-g-diff-list" data-testid="pronunciation-word-diffs">
        {wordDiffs.map((diff, idx) => {
          const status = diff.status || "close";
          const targetWord = diff.expected || diff.spoken || "";
          return (
            <button
              key={`${targetWord}-${idx}`}
              type="button"
              className={`vf-g-word-chip vf-g-word-chip--${status}`}
              onClick={() => targetWord && onSpeakWord?.(targetWord)}
              title="Nhấn để nghe từ này"
            >
              <span className="vf-g-word-chip__word">{targetWord}</span>
              {status === "exact" && (
                <span className="vf-g-word-chip__meta">Chuẩn</span>
              )}
              {status === "tone-mismatch" && (
                <span className="vf-g-word-chip__meta">
                  Cần: {getToneShortLabel(diff.expectedTone)} · Nói:{" "}
                  {getToneShortLabel(diff.spokenTone)}
                  {diff.spoken ? ` (${diff.spoken})` : ""}
                </span>
              )}
              {status === "close" && (
                <span className="vf-g-word-chip__meta">
                  Nói: {diff.spoken || "—"}
                </span>
              )}
              {status === "missed" && (
                <span className="vf-g-word-chip__meta">Bỏ sót</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PronunciationLab({
  activeTopicId = "all",
  initialSubMode = "minimal-pairs",
  onCompleteSession,
  onBack,
}) {
  const speech = useVietnameseSpeech({ defaultRate: 0.95 });
  const {
    isSpeaking,
    rate,
    setRate,
    voice,
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
  } = speech;

  const toneLegend = useMemo(() => resolveToneLegend(VIETNAMESE_TONES), []);

  const [subMode, setSubMode] = useState(
    initialSubMode === "shadowing" ? "shadowing" : "minimal-pairs"
  );
  const [activeToneId, setActiveToneId] = useState(null);

  const pairs = useMemo(() => {
    const list = Array.isArray(TONE_MINIMAL_PAIRS) ? TONE_MINIMAL_PAIRS : [];
    if (activeTopicId && activeTopicId !== "all") {
      const filtered = list.filter((p) => p.topicId === activeTopicId);
      if (filtered.length > 0) return filtered;
    }
    return list;
  }, [activeTopicId]);

  const [pairIndex, setPairIndex] = useState(0);
  const [activePairWordIdx, setActivePairWordIdx] = useState(null);
  const [pairEvaluations, setPairEvaluations] = useState({});
  const [pairManualText, setPairManualText] = useState("");
  const [pairManualTargetIdx, setPairManualTargetIdx] = useState(0);

  const sentences = useMemo(() => {
    const list = Array.isArray(PRONUNCIATION_SENTENCES)
      ? PRONUNCIATION_SENTENCES
      : [];
    if (activeTopicId && activeTopicId !== "all") {
      const filtered = list.filter((s) => s.topicId === activeTopicId);
      if (filtered.length > 0) return filtered;
    }
    return list;
  }, [activeTopicId]);

  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [sentenceEvals, setSentenceEvals] = useState({});
  const [manualText, setManualText] = useState("");
  const [showFallback, setShowFallback] = useState(!sttSupported);
  const [sessionSummary, setSessionSummary] = useState(null);

  const startTimeRef = useRef(Date.now());
  const listeningTargetRef = useRef(null);
  const pairSequenceTimerRef = useRef(null);

  const currentPair = pairs[pairIndex] || pairs[0] || null;
  const currentSentence = sentences[sentenceIndex] || sentences[0] || null;

  useEffect(() => {
    setPairIndex(0);
    setSentenceIndex(0);
    setSessionSummary(null);
    startTimeRef.current = Date.now();
  }, [activeTopicId]);

  useEffect(() => {
    if (!sttSupported || speechError) {
      setShowFallback(true);
    }
  }, [sttSupported, speechError]);

  const nextSentenceVi = sentences[sentenceIndex + 1]?.textVi || "";

  useEffect(() => {
    if (sessionSummary) return;
    if (typeof speechApi.prefetchVietnamese !== "function") return;

    let texts = [];
    if (subMode === "minimal-pairs" && currentPair) {
      texts = (currentPair.items || [])
        .map((item) => item?.vi)
        .filter(Boolean);
    } else if (subMode === "shadowing" && currentSentence) {
      texts = [currentSentence.textVi, nextSentenceVi].filter(Boolean);
    }

    if (texts.length > 0) {
      speechApi.prefetchVietnamese(texts, voice ? { voice } : {});
    }
  }, [
    sessionSummary,
    subMode,
    currentPair,
    currentSentence,
    nextSentenceVi,
    voice,
  ]);

  useEffect(() => {
    return () => {
      if (pairSequenceTimerRef.current) {
        clearTimeout(pairSequenceTimerRef.current);
      }
      stopSpeak();
      speechApi.stopSpeaking?.();
      stopListening();
    };
  }, [stopSpeak, stopListening]);

  useEffect(() => {
    if (!finalTranscript || !listeningTargetRef.current) return;
    const target = listeningTargetRef.current;
    const evaluation = scoreVietnamesePronunciation(
      target.expectedText,
      finalTranscript
    );

    if (target.mode === "pair") {
      setPairEvaluations((prev) => ({
        ...prev,
        [target.key]: {
          spoken: finalTranscript,
          evaluation,
        },
      }));
      setActivePairWordIdx(null);
    } else if (target.mode === "sentence") {
      setSentenceEvals((prev) => ({
        ...prev,
        [target.key]: {
          spoken: finalTranscript,
          evaluation,
        },
      }));
    }
    listeningTargetRef.current = null;
  }, [finalTranscript]);

  const handlePlayTone = (tone) => {
    setActiveToneId(tone.id);
    speak(tone.example, { rate: 0.85 });
  };

  const handleListenBothPair = async () => {
    const items = currentPair?.items || [];
    if (items.length === 0) return;
    if (pairSequenceTimerRef.current) clearTimeout(pairSequenceTimerRef.current);
    stopSpeak();

    const playAt = async (idx) => {
      if (idx >= items.length) return;
      try {
        await speak(items[idx].vi, { rate: 0.85 });
        if (idx + 1 < items.length) {
          pairSequenceTimerRef.current = setTimeout(() => {
            void playAt(idx + 1);
          }, 420);
        }
      } catch {
        // ignore playback interruption
      }
    };

    void playAt(0);
  };

  const handleMicForPairWord = (item, idx) => {
    if (!currentPair) return;
    const key = `${currentPair.id}-${idx}`;
    if (isListening) {
      stopListening();
      setActivePairWordIdx(null);
      return;
    }
    stopSpeak();
    resetTranscript();
    setActivePairWordIdx(idx);
    listeningTargetRef.current = {
      mode: "pair",
      key,
      expectedText: item.vi,
    };
    startListening({
      maxDurationMs: 6000,
      onResult: (transcript) => {
        if (!transcript) return;
        const evaluation = scoreVietnamesePronunciation(item.vi, transcript);
        setPairEvaluations((prev) => ({
          ...prev,
          [key]: { spoken: transcript, evaluation },
        }));
        setActivePairWordIdx(null);
        listeningTargetRef.current = null;
      },
    });
  };

  const handlePairFallbackScore = (e) => {
    e.preventDefault();
    if (!currentPair || !pairManualText.trim()) return;
    const targetItem =
      currentPair.items[pairManualTargetIdx] || currentPair.items[0];
    if (!targetItem) return;
    const key = `${currentPair.id}-${pairManualTargetIdx}`;
    const evaluation = scoreVietnamesePronunciation(
      targetItem.vi,
      pairManualText.trim()
    );
    setPairEvaluations((prev) => ({
      ...prev,
      [key]: { spoken: pairManualText.trim(), evaluation },
    }));
  };

  const handleMicForSentence = () => {
    if (!currentSentence) return;
    if (isListening) {
      stopListening();
      return;
    }
    stopSpeak();
    resetTranscript();
    listeningTargetRef.current = {
      mode: "sentence",
      key: currentSentence.id,
      expectedText: currentSentence.textVi,
    };
    startListening({
      maxDurationMs: 12000,
      onResult: (transcript) => {
        if (!transcript) return;
        const evaluation = scoreVietnamesePronunciation(
          currentSentence.textVi,
          transcript
        );
        setSentenceEvals((prev) => ({
          ...prev,
          [currentSentence.id]: { spoken: transcript, evaluation },
        }));
        listeningTargetRef.current = null;
      },
    });
  };

  const handleSentenceFallbackScore = (e) => {
    e.preventDefault();
    if (!currentSentence || !manualText.trim()) return;
    const evaluation = scoreVietnamesePronunciation(
      currentSentence.textVi,
      manualText.trim()
    );
    setSentenceEvals((prev) => ({
      ...prev,
      [currentSentence.id]: { spoken: manualText.trim(), evaluation },
    }));
  };

  const handleFinishSession = () => {
    stopSpeak();
    stopListening();
    const evalMap =
      subMode === "minimal-pairs" ? pairEvaluations : sentenceEvals;
    const entries = Object.values(evalMap);
    const practicedCount = entries.length;
    const avgScore =
      practicedCount > 0
        ? Math.round(
            entries.reduce((sum, item) => sum + (item.evaluation?.score || 0), 0) /
              practicedCount
          )
        : 0;
    const avgTone =
      practicedCount > 0
        ? Math.round(
            entries.reduce(
              (sum, item) => sum + (item.evaluation?.toneAccuracy || 0),
              0
            ) / practicedCount
          )
        : 0;
    const durationSec = Math.max(
      1,
      Math.round((Date.now() - startTimeRef.current) / 1000)
    );
    const xpEarned = Math.max(
      15,
      Math.round(practicedCount * 12 + avgScore * 0.3)
    );

    const summary = {
      subMode,
      practicedCount,
      avgScore,
      avgTone,
      xpEarned,
    };
    setSessionSummary(summary);

    if (typeof onCompleteSession === "function") {
      onCompleteSession({
        gameType:
          subMode === "minimal-pairs"
            ? GAME_TYPES.TONE_RADAR
            : GAME_TYPES.PRONUNCIATION_LAB,
        topicId: activeTopicId === "all" ? null : activeTopicId,
        skillTags: ["pronunciation", "speaking", "listening"],
        score: avgScore,
        maxScore: 100,
        accuracy: avgScore,
        durationSec,
        durationSeconds: durationSec,
        details: {
          subMode,
          practicedCount,
          avgTone,
          xpEarned,
        },
      });
    }
  };

  if (sessionSummary) {
    return (
      <div className="vf-g-summary" data-testid="pronunciation-summary">
        <div className="vf-g-summary-kicker">Kết quả ngữ âm</div>
        <h2 className="vf-g-summary-title">Tổng kết luyện phát âm</h2>
        <p className="vf-g-summary-sub">
          {sessionSummary.avgTone >= 80
            ? "Độ chính xác thanh điệu ổn định. Tiếp tục giữ nhịp ngắt nghỉ tự nhiên."
            : "Bạn đang nắm dần cao độ — hãy để ý thêm cặp thanh Hỏi / Ngã và Sắc / Huyền."}
        </p>

        <div className="vf-g-summary-grid">
          <div className="vf-g-metric-box">
            <div
              className="vf-g-metric-value vf-g-mono"
              style={{ color: "var(--g-good)" }}
            >
              {sessionSummary.avgScore}%
            </div>
            <div className="vf-g-metric-label">Điểm phát âm trung bình</div>
          </div>
          <div className="vf-g-metric-box">
            <div className="vf-g-metric-value vf-g-mono">
              {sessionSummary.avgTone}%
            </div>
            <div className="vf-g-metric-label">Chuẩn thanh điệu</div>
          </div>
          <div className="vf-g-metric-box">
            <div className="vf-g-metric-value vf-g-mono">
              +{sessionSummary.xpEarned} XP
            </div>
            <div className="vf-g-metric-label">
              Đã luyện {sessionSummary.practicedCount} mục
            </div>
          </div>
        </div>

        <div className="vf-g-summary-actions">
          <button
            type="button"
            className="vf-g-btn vf-g-btn--primary"
            onClick={() => {
              setSessionSummary(null);
              startTimeRef.current = Date.now();
            }}
          >
            <RotateCcw size={15} /> Luyện tiếp
          </button>
          {onBack && (
            <button type="button" className="vf-g-btn" onClick={onBack}>
              <ArrowLeft size={15} /> Về danh sách bài tập
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentSentenceEval = currentSentence
    ? sentenceEvals[currentSentence.id]
    : null;
  const practicedTotal =
    subMode === "minimal-pairs"
      ? Object.keys(pairEvaluations).length
      : Object.keys(sentenceEvals).length;

  return (
    <div data-testid="pronunciation-lab">
      {/* Sub-mode Underline Tabs */}
      <div className="vf-g-subtabs-row">
        <div className="vf-g-subtabs">
          <button
            type="button"
            className={`vf-g-subtab ${
              subMode === "minimal-pairs" ? "vf-g-subtab--active" : ""
            }`}
            onClick={() => {
              stopSpeak();
              stopListening();
              setSubMode("minimal-pairs");
            }}
            data-testid="pronunciation-tab-pairs"
          >
            <AudioLines size={15} /> 6 thanh điệu & cặp từ
          </button>
          <button
            type="button"
            className={`vf-g-subtab ${
              subMode === "shadowing" ? "vf-g-subtab--active" : ""
            }`}
            onClick={() => {
              stopSpeak();
              stopListening();
              setSubMode("shadowing");
            }}
            data-testid="pronunciation-tab-shadowing"
          >
            <Mic size={15} /> Luyện đọc câu
          </button>
        </div>

        {practicedTotal > 0 && (
          <button
            type="button"
            className="vf-g-btn vf-g-btn--good vf-g-btn--sm"
            style={{ marginBottom: "8px" }}
            onClick={handleFinishSession}
            data-testid="pronunciation-finish-btn"
          >
            <CheckCircle2 size={14} /> Lưu kết quả ({practicedTotal} mục)
          </button>
        )}
      </div>

      {subMode === "minimal-pairs" ? (
        <div className="vf-g-panel" data-testid="pronunciation-pairs-view">
          {/* Monochrome 6-Tone Contour Legend */}
          <div style={{ marginBottom: "14px" }}>
            <h3
              className="vf-g-serif"
              style={{
                margin: "0 0 4px",
                fontSize: "1.2rem",
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
            >
              Biểu đồ 6 thanh điệu tiếng Việt
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "0.86rem",
                color: "var(--g-text-secondary)",
              }}
            >
              Nhấn vào từng thanh để nghe âm mẫu và đối chiếu đường nét cao độ.
            </p>
          </div>

          <div className="vf-g-tone-legend">
            {toneLegend.map((tone) => (
              <button
                key={tone.id}
                type="button"
                className={`vf-g-tone-card ${
                  activeToneId === tone.id ? "vf-g-tone-card--active" : ""
                }`}
                onClick={() => handlePlayTone(tone)}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span className="vf-g-tone-name">{tone.nameVi}</span>
                  <Volume2
                    size={13}
                    color={
                      activeToneId === tone.id
                        ? "var(--g-accent)"
                        : "var(--g-text-muted)"
                    }
                  />
                </div>
                <svg
                  className="vf-g-tone-svg"
                  viewBox="0 0 80 34"
                  fill="none"
                  aria-hidden="true"
                >
                  <line
                    x1="4"
                    y1="17"
                    x2="76"
                    y2="17"
                    stroke="rgba(236,235,228,0.12)"
                    strokeDasharray="3 3"
                  />
                  <path
                    d={tone.svgPath}
                    className="vf-g-tone-stroke"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  {tone.dot && (
                    <circle
                      cx={tone.dot.cx}
                      cy={tone.dot.cy}
                      r="2.4"
                      className="vf-g-tone-dot"
                    />
                  )}
                </svg>
                <span className="vf-g-tone-example">{tone.example}</span>
                <span className="vf-g-tone-tip">{tone.contourNote}</span>
              </button>
            ))}
          </div>

          {/* Minimal Pair Practice */}
          {currentPair && (
            <div
              style={{
                borderTop: "1px solid var(--g-border)",
                paddingTop: "22px",
              }}
            >
              <div className="vf-g-session-meta" style={{ marginBottom: "14px" }}>
                <div className="vf-g-session-meta-group">
                  <strong className="vf-g-mono">
                    Cặp {pairIndex + 1} / {pairs.length}
                  </strong>
                  <span className="vf-g-dot-sep">·</span>
                  <span>
                    {currentPair.contrastType === "vowel"
                      ? "Đối chiếu nguyên âm"
                      : "Đối chiếu thanh điệu"}
                  </span>
                  <span className="vf-g-dot-sep">·</span>
                  <span>
                    {getTopicById?.(currentPair.topicId)?.titleVi ||
                      TOPIC_META[currentPair.topicId]?.titleVi}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    className="vf-g-btn vf-g-btn--sm"
                    disabled={pairIndex === 0}
                    onClick={() => setPairIndex((p) => Math.max(0, p - 1))}
                  >
                    <ArrowLeft size={14} /> Trước
                  </button>
                  <button
                    type="button"
                    className="vf-g-btn vf-g-btn--sm"
                    disabled={pairIndex >= pairs.length - 1}
                    onClick={() =>
                      setPairIndex((p) => Math.min(pairs.length - 1, p + 1))
                    }
                  >
                    Tiếp <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <h3
                  className="vf-g-serif"
                  style={{
                    margin: 0,
                    fontSize: "1.22rem",
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {currentPair.focusLabel}
                </h3>
                <button
                  type="button"
                  className="vf-g-btn vf-g-btn--primary vf-g-btn--sm"
                  onClick={handleListenBothPair}
                >
                  <Volume2 size={14} /> Nghe đối chiếu lần lượt
                </button>
              </div>

              {currentPair.tipVi && (
                <div className="vf-g-drawer vf-g-drawer--hint">
                  <strong style={{ fontWeight: 500 }}>Mẹo phát âm:</strong>{" "}
                  {currentPair.tipVi}
                </div>
              )}

              <div className="vf-g-pair-grid">
                {(currentPair.items || []).map((item, idx) => {
                  const key = `${currentPair.id}-${idx}`;
                  const evalEntry = pairEvaluations[key];
                  const isThisListening = isListening && activePairWordIdx === idx;
                  const ratingInfo = evalEntry?.evaluation?.rating
                    ? RATING_LABELS[evalEntry.evaluation.rating]
                    : null;

                  return (
                    <div
                      key={`${item.vi}-${idx}`}
                      className={`vf-g-pair-item ${
                        isThisListening ? "vf-g-pair-item--active" : ""
                      }`}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.78rem",
                              color: "var(--g-text-muted)",
                              fontWeight: 450,
                            }}
                          >
                            {formatToneBadge(item.tone)}
                          </span>
                        </div>

                        <h4 className="vf-g-pair-word">{item.vi}</h4>
                        <p
                          style={{
                            margin: "6px 0 12px",
                            color: "var(--g-text-secondary)",
                            fontSize: "0.9rem",
                            lineHeight: 1.55,
                          }}
                        >
                          {item.meaningVi}
                        </p>

                        {item.exampleVi && (
                          <button
                            type="button"
                            className="vf-g-phrase-row"
                            style={{ width: "100%", justifyContent: "space-between" }}
                            onClick={() => speak(item.exampleVi, { rate: 0.95 })}
                          >
                            <span className="vf-g-phrase-vi">“{item.exampleVi}”</span>
                            <Volume2 size={14} />
                          </button>
                        )}
                      </div>

                      <div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <button
                            type="button"
                            className="vf-g-btn vf-g-btn--sm"
                            onClick={() => speak(item.vi, { rate: 0.85 })}
                          >
                            <Volume2 size={14} /> Nghe từ
                          </button>
                          <button
                            type="button"
                            className={`vf-g-mic-btn vf-g-mic-btn--sm ${
                              isThisListening ? "vf-g-mic-btn--listening" : ""
                            }`}
                            disabled={!sttSupported}
                            onClick={() => handleMicForPairWord(item, idx)}
                            data-testid={`pair-mic-btn-${idx}`}
                          >
                            {isThisListening ? (
                              <MicOff size={14} />
                            ) : (
                              <Mic size={14} />
                            )}
                            {isThisListening ? "Dừng" : "Đọc kiểm tra"}
                          </button>
                        </div>

                        {evalEntry && (
                          <div
                            style={{
                              marginTop: "12px",
                              padding: "11px 13px",
                              borderRadius: "9px",
                              background: "var(--g-canvas)",
                              border: "1px solid var(--g-border)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "8px",
                                marginBottom: "6px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.82rem",
                                  color: "var(--g-text-muted)",
                                }}
                              >
                                Bạn nói:{" "}
                                <span
                                  className="vf-g-serif"
                                  style={{
                                    color: "var(--g-text)",
                                    fontWeight: 500,
                                    fontSize: "0.94rem",
                                  }}
                                >
                                  {evalEntry.spoken}
                                </span>
                              </span>
                              <span
                                className={`vf-g-tag vf-g-mono ${
                                  ratingInfo?.tagClass || "vf-g-tag--slate"
                                }`}
                              >
                                {evalEntry.evaluation.score}%
                              </span>
                            </div>
                            <WordDiffStrip
                              wordDiffs={evalEntry.evaluation.wordDiffs}
                              onSpeakWord={(w) => speak(w, { rate: 0.85 })}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fallback input for quiet environments / browsers without STT */}
              <div className="vf-g-fallback-box">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.84rem",
                      color: "var(--g-text-secondary)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                    }}
                  >
                    <Keyboard size={15} color="var(--g-text-muted)" />
                    Kiểm tra thanh điệu không cần micro (nhập mô phỏng)
                  </span>
                  <button
                    type="button"
                    className="vf-g-btn vf-g-btn--ghost vf-g-btn--sm"
                    onClick={() => setShowFallback((prev) => !prev)}
                  >
                    {showFallback ? "Thu gọn" : "Mở nhập mô phỏng"}
                  </button>
                </div>

                {showFallback && (
                  <form
                    onSubmit={handlePairFallbackScore}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "12px",
                      alignItems: "center",
                    }}
                  >
                    <select
                      className="vf-g-input"
                      style={{ width: "auto", minWidth: "130px" }}
                      value={pairManualTargetIdx}
                      onChange={(e) =>
                        setPairManualTargetIdx(Number(e.target.value))
                      }
                      aria-label="Chọn từ mục tiêu"
                    >
                      {(currentPair.items || []).map((item, idx) => (
                        <option key={item.vi} value={idx}>
                          Từ mẫu: {item.vi}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      className="vf-g-input"
                      style={{ flex: 1, minWidth: "180px" }}
                      value={pairManualText}
                      onChange={(e) => setPairManualText(e.target.value)}
                      placeholder="Nhập từ bạn muốn chấm thử (vd: mời hoặc mới)..."
                    />
                    <button
                      type="submit"
                      className="vf-g-btn vf-g-btn--primary vf-g-btn--sm"
                    >
                      Chấm thanh điệu
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Sub-mode B: Sentence Shadowing */
        <div className="vf-g-panel" data-testid="pronunciation-shadowing-view">
          {currentSentence && (
            <>
              <div className="vf-g-session-meta" style={{ marginBottom: "18px" }}>
                <div className="vf-g-session-meta-group">
                  <strong className="vf-g-mono">
                    Câu {sentenceIndex + 1} / {sentences.length}
                  </strong>
                  <span className="vf-g-dot-sep">·</span>
                  <span>
                    {getTopicById?.(currentSentence.topicId)?.titleVi ||
                      TOPIC_META[currentSentence.topicId]?.titleVi}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <div className="vf-g-speed-group">
                    {[0.75, 0.95, 1.1].map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        className={`vf-g-speed-btn ${
                          rate === sp ? "vf-g-speed-btn--active" : ""
                        }`}
                        onClick={() => setRate(sp)}
                      >
                        {sp}x
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="vf-g-btn vf-g-btn--sm"
                    disabled={sentenceIndex === 0}
                    onClick={() => {
                      stopSpeak();
                      stopListening();
                      setSentenceIndex((i) => Math.max(0, i - 1));
                    }}
                    aria-label="Câu trước"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    type="button"
                    className="vf-g-btn vf-g-btn--sm"
                    disabled={sentenceIndex >= sentences.length - 1}
                    onClick={() => {
                      stopSpeak();
                      stopListening();
                      setSentenceIndex((i) =>
                        Math.min(sentences.length - 1, i + 1)
                      );
                    }}
                    aria-label="Câu tiếp theo"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Target Sentence Card */}
              <div className="vf-g-audio-stage">
                <p className="vf-g-shadow-sentence">
                  “{currentSentence.textVi}”
                </p>

                <div
                  style={{
                    fontSize: "0.92rem",
                    color: "var(--g-text-secondary)",
                    marginBottom: "10px",
                    lineHeight: 1.55,
                  }}
                >
                  {currentSentence.meaningEn}
                </div>

                {currentSentence.focusNoteVi && (
                  <div
                    style={{
                      fontSize: "0.84rem",
                      color: "#e6c48c",
                      marginBottom: "14px",
                    }}
                  >
                    Trọng tâm: {currentSentence.focusNoteVi}
                  </div>
                )}

                {Array.isArray(currentSentence.difficultWords) &&
                  currentSentence.difficultWords.length > 0 && (
                    <div style={{ marginBottom: "18px" }}>
                      <div
                        className="vf-g-section-kicker"
                        style={{ marginBottom: "6px" }}
                      >
                        Từ cần chú ý thanh điệu (nhấn để nghe riêng)
                      </div>
                      <div className="vf-g-vocab-chips" style={{ marginTop: 0 }}>
                        {currentSentence.difficultWords.map((word) => (
                          <button
                            key={word}
                            type="button"
                            className="vf-g-vocab-chip"
                            onClick={() => speak(word, { rate: 0.85 })}
                          >
                            <Volume2 size={13} />{" "}
                            <span
                              className="vf-g-serif"
                              style={{ fontSize: "0.95rem", fontWeight: 400 }}
                            >
                              {word}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Controls: Listen + Tactile Mic */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "10px",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--g-border)",
                  }}
                >
                  <button
                    type="button"
                    className="vf-g-btn"
                    onClick={() =>
                      isSpeaking
                        ? stopSpeak()
                        : speak(currentSentence.textVi, { rate })
                    }
                  >
                    <Volume2 size={16} />
                    {isSpeaking ? "Dừng âm mẫu" : "Nghe câu mẫu"}
                  </button>

                  <button
                    type="button"
                    className={`vf-g-mic-btn ${
                      isListening ? "vf-g-mic-btn--listening" : ""
                    }`}
                    onClick={handleMicForSentence}
                    disabled={!sttSupported}
                    data-testid="shadowing-mic-btn"
                  >
                    {isListening ? <MicOff size={17} /> : <Mic size={17} />}
                    {isListening
                      ? "Đang nghe — Nhấn để dừng"
                      : "Đọc câu này qua micro"}
                  </button>
                </div>

                {isListening && (
                  <div style={{ marginTop: "14px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.79rem",
                          color: "var(--g-text-secondary)",
                          fontWeight: 500,
                        }}
                      >
                        Mức âm thanh
                      </span>
                      <div className="vf-g-level-meter">
                        <div
                          className="vf-g-level-fill"
                          style={{
                            width: `${Math.max(
                              8,
                              Math.round((micLevel || 0) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="vf-g-drawer" style={{ marginTop: "6px" }}>
                      <span
                        style={{
                          color: "var(--g-text-muted)",
                          fontSize: "0.82rem",
                        }}
                      >
                        Đang nhận diện:{" "}
                      </span>
                      <span>
                        {interimTranscript || "Hãy đọc rõ ràng từng âm tiết..."}
                      </span>
                    </div>
                  </div>
                )}

                {speechError && (
                  <div
                    className="vf-g-drawer"
                    style={{
                      borderLeft: "2px solid var(--g-bad)",
                      color: "#f0b1b1",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <AlertCircle size={15} />
                    <span>{speechError}</span>
                  </div>
                )}

                {lastRecordingUrl && (
                  <div
                    style={{
                      marginTop: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.83rem",
                        color: "var(--g-text-secondary)",
                      }}
                    >
                      Bản ghi của bạn:
                    </span>
                    <audio
                      controls
                      src={lastRecordingUrl}
                      style={{ height: "34px" }}
                    />
                  </div>
                )}
              </div>

              {/* Word-by-Word Tone Evaluation */}
              {currentSentenceEval && (
                <div
                  className="vf-g-feedback-box"
                  style={{ marginTop: 0, marginBottom: "18px" }}
                  data-testid="shadowing-evaluation"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--g-text-muted)",
                        }}
                      >
                        Nội dung nhận diện được
                      </span>
                      <div
                        className="vf-g-serif"
                        style={{
                          fontSize: "1.02rem",
                          fontWeight: 400,
                          color: "var(--g-text)",
                          marginTop: "3px",
                          lineHeight: 1.55,
                        }}
                      >
                        “{currentSentenceEval.spoken}”
                      </div>
                    </div>
                    {RATING_LABELS[currentSentenceEval.evaluation.rating] && (
                      <span
                        className={`vf-g-tag ${
                          RATING_LABELS[currentSentenceEval.evaluation.rating]
                            .tagClass
                        }`}
                      >
                        {
                          RATING_LABELS[currentSentenceEval.evaluation.rating]
                            .label
                        }
                      </span>
                    )}
                  </div>

                  <div className="vf-g-score-metrics">
                    <div className="vf-g-metric-box">
                      <div
                        className="vf-g-metric-value vf-g-mono"
                        style={{ color: "var(--g-good)" }}
                      >
                        {currentSentenceEval.evaluation.score}%
                      </div>
                      <div className="vf-g-metric-label">Điểm tổng</div>
                    </div>
                    <div className="vf-g-metric-box">
                      <div
                        className="vf-g-metric-value vf-g-mono"
                        style={{ color: "var(--g-warn)" }}
                      >
                        {currentSentenceEval.evaluation.toneAccuracy}%
                      </div>
                      <div className="vf-g-metric-label">Chuẩn thanh điệu</div>
                    </div>
                    <div className="vf-g-metric-box">
                      <div
                        className="vf-g-metric-value vf-g-mono"
                        style={{ color: "var(--g-slate)" }}
                      >
                        {currentSentenceEval.evaluation.wordAccuracy}%
                      </div>
                      <div className="vf-g-metric-label">Đúng từ vựng</div>
                    </div>
                  </div>

                  {currentSentenceEval.evaluation.feedbackVi && (
                    <p
                      style={{
                        margin: "0 0 12px",
                        fontSize: "0.89rem",
                        color: "var(--g-text-secondary)",
                        lineHeight: 1.55,
                      }}
                    >
                      {currentSentenceEval.evaluation.feedbackVi}
                    </p>
                  )}

                  <WordDiffStrip
                    wordDiffs={currentSentenceEval.evaluation.wordDiffs}
                    onSpeakWord={(w) => speak(w, { rate: 0.85 })}
                  />
                </div>
              )}

              {/* Graceful Fallback Practice Mode */}
              <div className="vf-g-fallback-box">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.84rem",
                      color: "var(--g-text-secondary)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                    }}
                  >
                    <Keyboard size={15} color="var(--g-text-muted)" />
                    {!sttSupported
                      ? "Trình duyệt chưa hỗ trợ micro — dùng khung nhập bên dưới để kiểm tra thanh điệu:"
                      : "Nhập văn bản mô phỏng (khi ở nơi yên tĩnh hoặc muốn kiểm thử thanh điệu)"}
                  </span>
                  <button
                    type="button"
                    className="vf-g-btn vf-g-btn--ghost vf-g-btn--sm"
                    onClick={() => setShowFallback((prev) => !prev)}
                    data-testid="shadowing-fallback-toggle"
                  >
                    {showFallback ? "Ẩn" : "Mở nhập mô phỏng"}
                  </button>
                </div>

                {showFallback && (
                  <form
                    onSubmit={handleSentenceFallbackScore}
                    style={{ marginTop: "12px", display: "grid", gap: "10px" }}
                  >
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <input
                        type="text"
                        className="vf-g-input"
                        style={{ flex: 1, minWidth: "220px" }}
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        placeholder="Gõ câu tiếng Việt để kiểm tra độ chuẩn thanh điệu..."
                        data-testid="shadowing-fallback-input"
                      />
                      <button
                        type="submit"
                        className="vf-g-btn vf-g-btn--primary"
                        data-testid="shadowing-fallback-submit"
                      >
                        Chấm điểm phát âm
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default PronunciationLab;
