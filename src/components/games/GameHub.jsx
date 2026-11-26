import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BookOpen,
  Headphones,
  Layers,
  MessageSquare,
  Volume2,
} from "lucide-react";
import { TOPICS, getTopicById } from "../../data";
import { GAME_TYPES, SKILL_META, TOPIC_META } from "../../lib/contracts";
import { speakVietnamese, stopSpeaking } from "../../lib/speech";
import { ListeningGame } from "./ListeningGame";
import { PronunciationLab } from "./PronunciationLab";
import { DialogueRoleplay } from "./DialogueRoleplay";
import { ReadingVocabGame } from "./ReadingVocabGame";
import "./games.css";

function normalizeInitialGame(raw) {
  if (!raw || raw === "hub") return { view: "hub", subMode: null };
  const val = String(raw).toLowerCase();
  if (val === "listening" || val === GAME_TYPES.LISTEN_MATCH) {
    return { view: "listening", subMode: null };
  }
  if (val === GAME_TYPES.SHADOW_SPEAK || val === "shadowing") {
    return { view: "pronunciation", subMode: "shadowing" };
  }
  if (
    val === "pronunciation" ||
    val === GAME_TYPES.PRONUNCIATION_LAB ||
    val === GAME_TYPES.TONE_RADAR
  ) {
    return { view: "pronunciation", subMode: "minimal-pairs" };
  }
  if (
    val === "dialogue" ||
    val === "speaking" ||
    val === "roleplay" ||
    val === GAME_TYPES.DIALOGUE_BUILDER
  ) {
    return { view: "dialogue", subMode: null };
  }
  if (val === "sentence" || val === "sentence_builder" || val === "builder") {
    return { view: "reading", subMode: "builder" };
  }
  if (
    val === "reading" ||
    val === "vocab" ||
    val === GAME_TYPES.READING_COMPREHENSION
  ) {
    return { view: "reading", subMode: "reading" };
  }
  return { view: "hub", subMode: null };
}

const TOPIC_SHORT_LABELS = {
  self: "Bản thân",
  food: "Ẩm thực",
  routine: "Sinh hoạt",
  weather: "Thời tiết",
  emotions: "Cảm xúc",
  opinions: "Quan điểm",
};

const GAME_MODES = [
  {
    id: "listening",
    index: "01",
    titleVi: "Nghe hiểu hội thoại",
    subtitleVi:
      "Nghe đoạn nói ở nhiều tốc độ, luyện bắt ý chính và làm quen với cách diễn đạt đời thường.",
    skills: ["listening", "reading"],
    primarySkill: "listening",
    durationLabel: "3–5 phút",
    Icon: Headphones,
  },
  {
    id: "pronunciation",
    index: "02",
    titleVi: "Phát âm & 6 thanh điệu",
    subtitleVi:
      "So sánh 6 đường nét thanh điệu, tập cặp từ dễ nhầm và đọc câu chấm từng âm tiết qua micro.",
    skills: ["pronunciation", "speaking", "listening"],
    primarySkill: "pronunciation",
    durationLabel: "4–6 phút",
    Icon: AudioLines,
  },
  {
    id: "dialogue",
    index: "03",
    titleVi: "Nhập vai đối thoại",
    subtitleVi:
      "Trò chuyện 4 lượt theo tình huống thật — nói trực tiếp bằng micro hoặc chọn mẫu để tập đọc.",
    skills: ["speaking", "listening", "pronunciation"],
    primarySkill: "speaking",
    durationLabel: "5–7 phút",
    Icon: MessageSquare,
  },
  {
    id: "reading",
    index: "04",
    titleVi: "Đọc hiểu & Ghép câu",
    subtitleVi:
      "Đọc bài ngắn có tra từ vựng ngay trong đoạn văn, kết hợp ghép câu theo cấu trúc A2–B1.",
    skills: ["reading", "listening"],
    primarySkill: "reading",
    durationLabel: "4–6 phút",
    Icon: BookOpen,
  },
];

export function GameHub({
  activeTopicId = "all",
  onSelectTopic,
  initialGame = "hub",
  onCompleteSession,
  skillProgress,
  onNavigateFlashcards,
}) {
  const parsedInitial = normalizeInitialGame(initialGame);
  const [activeView, setActiveView] = useState(parsedInitial.view);
  const [subModeHint, setSubModeHint] = useState(parsedInitial.subMode);
  const [selectedTopic, setSelectedTopic] = useState(activeTopicId || "all");

  useEffect(() => {
    setSelectedTopic(activeTopicId || "all");
  }, [activeTopicId]);

  useEffect(() => {
    const next = normalizeInitialGame(initialGame);
    setActiveView(next.view);
    setSubModeHint(next.subMode);
  }, [initialGame]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const topicsList = useMemo(() => {
    if (Array.isArray(TOPICS) && TOPICS.length > 0) return TOPICS;
    return Object.values(TOPIC_META);
  }, []);

  const currentTopicObj = useMemo(() => {
    if (!selectedTopic || selectedTopic === "all") return null;
    return (
      getTopicById?.(selectedTopic) ||
      topicsList.find((t) => t.id === selectedTopic) ||
      TOPIC_META[selectedTopic] ||
      null
    );
  }, [selectedTopic, topicsList]);

  const handleTopicClick = (topicId) => {
    setSelectedTopic(topicId);
    if (typeof onSelectTopic === "function") {
      onSelectTopic(topicId);
    }
  };

  const handleLaunchGame = (gameId, subMode = null) => {
    stopSpeaking();
    setSubModeHint(subMode);
    setActiveView(gameId);
  };

  const handleBackToHub = () => {
    stopSpeaking();
    setActiveView("hub");
    setSubModeHint(null);
  };

  const activeModeMeta = GAME_MODES.find((m) => m.id === activeView);

  if (activeView !== "hub") {
    return (
      <section className="vf-g-root" data-testid="game-active-container">
        <div className="vf-g-topbar">
          <div className="vf-g-topbar-left">
            <button
              type="button"
              className="vf-g-btn vf-g-btn--ghost vf-g-btn--sm"
              onClick={handleBackToHub}
              data-testid="game-back-to-hub"
            >
              <ArrowLeft size={15} /> Quay lại
            </button>
            <span className="vf-g-topbar-divider" aria-hidden="true" />
            <h2 className="vf-g-topbar-title">
              {activeModeMeta?.titleVi || "Luyện tập"}
            </h2>
          </div>

          <div className="vf-g-topbar-right">
            <span className="vf-g-topbar-topic">
              Chủ đề:{" "}
              <strong>
                {currentTopicObj ? currentTopicObj.titleVi : "Tất cả 6 chủ đề"}
              </strong>
            </span>
          </div>
        </div>

        {activeView === "listening" && (
          <ListeningGame
            activeTopicId={selectedTopic}
            onCompleteSession={onCompleteSession}
            onBack={handleBackToHub}
          />
        )}
        {activeView === "pronunciation" && (
          <PronunciationLab
            activeTopicId={selectedTopic}
            initialSubMode={subModeHint || "minimal-pairs"}
            onCompleteSession={onCompleteSession}
            onBack={handleBackToHub}
          />
        )}
        {activeView === "dialogue" && (
          <DialogueRoleplay
            activeTopicId={selectedTopic}
            onCompleteSession={onCompleteSession}
            onBack={handleBackToHub}
          />
        )}
        {activeView === "reading" && (
          <ReadingVocabGame
            activeTopicId={selectedTopic}
            initialSubMode={subModeHint || "reading"}
            onCompleteSession={onCompleteSession}
            onBack={handleBackToHub}
          />
        )}
      </section>
    );
  }

  return (
    <section className="vf-g-root" data-testid="game-hub">
      <div className="vf-g-hub-header">
        <div>
          <h1 className="vf-g-hub-title">Luyện tập 4 kỹ năng</h1>
          <p className="vf-g-hub-subtitle">
            Chọn một chủ đề gần gũi hoặc luyện tổng hợp nghe, nói, đọc và thanh điệu.
          </p>
        </div>

        {typeof onNavigateFlashcards === "function" && (
          <button
            type="button"
            className="vf-g-btn vf-g-btn--sm"
            onClick={() => onNavigateFlashcards(selectedTopic)}
          >
            <Layers size={15} /> Mở Flashcard
          </button>
        )}
      </div>

      {/* Horizontal Underline Topic Filter */}
      <div className="vf-g-topic-bar" role="tablist" aria-label="Lọc theo chủ đề">
        <button
          type="button"
          role="tab"
          aria-selected={selectedTopic === "all"}
          className={`vf-g-topic-tab ${
            selectedTopic === "all" ? "vf-g-topic-tab--active" : ""
          }`}
          onClick={() => handleTopicClick("all")}
          data-testid="topic-pill-all"
        >
          Tất cả
        </button>

        {topicsList.map((topic) => {
          const isActive = selectedTopic === topic.id;
          const shortLabel = TOPIC_SHORT_LABELS[topic.id] || topic.titleVi;
          return (
            <button
              key={topic.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              title={topic.titleVi}
              className={`vf-g-topic-tab ${
                isActive ? "vf-g-topic-tab--active" : ""
              }`}
              onClick={() => handleTopicClick(topic.id)}
              data-testid={`topic-pill-${topic.id}`}
            >
              {shortLabel}
            </button>
          );
        })}
      </div>

      {/* Topic Textbook Note when a specific topic is selected */}
      {currentTopicObj && (
        <div className="vf-g-topic-spotlight" data-testid="topic-spotlight">
          <div>
            <div className="vf-g-topic-spotlight__head">
              <h2 className="vf-g-topic-spotlight__title">
                {currentTopicObj.titleVi}
              </h2>
              {currentTopicObj.cefrFocus && (
                <span className="vf-g-topic-spotlight__cefr">
                  {currentTopicObj.cefrFocus}
                </span>
              )}
            </div>
            {(currentTopicObj.descriptionVi || currentTopicObj.subtitleVi) && (
              <p className="vf-g-topic-spotlight__desc">
                {currentTopicObj.descriptionVi || currentTopicObj.subtitleVi}
              </p>
            )}

            {Array.isArray(currentTopicObj.keyPhrases) &&
              currentTopicObj.keyPhrases.length > 0 && (
                <div>
                  <div className="vf-g-section-kicker">
                    Cụm câu trọng tâm (nhấn để nghe)
                  </div>
                  <div className="vf-g-phrase-list">
                    {currentTopicObj.keyPhrases.slice(0, 4).map((phrase, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="vf-g-phrase-row"
                        onClick={() => speakVietnamese(phrase.vi, { rate: 0.95 })}
                      >
                        <Volume2 size={14} />
                        <span>
                          <strong style={{ fontWeight: 500 }}>{phrase.vi}</strong>
                          {phrase.en ? (
                            <span style={{ color: "var(--g-text-muted)" }}>
                              {" "}
                              — {phrase.en}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {currentTopicObj.grammarSpotlight && (
            <div className="vf-g-grammar-box">
              <div>
                <div className="vf-g-grammar-label">Điểm ngữ pháp nổi bật</div>
                <div className="vf-g-grammar-pattern">
                  {currentTopicObj.grammarSpotlight.pattern}
                </div>
                <p className="vf-g-grammar-explain">
                  {currentTopicObj.grammarSpotlight.explanationVi}
                </p>
              </div>
              {currentTopicObj.grammarSpotlight.exampleVi && (
                <div className="vf-g-grammar-example">
                  <div>
                    <div>“{currentTopicObj.grammarSpotlight.exampleVi}”</div>
                    {currentTopicObj.grammarSpotlight.exampleEn && (
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--g-text-muted)",
                          marginTop: "2px",
                        }}
                      >
                        {currentTopicObj.grammarSpotlight.exampleEn}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="vf-g-btn vf-g-btn--ghost vf-g-btn--sm"
                    onClick={() =>
                      speakVietnamese(currentTopicObj.grammarSpotlight.exampleVi, {
                        rate: 0.95,
                      })
                    }
                    aria-label="Nghe ví dụ ngữ pháp"
                  >
                    <Volume2 size={15} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4 Studio Modules */}
      <div className="vf-g-mode-grid">
        {GAME_MODES.map((mode) => {
          const ModeIcon = mode.Icon;
          const skillScore = Math.max(
            0,
            Math.min(100, Math.round(Number(skillProgress?.[mode.primarySkill] ?? 0)))
          );
          const skillsLine = mode.skills
            .map((id) => SKILL_META[id]?.labelVi)
            .filter(Boolean)
            .join(" · ");

          return (
            <article
              key={mode.id}
              className="vf-g-mode-card"
              data-testid={`game-mode-card-${mode.id}`}
            >
              <div>
                <div className="vf-g-mode-top">
                  <div className="vf-g-mode-index-group">
                    <span className="vf-g-mode-index">{mode.index}</span>
                    <span className="vf-g-mode-icon" aria-hidden="true">
                      <ModeIcon size={18} strokeWidth={1.75} />
                    </span>
                  </div>
                  <span className="vf-g-mono" style={{ fontSize: "0.76rem", color: "var(--g-text-muted)" }}>
                    {mode.durationLabel}
                  </span>
                </div>

                <h2 className="vf-g-mode-title">{mode.titleVi}</h2>
                <p className="vf-g-mode-desc">{mode.subtitleVi}</p>

                <div className="vf-g-mode-meta-line">
                  {skillsLine} &nbsp;•&nbsp; {mode.durationLabel}
                </div>

                <div className="vf-g-mode-progress-wrap">
                  <div className="vf-g-mode-progress-head">
                    <span>
                      {SKILL_META[mode.primarySkill]?.labelVi || "Tiến độ"}
                    </span>
                    <strong className="vf-g-mono">
                      {skillProgress ? `${skillScore}%` : "0%"}
                    </strong>
                  </div>
                  <div className="vf-g-mini-track">
                    <div
                      className={`vf-g-mini-fill ${
                        skillScore >= 80 ? "vf-g-mini-fill--good" : ""
                      }`}
                      style={{ width: `${skillProgress ? skillScore : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="vf-g-mode-footer">
                <span className="vf-g-mode-stat">
                  {currentTopicObj
                    ? TOPIC_SHORT_LABELS[currentTopicObj.id] || currentTopicObj.titleVi
                    : "Cả 6 chủ đề"}
                </span>

                <button
                  type="button"
                  className="vf-g-btn vf-g-btn--card-cta vf-g-btn--sm"
                  onClick={() => handleLaunchGame(mode.id)}
                  data-testid={`launch-game-${mode.id}`}
                >
                  Luyện ngay <ArrowRight size={14} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default GameHub;
