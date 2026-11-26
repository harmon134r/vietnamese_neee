import React from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  CloudSun,
  Compass,
  Flame,
  Gamepad2,
  Headphones,
  Heart,
  Layers,
  MessageCircle,
  MessageSquare,
  Mic,
  PlusCircle,
  Sparkles,
  Trophy,
  User,
  Utensils,
  Zap,
} from "lucide-react";
import { GAME_TYPES, MASTERY_LEVELS, SKILL_META, TOPIC_META } from "../../lib/contracts";

const TOPIC_ICONS = {
  self: User,
  food: Utensils,
  routine: CalendarClock,
  weather: CloudSun,
  emotions: Heart,
  opinions: MessageSquare,
};

const SKILL_CARDS_CONFIG = [
  {
    id: "listening",
    gameId: "listening",
    icon: Headphones,
    accent: "#38bdf8",
    desc: "Nghe hội thoại đời sống tự nhiên, tùy chỉnh tốc độ đọc và bắt ý chính.",
    cta: "Luyện nghe ngay",
  },
  {
    id: "speaking",
    gameId: "dialogue",
    icon: MessageCircle,
    accent: "#34d399",
    desc: "Nhập vai đối thoại thực tế đa nhánh và phản xạ trả lời bằng giọng nói.",
    cta: "Nhập vai nói ngay",
  },
  {
    id: "reading",
    gameId: "reading",
    icon: BookOpen,
    accent: "#fbbf24",
    desc: "Đọc đoạn văn A2–B1 có từ điển chạm tức thì và ghép câu chuẩn ngữ pháp.",
    cta: "Đọc & ghép câu",
  },
  {
    id: "pronunciation",
    gameId: "pronunciation",
    icon: Mic,
    accent: "#fb7185",
    desc: "Phân biệt 6 thanh điệu qua cặp từ tối thiểu và chấm điểm phát âm từng âm tiết.",
    cta: "Mở phòng phát âm",
  },
];

const GAME_LABELS = {
  [GAME_TYPES.LISTEN_MATCH]: "Đấu Trường Nghe Hiểu",
  [GAME_TYPES.TONE_RADAR]: "Phòng Lab Thanh Điệu",
  [GAME_TYPES.PRONUNCIATION_LAB]: "Phòng Lab Phát Âm",
  [GAME_TYPES.DIALOGUE_BUILDER]: "Nhập Vai Đối Thoại",
  [GAME_TYPES.SHADOW_SPEAK]: "Luyện Nói Theo Câu",
  [GAME_TYPES.READING_COMPREHENSION]: "Đọc Hiểu & Ghép Câu",
  [GAME_TYPES.FLASHCARD_REVIEW]: "Ôn Tập Flashcard",
  listening: "Đấu Trường Nghe Hiểu",
  pronunciation: "Phòng Lab Phát Âm",
  dialogue: "Nhập Vai Đối Thoại",
  reading: "Đọc Hiểu & Ghép Câu",
};

function getSkillLevelLabel(score) {
  if (score >= 85) return "Thành thạo B1";
  if (score >= 60) return "Vững vàng A2+";
  if (score >= 30) return "Đang tiến bộ";
  if (score > 0) return "Khởi động tốt";
  return "Chưa luyện tập";
}

function formatRelativeTime(isoString) {
  if (!isoString) return "Vừa xong";
  const time = new Date(isoString).getTime();
  if (!Number.isFinite(time)) return "Vừa xong";
  const diffSec = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (diffSec < 60) return "Vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return new Date(isoString).toLocaleDateString("vi-VN");
}

function getAccuracyTone(accuracy) {
  if (accuracy >= 80) return "vf-pill--emerald";
  if (accuracy >= 60) return "vf-pill--amber";
  return "vf-pill--coral";
}

export function Dashboard({
  topics = [],
  decks = [],
  skillProgress,
  gameHistory = [],
  contentStats = {},
  user,
  userProfile,
  onLaunchGame,
  onOpenFlashcards,
  onCreateFlashcard,
  onOpenTopicOverview,
}) {
  const listening = Math.round(Number(skillProgress?.listening || 0));
  const speaking = Math.round(Number(skillProgress?.speaking || 0));
  const reading = Math.round(Number(skillProgress?.reading || 0));
  const pronunciation = Math.round(Number(skillProgress?.pronunciation || 0));
  const avgSkill = Math.round((listening + speaking + reading + pronunciation) / 4);
  const xp = Math.round(Number(skillProgress?.xp || 0));
  const streakDays = Math.round(Number(skillProgress?.streakDays || 0));

  const totalCards = decks.reduce((sum, deck) => sum + (deck.cards?.length || deck.cardCount || 0), 0);
  const masteredCards = decks.reduce(
    (sum, deck) =>
      sum +
      (deck.cards || []).filter((card) => Number(card.masteryLevel || 0) >= MASTERY_LEVELS.STRONG)
        .length,
    0
  );

  const cardsByTopic = decks.reduce((acc, deck) => {
    for (const card of deck.cards || []) {
      const tid = card.topicId || deck.topicId;
      if (tid) acc[tid] = (acc[tid] || 0) + 1;
    }
    return acc;
  }, {});

  const displayName =
    userProfile?.displayName ||
    user?.user_metadata?.display_name ||
    (user?.email ? user.email.split("@")[0] : "");

  const skillScores = { listening, speaking, reading, pronunciation };
  const recentHistory = gameHistory.slice(0, 6);

  return (
    <div className="vf-dashboard vf-view-enter">
      {/* Hero Banner */}
      <section className="vf-hero" aria-label="Tổng quan luyện tập">
        <div className="vf-hero-main">
          <span className="vf-hero-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            <span>Tiếng Việt Giao Tiếp Người Lớn · Trình độ Pre-Intermediate (A2–B1)</span>
          </span>

          <h1 className="vf-hero-title">
            {displayName ? (
              <>
                Chào {displayName},{" "}
                <span className="vf-hero-title-accent">sẵn sàng nâng phản xạ tiếng Việt?</span>
              </>
            ) : (
              <>
                Làm chủ{" "}
                <span className="vf-hero-title-accent">4 kỹ năng tiếng Việt</span> qua ngữ cảnh thực tế
              </>
            )}
          </h1>

          <p className="vf-hero-desc">
            Luyện Nghe, Nói, Đọc hiểu và 6 thanh điệu tiếng Việt trên 6 chủ đề đời sống hiện đại — kết hợp
            Flashcard Studio thông minh giúp bạn tạo bộ thẻ riêng kèm giọng đọc chuẩn và kiểm tra phát âm
            tức thì.
          </p>

          <div className="vf-hero-actions">
            <button
              type="button"
              className="vf-btn vf-btn--primary vf-btn--lg"
              onClick={() => onLaunchGame("hub", "all")}
            >
              <Gamepad2 size={18} aria-hidden="true" />
              <span>Vào Trò Chơi 4 Kỹ Năng</span>
            </button>

            <button
              type="button"
              className="vf-btn vf-btn--secondary vf-btn--lg"
              onClick={() => onOpenFlashcards("all")}
            >
              <Layers size={18} aria-hidden="true" />
              <span>Mở Flashcard Studio</span>
            </button>

            <button
              type="button"
              className="vf-btn vf-btn--outline vf-btn--lg"
              onClick={onCreateFlashcard}
            >
              <PlusCircle size={18} aria-hidden="true" />
              <span>Tạo Flashcard Mới</span>
            </button>
          </div>
        </div>

        <aside className="vf-hero-side" aria-label="Tóm tắt tiến độ">
          <div>
            <div className="vf-snapshot-head">
              <span className="vf-snapshot-label">Năng lực tổng hợp A2–B1</span>
              <span className="vf-pill vf-pill--indigo">
                <Trophy size={13} aria-hidden="true" />
                {getSkillLevelLabel(avgSkill)}
              </span>
            </div>
            <div className="vf-snapshot-score">
              <strong>{avgSkill}</strong>
              <span>/ 100 điểm</span>
            </div>
            <div className="vf-progress-track" style={{ marginTop: 10 }}>
              <div
                className="vf-progress-fill"
                style={{
                  width: `${avgSkill}%`,
                  "--fill-color": "linear-gradient(90deg, #6366f1, #38bdf8, #34d399)",
                }}
              />
            </div>
          </div>

          <div className="vf-snapshot-grid">
            <div className="vf-metric-tile">
              <div className="vf-metric-tile-label">
                <Layers size={13} aria-hidden="true" />
                <span>Thẻ đã thuộc</span>
              </div>
              <div className="vf-metric-tile-value">
                {masteredCards} / {totalCards}
              </div>
            </div>

            <div className="vf-metric-tile">
              <div className="vf-metric-tile-label">
                <Zap size={13} aria-hidden="true" />
                <span>Tổng XP</span>
              </div>
              <div className="vf-metric-tile-value">{xp.toLocaleString("vi-VN")} XP</div>
            </div>

            <div className="vf-metric-tile">
              <div className="vf-metric-tile-label">
                <Flame size={13} aria-hidden="true" />
                <span>Chuỗi học</span>
              </div>
              <div className="vf-metric-tile-value">{streakDays} ngày</div>
            </div>

            <div className="vf-metric-tile">
              <div className="vf-metric-tile-label">
                <CheckCircle2 size={13} aria-hidden="true" />
                <span>Phiên hoàn thành</span>
              </div>
              <div className="vf-metric-tile-value">{gameHistory.length}</div>
            </div>
          </div>

          <div className="vf-snapshot-meta">
            <span>{topics.length || 6} chủ đề thực tế</span>
            <span>•</span>
            <span>{decks.length} bộ thẻ</span>
            <span>•</span>
            <span>
              {contentStats?.listeningExercises ?? 18} bài nghe &amp;{" "}
              {contentStats?.dialogueScenarios ?? 6} tình huống đối thoại
            </span>
          </div>
        </aside>
      </section>

      {/* 4-Skill Mastery Panel */}
      <section className="vf-section" aria-labelledby="vf-skills-heading">
        <div className="vf-section-head">
          <div>
            <h2 id="vf-skills-heading" className="vf-section-title">
              Bảng Thành Thạo 4 Kỹ Năng
            </h2>
            <p className="vf-section-subtitle">
              Điểm cập nhật tự động sau mỗi phiên luyện tập — chọn bất kỳ kỹ năng nào để vào bài tập ngay.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="vf-pill vf-pill--amber">
              <Zap size={13} aria-hidden="true" />
              {xp.toLocaleString("vi-VN")} XP
            </span>
            <span className="vf-pill vf-pill--coral">
              <Flame size={13} aria-hidden="true" />
              Streak {streakDays} ngày
            </span>
          </div>
        </div>

        <div className="vf-skills-grid">
          {SKILL_CARDS_CONFIG.map((item) => {
            const Icon = item.icon;
            const meta = SKILL_META[item.id] || {};
            const score = skillScores[item.id] || 0;

            return (
              <article
                key={item.id}
                className="vf-skill-card"
                style={{ "--skill-color": item.accent }}
              >
                <div className="vf-skill-top">
                  <div className="vf-skill-icon">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div className="vf-skill-score-wrap">
                    <div className="vf-skill-score">
                      {score}
                      <small>/100</small>
                    </div>
                    <div className="vf-skill-level">{getSkillLevelLabel(score)}</div>
                  </div>
                </div>

                <div className="vf-skill-names">
                  <h3>{meta.labelVi || item.id}</h3>
                  <span>{meta.labelEn}</span>
                </div>

                <p className="vf-skill-desc">{item.desc}</p>

                <div className="vf-progress-track" aria-label={`Điểm ${meta.labelVi}: ${score}/100`}>
                  <div
                    className="vf-progress-fill"
                    style={{ width: `${score}%`, "--fill-color": item.accent }}
                  />
                </div>

                <button
                  type="button"
                  className="vf-skill-action"
                  onClick={() => onLaunchGame(item.gameId, "all")}
                >
                  <span>Luyện ngay</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* 6 Pre-Intermediate Topic Cards Grid */}
      <section className="vf-section" aria-labelledby="vf-topics-heading">
        <div className="vf-section-head">
          <div>
            <h2 id="vf-topics-heading" className="vf-section-title">
              6 Chủ Đề Pre-Intermediate (A2–B1)
            </h2>
            <p className="vf-section-subtitle">
              Khám phá mẫu câu giao tiếp có âm thanh, điểm ngữ pháp trọng tâm, hoặc mở thẳng trò chơi &amp; flashcard.
            </p>
          </div>
          <button
            type="button"
            className="vf-btn vf-btn--secondary vf-btn--sm"
            onClick={() => onOpenTopicOverview(topics[0]?.id || "self")}
          >
            <Compass size={15} aria-hidden="true" />
            <span>Xem toàn bộ 6 chủ đề</span>
          </button>
        </div>

        <div className="vf-topics-grid">
          {topics.map((topic) => {
            const Icon = TOPIC_ICONS[topic.id] || Compass;
            const accent = topic.accentColor || topic.accent || TOPIC_META[topic.id]?.accent || "#38bdf8";
            const mastery = Math.round(Number(skillProgress?.topicMastery?.[topic.id] || 0));
            const cardCount = cardsByTopic[topic.id] || 0;

            return (
              <article
                key={topic.id}
                className="vf-topic-card"
                style={{ "--topic-accent": accent }}
              >
                <div className="vf-topic-card-head">
                  <div className="vf-topic-icon">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <span className="vf-topic-cefr">{topic.cefrFocus || topic.cefrLevel || "A2–B1"}</span>
                </div>

                <div
                  className="vf-topic-body"
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenTopicOverview(topic.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOpenTopicOverview(topic.id);
                    }
                  }}
                >
                  <h3 className="vf-topic-title">{topic.titleVi}</h3>
                  <span className="vf-topic-en">{topic.titleEn}</span>
                  <p className="vf-topic-subtitle">
                    {topic.subtitleVi || topic.subtitle || topic.descriptionVi}
                  </p>
                </div>

                <div>
                  <div className="vf-topic-progress-row">
                    <span>Độ thành thạo: {mastery}%</span>
                    <span>{cardCount} flashcard</span>
                  </div>
                  <div className="vf-progress-track">
                    <div
                      className="vf-progress-fill"
                      style={{ width: `${mastery}%`, "--fill-color": accent }}
                    />
                  </div>
                </div>

                <div className="vf-topic-actions">
                  <button
                    type="button"
                    className="vf-topic-action-btn"
                    onClick={() => onOpenTopicOverview(topic.id)}
                  >
                    <Compass size={13} aria-hidden="true" />
                    <span>Chi tiết</span>
                  </button>
                  <button
                    type="button"
                    className="vf-topic-action-btn"
                    onClick={() => onLaunchGame("hub", topic.id)}
                  >
                    <Gamepad2 size={13} aria-hidden="true" />
                    <span>Trò chơi</span>
                  </button>
                  <button
                    type="button"
                    className="vf-topic-action-btn"
                    onClick={() => onOpenFlashcards(topic.id)}
                  >
                    <Layers size={13} aria-hidden="true" />
                    <span>Thẻ từ</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Recent Practice Activity Feed */}
      <section className="vf-section" aria-labelledby="vf-activity-heading">
        <div className="vf-section-head">
          <div>
            <h2 id="vf-activity-heading" className="vf-section-title">
              Hoạt Động Luyện Tập Gần Đây
            </h2>
            <p className="vf-section-subtitle">
              Theo dõi lịch sử điểm số, độ chính xác và kỹ năng đã rèn luyện.
            </p>
          </div>
        </div>

        <div className="vf-activity-panel">
          {recentHistory.length === 0 ? (
            <div className="vf-activity-empty">
              <Clock size={26} aria-hidden="true" />
              <p>
                Chưa có phiên luyện tập nào được ghi nhận. Hãy bắt đầu với một bài nghe ngắn hoặc ôn vài
                flashcard để tích lũy XP và kích hoạt chuỗi ngày học!
              </p>
              <button
                type="button"
                className="vf-btn vf-btn--primary vf-btn--sm"
                onClick={() => onLaunchGame("listening", "all")}
              >
                <Headphones size={15} aria-hidden="true" />
                <span>Thử bài nghe đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="vf-activity-list">
              {recentHistory.map((session) => {
                const gameLabel = GAME_LABELS[session.gameType] || session.gameType || "Phiên luyện tập";
                const topicLabel = session.topicId
                  ? TOPIC_META[session.topicId]?.titleVi || session.topicId
                  : "Tổng hợp 6 chủ đề";
                const accuracy = Math.round(Number(session.accuracy || 0));

                return (
                  <div key={session.id} className="vf-activity-item">
                    <div className="vf-activity-left">
                      <div className="vf-activity-icon">
                        <CheckCircle2 size={18} aria-hidden="true" />
                      </div>
                      <div className="vf-activity-info">
                        <p className="vf-activity-title">{gameLabel}</p>
                        <div className="vf-activity-meta">
                          <span>{topicLabel}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(session.createdAt)}</span>
                          {(session.skillTags || []).map((skill) => (
                            <span key={skill} className="vf-pill">
                              {SKILL_META[skill]?.labelVi || skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="vf-activity-right">
                      {session.maxScore > 0 && (
                        <span className="vf-activity-score">
                          {session.score}/{session.maxScore}
                        </span>
                      )}
                      <span className={`vf-pill ${getAccuracyTone(accuracy)}`}>
                        {accuracy}% chính xác
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
