import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  Square,
  Volume2,
  XCircle,
} from "lucide-react";
import { LISTENING_EXERCISES, getTopicById } from "../../data";
import { GAME_TYPES, TOPIC_META } from "../../lib/contracts";
import * as speechApi from "../../lib/speech";
import { useVietnameseSpeech } from "../../hooks/useVietnameseSpeech";

const SPEED_OPTIONS = [
  { value: 0.75, label: "0.75x" },
  { value: 1, label: "1.0x" },
  { value: 1.15, label: "1.15x" },
];

const TYPE_LABELS = {
  comprehension: "Nghe hiểu",
  "best-response": "Phản hồi tự nhiên",
  "fill-blank": "Nghe điền thông tin",
};

const WAVE_HEIGHTS = [8, 14, 20, 11, 24, 16, 9, 22, 15, 21, 12, 18, 13, 8, 16, 10];
const OPTION_LETTERS = ["A", "B", "C", "D"];

function shuffleList(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const ALL_TOPICS_ROUND_SIZE = 8;

function buildRound(
  allExercises,
  activeTopicId,
  roundSeed = 0,
  previouslySeenIds = new Set()
) {
  const safeList = Array.isArray(allExercises) ? allExercises : [];
  if (safeList.length === 0) return [];

  if (activeTopicId && activeTopicId !== "all") {
    const filtered = safeList.filter((item) => item.topicId === activeTopicId);
    if (filtered.length > 0) {
      return roundSeed > 0 ? shuffleList(filtered) : filtered;
    }
  }

  const seen = previouslySeenIds instanceof Set ? previouslySeenIds : new Set();
  const unseenShuffled = shuffleList(safeList.filter((ex) => !seen.has(ex.id)));
  const seenShuffled = shuffleList(safeList.filter((ex) => seen.has(ex.id)));
  const prioritized = [...unseenShuffled, ...seenShuffled];

  // Deal 1 per topic first (preferring unseen exercises in each topic)
  const byTopic = new Map();
  for (const ex of prioritized) {
    if (!byTopic.has(ex.topicId)) {
      byTopic.set(ex.topicId, ex);
    }
  }
  const picked = Array.from(byTopic.values());
  const pickedIds = new Set(picked.map((x) => x.id));

  // Add bonus exercises (up to 8 total) preferring unseen exercises from distinct topics
  const bonusTopics = new Set();
  for (const ex of prioritized) {
    if (picked.length >= ALL_TOPICS_ROUND_SIZE) break;
    if (!pickedIds.has(ex.id) && !bonusTopics.has(ex.topicId)) {
      picked.push(ex);
      pickedIds.add(ex.id);
      bonusTopics.add(ex.topicId);
    }
  }

  for (const ex of prioritized) {
    if (picked.length >= ALL_TOPICS_ROUND_SIZE) break;
    if (!pickedIds.has(ex.id)) {
      picked.push(ex);
      pickedIds.add(ex.id);
    }
  }

  return shuffleList(picked);
}

export function ListeningGame({
  activeTopicId = "all",
  onCompleteSession,
  onAutoSyncStep,
  onSavePartialSession,
  onBack,
}) {
  const {
    isSpeaking,
    isLoadingAudio = false,
    rate,
    setRate,
    voice,
    speak,
    stopSpeak,
  } = useVietnameseSpeech({
    defaultRate: 1,
  });

  const [roundSeed, setRoundSeed] = useState(0);
  const seenIdsRef = useRef(new Set());
  const prevTopicRef = useRef(activeTopicId);
  if (prevTopicRef.current !== activeTopicId) {
    prevTopicRef.current = activeTopicId;
    seenIdsRef.current.clear();
  }

  const exercises = useMemo(
    () =>
      buildRound(
        LISTENING_EXERCISES,
        activeTopicId,
        roundSeed,
        seenIdsRef.current
      ),
    [activeTopicId, roundSeed]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const [totalReplays, setTotalReplays] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [completed, setCompleted] = useState(false);

  const startTimeRef = useRef(Date.now());
  const reportedRef = useRef(false);
  const stepSyncedXpRef = useRef(0);
  const answersRef = useRef([]);
  const bestStreakRef = useRef(0);
  const totalReplaysRef = useRef(0);
  const exercisesLengthRef = useRef(0);
  const activeTopicIdRef = useRef(activeTopicId);
  const onAutoSyncStepRef = useRef(onAutoSyncStep);
  const onSavePartialSessionRef = useRef(onSavePartialSession);

  bestStreakRef.current = bestStreak;
  totalReplaysRef.current = totalReplays;
  exercisesLengthRef.current = exercises.length;
  activeTopicIdRef.current = activeTopicId;
  onAutoSyncStepRef.current = onAutoSyncStep;
  onSavePartialSessionRef.current = onSavePartialSession;

  const currentExercise = exercises[currentIndex] || null;
  const topicMeta = currentExercise
    ? getTopicById?.(currentExercise.topicId) || TOPIC_META[currentExercise.topicId]
    : null;

  useEffect(() => {
    stopSpeak();
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setShowHint(false);
    setShowTranscript(false);
    setReplayCount(0);
    setTotalReplays(0);
    setStreak(0);
    setBestStreak(0);
    setXpEarned(0);
    setAnswers([]);
    answersRef.current = [];
    stepSyncedXpRef.current = 0;
    setCompleted(false);
    startTimeRef.current = Date.now();
    reportedRef.current = false;
  }, [activeTopicId, roundSeed, stopSpeak]);

  const currentAudioVi = currentExercise?.audioTextVi || "";
  const nextAudio1Vi = exercises[currentIndex + 1]?.audioTextVi || "";
  const nextAudio2Vi = exercises[currentIndex + 2]?.audioTextVi || "";

  useEffect(() => {
    if (completed) return;
    if (typeof speechApi.prefetchVietnamese !== "function") return;
    const texts = [currentAudioVi, nextAudio1Vi, nextAudio2Vi].filter(Boolean);
    if (texts.length > 0) {
      speechApi.prefetchVietnamese(texts, voice ? { voice } : {});
    }
  }, [completed, currentAudioVi, nextAudio1Vi, nextAudio2Vi, voice]);

  useEffect(() => {
    if (completed || typeof window === "undefined") return undefined;
    if (typeof speechApi.prefetchVietnamese !== "function") return undefined;
    const voiceChangeEvent =
      speechApi.VOICE_CHANGE_EVENT || "vietflow:voice-change";

    const handleVoiceChange = (event) => {
      const nextVoice =
        event?.detail?.voice || speechApi.getSelectedVoice?.() || "";
      const texts = [currentAudioVi, nextAudio1Vi, nextAudio2Vi].filter(Boolean);
      if (texts.length > 0) {
        speechApi.prefetchVietnamese(texts, nextVoice ? { voice: nextVoice } : {});
      }
    };

    window.addEventListener(voiceChangeEvent, handleVoiceChange);
    return () => window.removeEventListener(voiceChangeEvent, handleVoiceChange);
  }, [completed, currentAudioVi, nextAudio1Vi, nextAudio2Vi]);

  useEffect(() => {
    return () => {
      stopSpeak();
      speechApi.stopSpeaking?.();
      const ans = answersRef.current;
      if (
        !reportedRef.current &&
        ans.length > 0 &&
        typeof onSavePartialSessionRef.current === "function"
      ) {
        reportedRef.current = true;
        const correctCount = ans.filter((a) => a.isCorrect).length;
        const answeredCount = ans.length;
        const accuracy = Math.round((correctCount / answeredCount) * 100);
        const durationSec = Math.max(
          1,
          Math.round((Date.now() - startTimeRef.current) / 1000)
        );
        const hasStepSync = typeof onAutoSyncStepRef.current === "function";
        onSavePartialSessionRef.current({
          gameType: GAME_TYPES.LISTEN_MATCH,
          topicId:
            activeTopicIdRef.current === "all" ? null : activeTopicIdRef.current,
          skillTags: ["listening", "reading"],
          score: correctCount,
          maxScore: Math.max(
            answeredCount,
            exercisesLengthRef.current || answeredCount
          ),
          accuracy,
          durationSec,
          durationSeconds: durationSec,
          details: {
            partial: true,
            answeredCount,
            bestStreak: bestStreakRef.current,
            totalReplays: totalReplaysRef.current,
            xpEarned: stepSyncedXpRef.current,
          },
          ...(hasStepSync
            ? { stepSynced: true, stepSyncedXp: stepSyncedXpRef.current }
            : {}),
        });
      }
    };
  }, [stopSpeak]);

  const handlePlayAudio = () => {
    if (!currentExercise) return;
    if (isSpeaking || isLoadingAudio) {
      stopSpeak();
      return;
    }
    setReplayCount((prev) => prev + 1);
    setTotalReplays((prev) => prev + 1);
    speak(currentExercise.audioTextVi, { rate });
  };

  const handleSpeakVocab = (word) => {
    speak(word, { rate: Math.min(rate, 1) });
  };

  const handleSelectOption = (optionId) => {
    if (!currentExercise || selectedOptionId !== null) return;
    stopSpeak();

    const isCorrect = optionId === currentExercise.correctOptionId;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const nextBestStreak = Math.max(bestStreak, nextStreak);
    const gainedXp = isCorrect ? 15 + Math.min(nextStreak, 4) * 5 : 4;

    setSelectedOptionId(optionId);
    setShowTranscript(true);
    setStreak(nextStreak);
    setBestStreak(nextBestStreak);
    setXpEarned((prev) => prev + gainedXp);
    const nextAnswers = [
      ...answersRef.current,
      {
        exerciseId: currentExercise.id,
        titleVi: currentExercise.titleVi,
        audioTextVi: currentExercise.audioTextVi,
        selectedOptionId: optionId,
        correctOptionId: currentExercise.correctOptionId,
        isCorrect,
      },
    ];
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);

    if (typeof onAutoSyncStep === "function") {
      stepSyncedXpRef.current += gainedXp;
      onAutoSyncStep({
        skillTags: ["listening", "reading"],
        accuracy: isCorrect ? 100 : 35,
        topicId:
          currentExercise.topicId ||
          (activeTopicId === "all" ? null : activeTopicId),
        xpDelta: gainedXp,
      });
    }
  };

  const finishRound = () => {
    stopSpeak();
    setCompleted(true);
    if (!reportedRef.current && typeof onCompleteSession === "function") {
      reportedRef.current = true;
      const correctCount = answers.filter((a) => a.isCorrect).length;
      const maxScore = Math.max(1, exercises.length);
      const accuracy = Math.round((correctCount / maxScore) * 100);
      const durationSec = Math.max(
        1,
        Math.round((Date.now() - startTimeRef.current) / 1000)
      );
      onCompleteSession({
        gameType: GAME_TYPES.LISTEN_MATCH,
        topicId: activeTopicId === "all" ? null : activeTopicId,
        skillTags: ["listening", "reading"],
        score: correctCount,
        maxScore,
        accuracy,
        durationSec,
        durationSeconds: durationSec,
        details: {
          bestStreak,
          totalReplays,
          xpEarned,
        },
        ...(typeof onAutoSyncStep === "function"
          ? { stepSynced: true, stepSyncedXp: stepSyncedXpRef.current }
          : {}),
      });
    }
  };

  const handleNext = () => {
    stopSpeak();
    if (currentIndex + 1 >= exercises.length) {
      finishRound();
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedOptionId(null);
    setShowHint(false);
    setShowTranscript(false);
    setReplayCount(0);
  };

  const handleRestart = () => {
    if (!activeTopicId || activeTopicId === "all") {
      for (const ex of exercises) {
        seenIdsRef.current.add(ex.id);
      }
      if (seenIdsRef.current.size >= LISTENING_EXERCISES.length) {
        seenIdsRef.current = new Set(exercises.map((ex) => ex.id));
      }
    }
    setRoundSeed((prev) => prev + 1);
  };

  if (exercises.length === 0) {
    return (
      <div className="vf-g-panel" style={{ textAlign: "center" }}>
        <p style={{ color: "var(--g-text-secondary)" }}>
          Chưa có bài nghe cho chủ đề này.
        </p>
        {onBack && (
          <button type="button" className="vf-g-btn" onClick={onBack}>
            <ArrowLeft size={15} /> Quay lại
          </button>
        )}
      </div>
    );
  }

  const answered = selectedOptionId !== null;
  const isCurrentCorrect =
    answered && selectedOptionId === currentExercise?.correctOptionId;
  const selectedOptionObj = currentExercise?.options?.find(
    (opt) => opt.id === selectedOptionId
  );
  const correctOptionObj = currentExercise?.options?.find(
    (opt) => opt.id === currentExercise.correctOptionId
  );

  if (completed) {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const accuracy = Math.round(
      (correctCount / Math.max(1, exercises.length)) * 100
    );

    return (
      <div className="vf-g-summary" data-testid="listening-summary">
        <div className="vf-g-summary-kicker">Tổng kết bài nghe</div>
        <h2 className="vf-g-summary-title">Hoàn thành phần nghe hiểu</h2>
        <p className="vf-g-summary-sub">
          {accuracy >= 80
            ? "Bạn nắm ý chính khá vững ở tốc độ nói tự nhiên."
            : "Hãy nghe lại các câu còn nhầm ở mức 0.75x để nghe rõ thanh điệu hơn."}
        </p>

        <div className="vf-g-summary-grid">
          <div className="vf-g-metric-box">
            <div
              className="vf-g-metric-value vf-g-mono"
              style={{ color: "var(--g-good)" }}
            >
              {accuracy}%
            </div>
            <div className="vf-g-metric-label">
              Chính xác ({correctCount}/{exercises.length})
            </div>
          </div>
          <div className="vf-g-metric-box">
            <div className="vf-g-metric-value vf-g-mono">+{xpEarned} XP</div>
            <div className="vf-g-metric-label">Điểm luyện tập</div>
          </div>
          <div className="vf-g-metric-box">
            <div className="vf-g-metric-value vf-g-mono">{bestStreak}</div>
            <div className="vf-g-metric-label">Chuỗi đúng dài nhất</div>
          </div>
        </div>

        <div
          style={{
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginTop: "18px",
          }}
        >
          {answers.map((item, idx) => (
            <div
              key={item.exerciseId}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "9px",
                background: "var(--g-card)",
                border: "1px solid var(--g-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {item.isCorrect ? (
                  <CheckCircle2 size={16} color="var(--g-good)" />
                ) : (
                  <XCircle size={16} color="var(--g-bad)" />
                )}
                <span
                  className="vf-g-serif"
                  style={{ fontSize: "0.95rem", color: "var(--g-text)" }}
                >
                  <span
                    className="vf-g-mono"
                    style={{
                      color: "var(--g-text-muted)",
                      marginRight: "8px",
                      fontSize: "0.8rem",
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  {item.titleVi}
                </span>
              </div>
              <button
                type="button"
                className="vf-g-btn vf-g-btn--ghost vf-g-btn--sm"
                onClick={() => speak(item.audioTextVi, { rate: 0.9 })}
                aria-label={`Nghe lại câu ${idx + 1}`}
              >
                <Volume2 size={14} /> Nghe lại
              </button>
            </div>
          ))}
        </div>

        <div className="vf-g-summary-actions">
          <button
            type="button"
            className="vf-g-btn vf-g-btn--primary"
            onClick={handleRestart}
          >
            <RotateCcw size={15} /> Luyện vòng mới
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

  const progressPct =
    ((currentIndex + (answered ? 1 : 0)) / exercises.length) * 100;

  return (
    <div className="vf-g-panel" data-testid="listening-game">
      {/* Quiet Meta Strip */}
      <div className="vf-g-session-meta">
        <div className="vf-g-session-meta-group">
          <strong className="vf-g-mono">
            Câu {currentIndex + 1} / {exercises.length}
          </strong>
          {topicMeta && (
            <>
              <span className="vf-g-dot-sep">·</span>
              <span>{topicMeta.titleVi}</span>
            </>
          )}
          <span className="vf-g-dot-sep">·</span>
          <span>{TYPE_LABELS[currentExercise.type] || "Nghe hiểu"}</span>
        </div>

        <div className="vf-g-session-meta-group vf-g-mono">
          <span>Chuỗi {streak}</span>
          <span className="vf-g-dot-sep">·</span>
          <span>{xpEarned} XP</span>
        </div>
      </div>

      <div className="vf-g-progress-track">
        <div
          className="vf-g-progress-fill"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Distraction-Free Audio Bar */}
      <div className="vf-g-audio-stage">
        <div className="vf-g-audio-header">
          <div>
            <div className="vf-g-audio-speaker">
              {currentExercise.speakerLabel || "Người bản xứ"}
            </div>
            <h3 className="vf-g-audio-title">{currentExercise.titleVi}</h3>
          </div>
          <span
            className="vf-g-mono"
            style={{ fontSize: "0.78rem", color: "var(--g-text-muted)" }}
            data-testid="listening-replay-count"
          >
            Đã nghe {replayCount} lần
          </span>
        </div>

        <div className="vf-g-audio-bar-row">
          <div className="vf-g-audio-bar-left">
            <button
              type="button"
              className="vf-g-btn vf-g-btn--primary"
              onClick={handlePlayAudio}
              aria-busy={isLoadingAudio}
              data-testid="listening-play-btn"
            >
              {isLoadingAudio ? (
                <>
                  <Loader2 size={14} aria-hidden="true" /> Đang tải...
                </>
              ) : isSpeaking ? (
                <>
                  <Square size={14} /> Dừng
                </>
              ) : (
                <>
                  <Play size={14} />{" "}
                  {replayCount > 0 ? "Nghe lại" : "Phát đoạn nói"}
                </>
              )}
            </button>

            <div
              className={`vf-g-soundwave ${
                isSpeaking && !isLoadingAudio ? "vf-g-soundwave--playing" : ""
              }`}
              aria-hidden="true"
            >
              {WAVE_HEIGHTS.map((h, i) => (
                <span
                  key={i}
                  className="vf-g-wave-bar"
                  style={{
                    height: isSpeaking && !isLoadingAudio ? undefined : `${h}px`,
                    animationDelay: `${(i % 7) * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>

          <div
            className="vf-g-speed-group"
            role="group"
            aria-label="Tốc độ phát âm"
          >
            {SPEED_OPTIONS.map((sp) => (
              <button
                key={sp.value}
                type="button"
                className={`vf-g-speed-btn ${
                  rate === sp.value ? "vf-g-speed-btn--active" : ""
                }`}
                onClick={() => setRate(sp.value)}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>

        <div className="vf-g-audio-extras">
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {currentExercise.hintVi && (
              <button
                type="button"
                className={`vf-g-btn vf-g-btn--sm ${
                  showHint ? "vf-g-btn--warn" : "vf-g-btn--ghost"
                }`}
                onClick={() => setShowHint((prev) => !prev)}
              >
                <Lightbulb size={14} /> {showHint ? "Ẩn gợi ý" : "Gợi ý"}
              </button>
            )}
            <button
              type="button"
              className="vf-g-btn vf-g-btn--ghost vf-g-btn--sm"
              onClick={() => setShowTranscript((prev) => !prev)}
              data-testid="listening-transcript-toggle"
            >
              <FileText size={14} />{" "}
              {showTranscript ? "Ẩn bản chữ" : "Hiện bản chữ"}
            </button>
          </div>
          <span style={{ fontSize: "0.77rem", color: "var(--g-text-muted)" }}>
            Nên nghe 1–2 lần trước khi mở bản chữ.
          </span>
        </div>

        {showHint && currentExercise.hintVi && (
          <div className="vf-g-drawer vf-g-drawer--hint">
            <strong style={{ fontWeight: 500 }}>Gợi ý:</strong>{" "}
            {currentExercise.hintVi}
          </div>
        )}

        {showTranscript && (
          <div className="vf-g-drawer" data-testid="listening-transcript">
            <div className="vf-g-transcript-text">
              “{currentExercise.transcriptVi || currentExercise.audioTextVi}”
            </div>
            {currentExercise.translationEn && (
              <div
                style={{ fontSize: "0.84rem", color: "var(--g-text-muted)" }}
              >
                {currentExercise.translationEn}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Question & Clean Test-Booklet Answer Rows */}
      <h4 className="vf-g-question-text">{currentExercise.questionVi}</h4>

      <div className="vf-g-options-list">
        {(currentExercise.options || []).map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id;
          const isCorrectOpt = opt.id === currentExercise.correctOptionId;

          let rowStateClass = "";
          if (answered) {
            if (isCorrectOpt) rowStateClass = "vf-g-option-row--correct";
            else if (isSelected) rowStateClass = "vf-g-option-row--wrong";
            else rowStateClass = "vf-g-option-row--dim";
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={answered}
              onClick={() => handleSelectOption(opt.id)}
              className={`vf-g-option-row ${rowStateClass}`}
              data-testid={`listening-option-${opt.id}`}
            >
              <span className="vf-g-option-key">
                {OPTION_LETTERS[idx] || idx + 1}
              </span>
              <span style={{ flex: 1 }}>{opt.textVi}</span>
              {answered && isCorrectOpt && (
                <CheckCircle2 size={17} color="var(--g-good)" />
              )}
              {answered && isSelected && !isCorrectOpt && (
                <XCircle size={17} color="var(--g-bad)" />
              )}
            </button>
          );
        })}
      </div>

      {/* Answer Feedback & Key Vocab */}
      {answered && (
        <div
          className={`vf-g-feedback-box ${
            isCurrentCorrect ? "vf-g-feedback-box--ok" : "vf-g-feedback-box--err"
          }`}
          data-testid="listening-feedback"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "8px",
            }}
          >
            <strong
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                fontSize: "0.94rem",
                fontWeight: 500,
                color: isCurrentCorrect ? "#9ad4b8" : "#eea7a7",
              }}
            >
              {isCurrentCorrect ? (
                <>
                  <CheckCircle2 size={16} /> Chính xác
                </>
              ) : (
                <>
                  <XCircle size={16} /> Chưa chính xác
                </>
              )}
            </strong>

            <button
              type="button"
              className="vf-g-btn vf-g-btn--primary vf-g-btn--sm"
              onClick={handleNext}
              data-testid="listening-next-btn"
            >
              {currentIndex + 1 >= exercises.length
                ? "Xem kết quả"
                : "Câu tiếp theo"}{" "}
              <ArrowRight size={14} />
            </button>
          </div>

          {selectedOptionObj?.explanationVi && (
            <p
              style={{
                margin: "0 0 6px",
                fontSize: "0.89rem",
                color: "var(--g-text-secondary)",
                lineHeight: 1.55,
              }}
            >
              {selectedOptionObj.explanationVi}
            </p>
          )}

          {!isCurrentCorrect && correctOptionObj?.explanationVi && (
            <p
              style={{
                margin: "0 0 6px",
                fontSize: "0.88rem",
                color: "#a4dbc0",
                lineHeight: 1.55,
              }}
            >
              <strong style={{ fontWeight: 500 }}>Đáp án đúng:</strong>{" "}
              <span className="vf-g-serif" style={{ fontSize: "0.95rem" }}>
                {correctOptionObj.textVi}
              </span>{" "}
              — {correctOptionObj.explanationVi}
            </p>
          )}

          {Array.isArray(currentExercise.keyVocab) &&
            currentExercise.keyVocab.length > 0 && (
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "10px",
                  borderTop: "1px solid var(--g-border)",
                }}
              >
                <div className="vf-g-section-kicker" style={{ marginBottom: "6px" }}>
                  Từ khóa trong đoạn nghe (nhấn để nghe)
                </div>
                <div className="vf-g-vocab-chips" style={{ marginTop: 0 }}>
                  {currentExercise.keyVocab.map((kv, i) => (
                    <button
                      key={`${kv.word}-${i}`}
                      type="button"
                      className="vf-g-vocab-chip"
                      onClick={() => handleSpeakVocab(kv.word)}
                    >
                      <Volume2 size={13} />
                      <span
                        className="vf-g-serif"
                        style={{ fontWeight: 500, fontSize: "0.94rem" }}
                      >
                        {kv.word}
                      </span>
                      <span style={{ color: "var(--g-text-muted)" }}>
                        — {kv.meaning}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default ListeningGame;
