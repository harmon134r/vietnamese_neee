import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BookOpen,
  Clock,
  Headphones,
  Layers,
  MessageSquare,
  Sparkles,
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

const GAME_MODES = [
  {
    id: "listening",
    titleVi: "Đấu Trường Nghe & Hiểu",
    subtitleVi: "Nghe hội thoại tự nhiên ở nhiều tốc độ, luyện phản xạ chọn đáp án & mở khóa từ khóa.",
    skills: ["listening", "reading"],
    primarySkill: "listening",
    durationLabel: "3–5 phút",
    accent: "#38bdf8",
    Icon: Headphones,
  },
  {
    id: "pronunciation",
    titleVi: "Phòng Lab Phát Âm & Thanh Điệu",
    subtitleVi: "Đối chiếu 6 thanh điệu, luyện cặp từ tối thiểu & đọc câu chấm điểm từng âm tiết qua micro.",
    skills: ["pronunciation", "speaking", "listening"],
    primarySkill: "pronunciation",
    durationLabel: "4–6 phút",
    accent: "#f472b6",
    Icon: AudioLines,
  },
  {
    id: "dialogue",
    titleVi: "Nhập Vai Đối Thoại Thực Tế",
    subtitleVi: "Hội thoại 4 lượt theo tình huống đời sống — nói trực tiếp bằng micro hoặc luyện đọc từng nhánh.",
    skills: ["speaking", "listening", "pronunciation"],
    primarySkill: "speaking",
    durationLabel: "5–7 phút",
    accent: "#34d399",
    Icon: MessageSquare,
  },
  {
    id: "reading",
    titleVi: "Đọc Hiểu & Ghép Câu Giao Tiếp",
    subtitleVi: "Đọc bài thực tế có tra từ vựng tương tác tại chỗ & ghép câu phản xạ theo cấu trúc A2–B1.",
    skills: ["reading", "listening"],
    primarySkill: "reading",
    durationLabel: "4–6 phút",
    accent: "#fbbf24",
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
              className="vf-g-btn vf-g-btn--sm"
              onClick={handleBackToHub}
              data-testid="game-back-to-hub"
            >
              <ArrowLeft size={15} /> Trung tâm trò chơi
            </button>
            <h2 className="vf-g-topbar-title">
              {activeModeMeta?.titleVi || "Luyện tập"}
            </h2>
          </div>

          <div className="vf-g-topbar-right">
            <span className="vf-g-badge vf-g-badge--sky">
              Chủ đề: {currentTopicObj ? currentTopicObj.titleVi : "Tất cả 6 chủ đề"}
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
          <div className="vf-g-hub-eyebrow">
            <Sparkles size={14} /> Trung tâm Luyện 4 Kỹ Năng · A2–B1
          </div>
          <h1 className="vf-g-hub-title">Trò Chơi Tương Tác Tiếng Việt</h1>
          <p className="vf-g-hub-subtitle">
            Chọn một chủ đề giao tiếp hoặc luyện tổng hợp cả 6 chủ đề qua 4 chế độ chuyên sâu:
            Nghe, Phát âm thanh điệu, Nhập vai nói và Đọc hiểu ghép câu.
          </p>
        </div>

        {typeof onNavigateFlashcards === "function" && (
          <button
            type="button"
            className="vf-g-btn"
            onClick={() => onNavigateFlashcards(selectedTopic)}
          >
            <Layers size={16} /> Mở Flashcard Studio
          </button>
        )}
      </div>

      {/* Topic Filter Pills */}
      <div className="vf-g-topic-bar" role="tablist" aria-label="Lọc theo chủ đề">
        <button
          type="button"
          role="tab"
          aria-selected={selectedTopic === "all"}
          className={`vf-g-topic-pill ${
            selectedTopic === "all" ? "vf-g-topic-pill--active" : ""
          }`}
          onClick={() => handleTopicClick("all")}
          data-testid="topic-pill-all"
        >
          Tất cả 6 chủ đề
        </button>

        {topicsList.map((topic) => {
          const accent =
            topic.accentColor || topic.accent || TOPIC_META[topic.id]?.accent || "#38bdf8";
          const isActive = selectedTopic === topic.id;
          return (
            <button
              key={topic.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`vf-g-topic-pill ${isActive ? "vf-g-topic-pill--active" : ""}`}
              style={{ "--topic-accent": accent }}
              onClick={() => handleTopicClick(topic.id)}
              data-testid={`topic-pill-${topic.id}`}
            >
              <span className="vf-g-topic-dot" style={{ background: accent }} />
              {topic.titleVi}
            </button>
          );
        })}
      </div>

      {/* Topic Overview Mini-Card when a specific topic is selected */}
      {currentTopicObj && (
        <div
          className="vf-g-topic-spotlight"
          style={{
            "--topic-accent":
              currentTopicObj.accentColor ||
              currentTopicObj.accent ||
              TOPIC_META[currentTopicObj.id]?.accent ||
              "#38bdf8",
          }}
          data-testid="topic-spotlight"
        >
          <div>
            <div className="vf-g-topic-spotlight__head">
              <h2 className="vf-g-topic-spotlight__title">
                {currentTopicObj.titleVi}
              </h2>
              {currentTopicObj.cefrFocus && (
                <span className="vf-g-badge vf-g-badge--sky">
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
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--g-text-muted)",
                      marginBottom: "8px",
                      fontWeight: 600,
                    }}
                  >
                    Cụm câu giao tiếp trọng tâm (nhấn để nghe):
                  </div>
                  <div className="vf-g-phrase-list">
                    {currentTopicObj.keyPhrases.slice(0, 4).map((phrase, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="vf-g-phrase-chip"
                        onClick={() => speakVietnamese(phrase.vi, { rate: 0.95 })}
                      >
                        <Volume2 size={13} color="#38bdf8" />
                        <span>
                          <strong>{phrase.vi}</strong>
                          {phrase.en ? (
                            <span style={{ color: "var(--g-text-muted)" }}>
                              {" "}
                              · {phrase.en}
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
                <div className="vf-g-grammar-pattern" style={{ marginTop: "4px" }}>
                  {currentTopicObj.grammarSpotlight.pattern}
                </div>
                <p className="vf-g-grammar-explain" style={{ marginTop: "6px" }}>
                  {currentTopicObj.grammarSpotlight.explanationVi}
                </p>
              </div>
              {currentTopicObj.grammarSpotlight.exampleVi && (
                <div className="vf-g-grammar-example">
                  <div>
                    <div>“{currentTopicObj.grammarSpotlight.exampleVi}”</div>
                    {currentTopicObj.grammarSpotlight.exampleEn && (
                      <div style={{ fontSize: "0.78rem", color: "var(--g-text-muted)" }}>
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
                    <Volume2 size={15} color="#38bdf8" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4 Game Mode Cards */}
      <div className="vf-g-mode-grid">
        {GAME_MODES.map((mode) => {
          const ModeIcon = mode.Icon;
          const skillScore = Math.round(
            Number(skillProgress?.[mode.primarySkill] ?? 0)
          );

          return (
            <article
              key={mode.id}
              className="vf-g-mode-card"
              style={{ "--mode-accent": mode.accent }}
              data-testid={`game-mode-card-${mode.id}`}
            >
              <div>
                <div className="vf-g-mode-top">
                  <div className="vf-g-mode-icon">
                    <ModeIcon size={23} />
                  </div>
                  <span className="vf-g-badge vf-g-mono">
                    <Clock size={13} /> {mode.durationLabel}
                  </span>
                </div>

                <h2 className="vf-g-mode-title">{mode.titleVi}</h2>
                <p className="vf-g-mode-desc">{mode.subtitleVi}</p>

                <div className="vf-g-mode-meta">
                  {mode.skills.map((skillId) => {
                    const meta = SKILL_META[skillId];
                    if (!meta) return null;
                    return (
                      <span
                        key={skillId}
                        className="vf-g-badge"
                        style={{
                          borderColor: `${meta.color}44`,
                          color: meta.color,
                          background: `${meta.color}14`,
                        }}
                      >
                        {meta.labelVi}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="vf-g-mode-footer">
                <div className="vf-g-mode-stat">
                  {skillProgress ? (
                    <>
                      Mức {SKILL_META[mode.primarySkill]?.labelVi}:{" "}
                      <strong className="vf-g-mono">{skillScore}%</strong>
                    </>
                  ) : (
                    <span>Sẵn sàng luyện tập</span>
                  )}
                </div>

                <button
                  type="button"
                  className="vf-g-btn vf-g-btn--primary vf-g-btn--sm"
                  onClick={() => handleLaunchGame(mode.id)}
                  data-testid={`launch-game-${mode.id}`}
                >
                  Bắt đầu <ArrowRight size={15} />
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
