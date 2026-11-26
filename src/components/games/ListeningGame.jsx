import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Flame,
  Headphones,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Trophy,
  Volume2,
  XCircle,
} from "lucide-react";
import { LISTENING_EXERCISES, getTopicById } from "../../data";
import { GAME_TYPES, TOPIC_META } from "../../lib/contracts";
import { stopSpeaking } from "../../lib/speech";
import { useVietnameseSpeech } from "../../hooks/useVietnameseSpeech";

const SPEED_OPTIONS = [
  { value: 0.75, label: "0.75x Chậm" },
  { value: 1, label: "1.0x Chuẩn" },
  { value: 1.15, label: "1.15x Tự nhiên" },
];

const TYPE_LABELS = {
  comprehension: "Nghe hiểu",
  "best-response": "Phản hồi tự nhiên",
  "fill-blank": "Nghe điền thông tin",
};

const WAVE_HEIGHTS = [16, 26, 36, 20, 42, 30, 18, 38, 28, 40, 22, 34, 24, 14];
const OPTION_LETTERS = ["A", "B", "C", "D"];

function shuffleList(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildRound(allExercises, activeTopicId) {
  const safeList = Array.isArray(allExercises) ? allExercises : [];
  if (activeTopicId && activeTopicId !== "all") {
    const filtered = safeList.filter((item) => item.topicId === activeTopicId);
    if (filtered.length > 0) return filtered;
  }
  // Balanced mix across topics when 'all' is active (up to 6 questions per sprint)
  const byTopic = new Map();
  for (const ex of shuffleList(safeList)) {
    if (!byTopic.has(ex.topicId)) {
      byTopic.set(ex.topicId, ex);
    }
  }
  const picked = Array.from(byTopic.values());
  if (picked.length >= 6) return picked.slice(0, 6);
  const pickedIds = new Set(picked.map((x) => x.id));
  for (const ex of safeList) {
    if (!pickedIds.has(ex.id) && picked.length < 6) {
      picked.push(ex);
      pickedIds.add(ex.id);
    }
  }
  return picked;
}

export function ListeningGame({
  activeTopicId = "all",
  onCompleteSession,
  onBack,
}) {
  const { isSpeaking, rate, setRate, speak, stopSpeak } = useVietnameseSpeech({
    defaultRate: 1,
  });

  const [roundSeed, setRoundSeed] = useState(0);
  const exercises = useMemo(
    () => buildRound(LISTENING_EXERCISES, activeTopicId),
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

  const currentExercise = exercises[currentIndex] || null;
  const topicMeta = currentExercise
    ? getTopicById?.(currentExercise.topicId) || TOPIC_META[currentExercise.topicId]
    : null;

  // Reset state whenever topic or roundSeed changes
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
    setCompleted(false);
    startTimeRef.current = Date.now();
    reportedRef.current = false;
  }, [activeTopicId, roundSeed, stopSpeak]);

  useEffect(() => {
    return () => {
      stopSpeak();
      stopSpeaking();
    };
  }, [stopSpeak]);

  const handlePlayAudio = () => {
    if (!currentExercise) return;
    if (isSpeaking) {
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
    setAnswers((prev) => [
      ...prev,
      {
        exerciseId: currentExercise.id,
        titleVi: currentExercise.titleVi,
        audioTextVi: currentExercise.audioTextVi,
        selectedOptionId: optionId,
        correctOptionId: currentExercise.correctOptionId,
        isCorrect,
      },
    ]);
  };

  const finishRound = () => {
    stopSpeak();
    setCompleted(true);
    if (!reportedRef.current && typeof onCompleteSession === "function") {
      reportedRef.current = true;
      const correctCount = answers.filter((a) => a.isCorrect).length;
      const maxScore = Math.max(1, exercises.length);
      const accuracy = Math.round((correctCount / maxScore) * 100);
      const durationSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
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
    setRoundSeed((prev) => prev + 1);
  };

  if (exercises.length === 0) {
    return (
      <div className="vf-g-panel" style={{ textAlign: "center" }}>
        <p>Chưa có bài nghe cho chủ đề này.</p>
        {onBack && (
          <button type="button" className="vf-g-btn" onClick={onBack}>
            <ArrowLeft size={16} /> Quay lại Trung tâm
          </button>
        )}
      </div>
    );
  }

  const answered = selectedOptionId !== null;
  const isCurrentCorrect = answered && selectedOptionId === currentExercise?.correctOptionId;
  const selectedOptionObj = currentExercise?.options?.find(
    (opt) => opt.id === selectedOptionId
  );
  const correctOptionObj = currentExercise?.options?.find(
    (opt) => opt.id === currentExercise.correctOptionId
  );

  if (completed) {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const accuracy = Math.round((correctCount / Math.max(1, exercises.length)) * 100);

    return (
      <div className="vf-g-summary" data-testid="listening-summary">
        <div className="vf-g-summary-icon">
          <Trophy size={30} />
        </div>
        <h2 style={{ margin: "0 0 6px", fontSize: "1.45rem" }}>
          Hoàn thành Đấu Trường Nghe!
        </h2>
        <p style={{ margin: 0, color: "var(--g-text-muted)", fontSize: "0.94rem" }}>
          {accuracy >= 80
            ? "Phản xạ nghe hiểu tiếng Việt của bạn rất vững ở tốc độ thực tế."
            : "Rất tốt! Hãy nghe lại các câu còn nhầm ở tốc độ 0.75x để nắm rõ thanh điệu."}
        </p>

        <div className="vf-g-summary-grid">
          <div className="vf-g-metric-box">
            <div className="vf-g-metric-value vf-g-mono" style={{ color: "#34d399" }}>
              {accuracy}%
            </div>
            <div className="vf-g-metric-label">
              Độ chính xác ({correctCount}/{exercises.length})
            </div>
          </div>
          <div className="vf-g-metric-box">
            <div className="vf-g-metric-value vf-g-mono" style={{ color: "#fbbf24" }}>
              +{xpEarned} XP
            </div>
            <div className="vf-g-metric-label">Điểm kinh nghiệm</div>
          </div>
          <div className="vf-g-metric-box">
            <div className="vf-g-metric-value vf-g-mono" style={{ color: "#38bdf8" }}>
              {bestStreak}
            </div>
            <div className="vf-g-metric-label">Chuỗi đúng dài nhất</div>
          </div>
        </div>

        <div style={{ textAlign: "left", display: "grid", gap: "8px", marginTop: "16px" }}>
          {answers.map((item, idx) => (
            <div
              key={item.exerciseId}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "12px",
                background: "rgba(11, 16, 27, 0.55)",
                border: "1px solid var(--g-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {item.isCorrect ? (
                  <CheckCircle2 size={18} color="#34d399" />
                ) : (
                  <XCircle size={18} color="#fb7185" />
                )}
                <span style={{ fontSize: "0.88rem" }}>
                  <strong>Câu {idx + 1}:</strong> {item.titleVi}
                </span>
              </div>
              <button
                type="button"
                className="vf-g-btn vf-g-btn--sm"
                onClick={() => speak(item.audioTextVi, { rate: 0.9 })}
                aria-label={`Nghe lại câu ${idx + 1}`}
              >
                <Volume2 size={14} /> Nghe lại
              </button>
            </div>
          ))}
        </div>

        <div className="vf-g-summary-actions">
          <button type="button" className="vf-g-btn vf-g-btn--primary" onClick={handleRestart}>
            <RotateCcw size={16} /> Luyện vòng mới
          </button>
          {onBack && (
            <button type="button" className="vf-g-btn" onClick={onBack}>
              <ArrowLeft size={16} /> Về Trung tâm trò chơi
            </button>
          )}
        </div>
      </div>
    );
  }

  const progressPct = ((currentIndex + (answered ? 1 : 0)) / exercises.length) * 100;

  return (
    <div className="vf-g-panel" data-testid="listening-game">
      <div className="vf-g-topbar" style={{ marginBottom: "16px" }}>
        <div className="vf-g-topbar-left">
          <span className="vf-g-badge vf-g-badge--sky">
            <Headphones size={14} /> Câu {currentIndex + 1} / {exercises.length}
          </span>
          {topicMeta && (
            <span className="vf-g-badge">{topicMeta.titleVi}</span>
          )}
          <span className="vf-g-badge vf-g-badge--indigo">
            {TYPE_LABELS[currentExercise.type] || "Nghe hiểu"}
          </span>
        </div>
        <div className="vf-g-topbar-right">
          <span className="vf-g-badge vf-g-badge--amber vf-g-mono">
            <Flame size={14} /> Chuỗi {streak}
          </span>
          <span className="vf-g-badge vf-g-badge--emerald vf-g-mono">
            <Sparkles size={14} /> {xpEarned} XP
          </span>
        </div>
      </div>

      <div className="vf-g-progress-track">
        <div className="vf-g-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Audio Stage */}
      <div className="vf-g-audio-stage">
        <div className="vf-g-audio-header">
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--g-text-muted)", marginBottom: "2px" }}>
              {currentExercise.speakerLabel || "Người bản xứ"}
            </div>
            <h3 style={{ margin: 0, fontSize: "1.08rem" }}>{currentExercise.titleVi}</h3>
          </div>
          <span className="vf-g-badge vf-g-mono" data-testid="listening-replay-count">
            Đã nghe: {replayCount} lần
          </span>
        </div>

        <div
          className={`vf-g-soundwave ${isSpeaking ? "vf-g-soundwave--playing" : ""}`}
          aria-hidden="true"
        >
          {WAVE_HEIGHTS.map((h, i) => (
            <span
              key={i}
              className="vf-g-wave-bar"
              style={{
                height: isSpeaking ? undefined : `${Math.round(h * 0.45)}px`,
                animationDelay: `${(i % 7) * 0.1}s`,
              }}
            />
          ))}
        </div>

        <div className="vf-g-audio-controls">
          <button
            type="button"
            className="vf-g-btn vf-g-btn--primary vf-g-btn--lg"
            onClick={handlePlayAudio}
            data-testid="listening-play-btn"
          >
            {isSpeaking ? (
              <>
                <Square size={16} /> Dừng phát
              </>
            ) : (
              <>
                <Play size={16} /> {replayCount > 0 ? "Nghe lại đoạn nói" : "Nghe đoạn nói"}
              </>
            )}
          </button>

          <div className="vf-g-speed-group" role="group" aria-label="Tốc độ phát âm">
            {SPEED_OPTIONS.map((sp) => (
              <button
                key={sp.value}
                type="button"
                className={`vf-g-speed-btn ${rate === sp.value ? "vf-g-speed-btn--active" : ""}`}
                onClick={() => setRate(sp.value)}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>

        <div className="vf-g-audio-extras">
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {currentExercise.hintVi && (
              <button
                type="button"
                className={`vf-g-btn vf-g-btn--sm ${showHint ? "vf-g-btn--amber" : ""}`}
                onClick={() => setShowHint((prev) => !prev)}
              >
                <Lightbulb size={14} /> {showHint ? "Ẩn gợi ý" : "Gợi ý"}
              </button>
            )}
            <button
              type="button"
              className="vf-g-btn vf-g-btn--sm"
              onClick={() => setShowTranscript((prev) => !prev)}
              data-testid="listening-transcript-toggle"
            >
              <FileText size={14} /> {showTranscript ? "Ẩn bản chữ" : "Hiện bản chữ"}
            </button>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--g-text-muted)" }}>
            Mẹo: Nghe 1–2 lần trước khi mở bản chữ để tăng phản xạ.
          </span>
        </div>

        {showHint && currentExercise.hintVi && (
          <div className="vf-g-drawer vf-g-drawer--hint">
            <strong>Gợi ý:</strong> {currentExercise.hintVi}
          </div>
        )}

        {showTranscript && (
          <div className="vf-g-drawer" data-testid="listening-transcript">
            <div style={{ fontWeight: 600, color: "#f8fafc", marginBottom: "4px" }}>
              “{currentExercise.transcriptVi || currentExercise.audioTextVi}”
            </div>
            {currentExercise.translationEn && (
              <div style={{ fontSize: "0.85rem", color: "var(--g-text-muted)" }}>
                {currentExercise.translationEn}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Question & Options */}
      <h4 className="vf-g-question-text">{currentExercise.questionVi}</h4>

      <div className="vf-g-options-grid">
        {(currentExercise.options || []).map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id;
          const isCorrectOpt = opt.id === currentExercise.correctOptionId;

          let cardStateClass = "";
          if (answered) {
            if (isCorrectOpt) cardStateClass = "vf-g-option-card--correct";
            else if (isSelected) cardStateClass = "vf-g-option-card--wrong";
            else cardStateClass = "vf-g-option-card--dim";
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={answered}
              onClick={() => handleSelectOption(opt.id)}
              className={`vf-g-option-card ${cardStateClass}`}
              data-testid={`listening-option-${opt.id}`}
            >
              <span className="vf-g-option-key">{OPTION_LETTERS[idx] || idx + 1}</span>
              <span style={{ flex: 1 }}>{opt.textVi}</span>
              {answered && isCorrectOpt && <CheckCircle2 size={18} color="#34d399" />}
              {answered && isSelected && !isCorrectOpt && <XCircle size={18} color="#fb7185" />}
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
                gap: "8px",
                color: isCurrentCorrect ? "#6ee7b7" : "#fda4af",
              }}
            >
              {isCurrentCorrect ? (
                <>
                  <CheckCircle2 size={18} /> Chính xác!
                </>
              ) : (
                <>
                  <XCircle size={18} /> Chưa chính xác
                </>
              )}
            </strong>
            <button
              type="button"
              className="vf-g-btn vf-g-btn--primary vf-g-btn--sm"
              onClick={handleNext}
              data-testid="listening-next-btn"
            >
              {currentIndex + 1 >= exercises.length ? "Xem kết quả" : "Câu tiếp theo"}{" "}
              <ArrowRight size={15} />
            </button>
          </div>

          {selectedOptionObj?.explanationVi && (
            <p style={{ margin: "0 0 6px", fontSize: "0.9rem", color: "#e2e8f0" }}>
              {selectedOptionObj.explanationVi}
            </p>
          )}
          {!isCurrentCorrect && correctOptionObj?.explanationVi && (
            <p style={{ margin: "0 0 6px", fontSize: "0.88rem", color: "#a7f3d0" }}>
              <strong>Đáp án đúng:</strong> {correctOptionObj.textVi} —{" "}
              {correctOptionObj.explanationVi}
            </p>
          )}

          {Array.isArray(currentExercise.keyVocab) && currentExercise.keyVocab.length > 0 && (
            <div style={{ marginTop: "12px" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--g-text-muted)", marginBottom: "6px" }}>
                Từ khóa quan trọng (nhấn để nghe phát âm):
              </div>
              <div className="vf-g-vocab-chips">
                {currentExercise.keyVocab.map((kv, i) => (
                  <button
                    key={`${kv.word}-${i}`}
                    type="button"
                    className="vf-g-vocab-chip"
                    onClick={() => handleSpeakVocab(kv.word)}
                  >
                    <Volume2 size={13} />
                    <strong>{kv.word}</strong>
                    <span style={{ color: "var(--g-text-muted)" }}>— {kv.meaning}</span>
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
