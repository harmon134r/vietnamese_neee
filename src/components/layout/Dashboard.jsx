import React from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  FileUp,
  GraduationCap,
  Headphones,
  Layers,
  MessageCircle,
  Mic,
  PawPrint,
  Settings2,
} from "lucide-react";
import { GAME_TYPES, MASTERY_LEVELS, SKILL_META, TOPIC_META } from "../../lib/contracts";
import { isTeacherProfile, resolveStudentDisplayName } from "../../lib/supabase";
import { APP_ART, TOPIC_ILLUSTRATIONS } from "../../data/illustrations";

const SKILL_BAR_ITEMS = [
  { id: "listening", label: "Nghe", gameId: "listening" },
  { id: "speaking", label: "Nói", gameId: "dialogue" },
  { id: "reading", label: "Đọc", gameId: "reading" },
  { id: "pronunciation", label: "Phát âm", gameId: "pronunciation" },
];

const QUICK_SHORTCUTS = [
  {
    id: "listening",
    gameId: "listening",
    icon: Headphones,
    title: "Nghe hiểu hội thoại",
    sub: "Nghe tình huống đời sống, chỉnh tốc độ đọc",
  },
  {
    id: "pronunciation",
    gameId: "pronunciation",
    icon: Mic,
    title: "Luyện 6 thanh điệu",
    sub: "Cặp từ tối thiểu & chấm phát âm từng âm tiết",
  },
  {
    id: "dialogue",
    gameId: "dialogue",
    icon: MessageCircle,
    title: "Đối thoại nhập vai",
    sub: "Phản xạ giao tiếp 4 lượt theo ngữ cảnh",
  },
  {
    id: "reading",
    gameId: "reading",
    icon: BookOpen,
    title: "Đọc hiểu & ghép câu",
    sub: "Đoạn văn A2–B1 có tra từ ngay trong bài",
  },
  {
    id: "chase",
    gameId: "chase",
    icon: PawPrint,
    title: "Đuổi bắt đồng · trái nghĩa",
    sub: "Chó đuổi mèo 2 làn chạy/nhảy · 4 bối cảnh & nhạc chill",
  },
];

const GAME_LABELS = {
  [GAME_TYPES.LISTEN_MATCH]: "Nghe hiểu hội thoại",
  [GAME_TYPES.TONE_RADAR]: "Luyện thanh điệu",
  [GAME_TYPES.PRONUNCIATION_LAB]: "Luyện phát âm",
  [GAME_TYPES.DIALOGUE_BUILDER]: "Đối thoại nhập vai",
  [GAME_TYPES.SHADOW_SPEAK]: "Đọc theo câu mẫu",
  [GAME_TYPES.READING_COMPREHENSION]: "Đọc hiểu & ghép câu",
  [GAME_TYPES.SYNONYM_ANTONYM_CHASE]: "Đuổi bắt đồng · trái nghĩa",
  [GAME_TYPES.FLASHCARD_REVIEW]: "Ôn tập flashcard",
  listening: "Nghe hiểu hội thoại",
  pronunciation: "Luyện phát âm",
  dialogue: "Đối thoại nhập vai",
  reading: "Đọc hiểu & ghép câu",
  chase: "Đuổi bắt đồng · trái nghĩa",
};

function formatRelativeTime(isoString) {
  if (!isoString) return "vừa xong";
  const time = new Date(isoString).getTime();
  if (!Number.isFinite(time)) return "vừa xong";
  const diffSec = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (diffSec < 60) return "vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return new Date(isoString).toLocaleDateString("vi-VN");
}

function getScoreToneClass(accuracy) {
  if (accuracy >= 80) return "vf-log-score--good";
  if (accuracy >= 60) return "vf-log-score--warn";
  return "vf-log-score--bad";
}

export function Dashboard({
  topics = [],
  decks = [],
  skillProgress,
  gameHistory = [],
  user,
  userProfile,
  isTeacher: isTeacherProp,
  teacherName = "",
  onLaunchGame,
  onOpenFlashcards,
  onOpenAssignedDeck,
  onOpenTeacherPdfUpload,
  onCreateFlashcard,
  onOpenTopicOverview,
}) {
  const isTeacher =
    typeof isTeacherProp === "boolean"
      ? isTeacherProp
      : Boolean(isTeacherProfile?.(userProfile, user));

  const assignedDecks = decks.filter((deck) => Boolean(deck?.isAssigned));

  const skillScores = {
    listening: Math.round(Number(skillProgress?.listening || 0)),
    speaking: Math.round(Number(skillProgress?.speaking || 0)),
    reading: Math.round(Number(skillProgress?.reading || 0)),
    pronunciation: Math.round(Number(skillProgress?.pronunciation || 0)),
  };

  const totalCards = decks.reduce(
    (sum, deck) => sum + (deck.cards?.length || deck.cardCount || 0),
    0
  );
  const masteredCards = decks.reduce(
    (sum, deck) =>
      sum +
      (deck.cards || []).filter(
        (card) => Number(card.masteryLevel || 0) >= MASTERY_LEVELS.STRONG
      ).length,
    0
  );

  const cardsByTopic = decks.reduce((acc, deck) => {
    for (const card of deck.cards || []) {
      const tid = card.topicId || deck.topicId;
      if (tid) acc[tid] = (acc[tid] || 0) + 1;
    }
    return acc;
  }, {});

  const displayName = user
    ? resolveStudentDisplayName(userProfile, user, teacherName || "")
    : "";

  const recentHistory = gameHistory.slice(0, 5);

  const openDeckInStudio = (deckId, tab = "study") => {
    if (typeof onOpenAssignedDeck === "function") {
      onOpenAssignedDeck(deckId, tab);
    } else {
      onOpenFlashcards?.("all");
    }
  };

  return (
    <div className="vf-desk vf-view-enter">
      {/* Top Study Desk Header */}
      <section className="vf-desk-header" aria-label="Bàn học tiếng Việt">
        <div className="vf-desk-masthead">
          <div className="vf-desk-greeting">
            <div className="vf-art-frame vf-desk-mascot">
              <img
                src={APP_ART.mascot.src}
                alt={APP_ART.mascot.alt}
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="vf-desk-intro">
              <h1 className="vf-desk-title">
                {displayName
                  ? `Chào ${displayName}, hôm nay luyện gì?`
                  : "Chào bạn, hôm nay luyện gì?"}
              </h1>
              <p className="vf-desk-subtitle">
                Chọn một chủ đề giao tiếp hằng ngày để nghe, nói, đọc hoặc ôn lại bộ thẻ từ của riêng bạn.
              </p>
            </div>
          </div>

          <div className="vf-desk-actions">
            <button
              type="button"
              className="vf-btn vf-btn--primary"
              onClick={() => onLaunchGame("hub", "all")}
            >
              Vào luyện 4 kỹ năng
            </button>
            <button
              type="button"
              className="vf-btn vf-btn--ghost"
              onClick={() => onOpenFlashcards("all")}
            >
              Mở Flashcard
            </button>
          </div>
        </div>

        {/* Sleek Horizontal 4-Skill Progress Bar */}
        <div className="vf-skill-strip" role="group" aria-label="Tiến độ 4 kỹ năng">
          {SKILL_BAR_ITEMS.map((item) => {
            const score = skillScores[item.id] || 0;
            const label = SKILL_META[item.id]?.labelVi || item.label;
            return (
              <button
                key={item.id}
                type="button"
                className="vf-skill-cell"
                onClick={() => onLaunchGame(item.gameId, "all")}
                title={`Luyện kỹ năng ${label} (${score}%)`}
              >
                <span className="vf-skill-cell-head">
                  <span className="vf-skill-cell-name">{label}</span>
                  <span className="vf-skill-cell-val">{score}%</span>
                </span>
                <span className="vf-track" aria-hidden="true">
                  <span className="vf-track-fill" style={{ width: `${score}%` }} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Teacher Corner Panel — Assigned PDF Flashcards */}
      {isTeacher && (
        <section
          className="vf-teacher-panel"
          aria-labelledby="vf-teacher-corner-heading"
          data-testid="vf-teacher-panel"
        >
          <div className="vf-teacher-panel-head">
            <div className="vf-teacher-panel-copy">
              <span className="vf-teacher-kicker">
                <GraduationCap size={14} aria-hidden="true" />
                <span>Góc giáo viên</span>
              </span>
              <h2 id="vf-teacher-corner-heading" className="vf-teacher-panel-title">
                Góc giáo viên — Giao Flashcard từ PDF
              </h2>
              <p className="vf-teacher-panel-sub">
                {assignedDecks.length > 0
                  ? `Đang giao ${assignedDecks.length} bộ thẻ cho học sinh · Học sinh mở web sẽ thấy ngay ở đầu trang để học và luyện phát âm.`
                  : "Đang giao 0 bộ thẻ cho học sinh · Tải file PDF có lớp chữ để tạo và giao ngay cho lớp."}
              </p>
            </div>

            <div className="vf-teacher-panel-actions">
              <button
                type="button"
                className="vf-btn vf-btn--primary"
                onClick={() =>
                  typeof onOpenTeacherPdfUpload === "function"
                    ? onOpenTeacherPdfUpload()
                    : onCreateFlashcard?.()
                }
              >
                <FileUp size={15} aria-hidden="true" />
                <span>Tải PDF giao bài mới</span>
              </button>
            </div>
          </div>

          {assignedDecks.length > 0 && (
            <div className="vf-teacher-deck-list" aria-label="Các bộ thẻ đang giao cho học sinh">
              {assignedDecks.map((deck) => {
                const count = deck.cards?.length || deck.cardCount || 0;
                const topicLabel = deck.topicId ? TOPIC_META[deck.topicId]?.titleVi : "";
                return (
                  <div key={deck.id} className="vf-teacher-deck-row">
                    <div className="vf-teacher-deck-info">
                      <span className="vf-teacher-deck-badge">GV giao</span>
                      <span className="vf-teacher-deck-name">{deck.title}</span>
                      <span className="vf-teacher-deck-meta">
                        {count} thẻ{topicLabel ? ` · ${topicLabel}` : ""}
                      </span>
                    </div>
                    <div className="vf-teacher-deck-actions">
                      <button
                        type="button"
                        className="vf-btn vf-btn--ghost vf-btn--sm"
                        onClick={() => openDeckInStudio(deck.id, "study")}
                      >
                        <Layers size={13} aria-hidden="true" />
                        <span>Mở bộ thẻ</span>
                      </button>
                      <button
                        type="button"
                        className="vf-btn vf-btn--secondary vf-btn--sm"
                        onClick={() => openDeckInStudio(deck.id, "manage")}
                      >
                        <Settings2 size={13} aria-hidden="true" />
                        <span>Quản lý</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Student & Guest Assigned Flashcards Strip */}
      {!isTeacher && assignedDecks.length > 0 && (
        <section
          className="vf-assigned-section"
          aria-labelledby="vf-assigned-heading"
          data-testid="vf-assigned-section"
        >
          <div className="vf-col-head vf-assigned-head">
            <div className="vf-assigned-head-title">
              <h2 id="vf-assigned-heading" className="vf-col-title">
                Flashcard giáo viên giao
              </h2>
              <span className="vf-tag vf-tag--teacher">
                {assignedDecks.length} bộ thẻ
              </span>
            </div>
            <button
              type="button"
              className="vf-text-link"
              onClick={() => onOpenFlashcards("all")}
            >
              <span>Xem tất cả thẻ</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="vf-assigned-grid">
            {assignedDecks.map((deck) => {
              const cardCount = deck.cards?.length || deck.cardCount || 0;
              const masteredCount = (deck.cards || []).filter(
                (card) => Number(card.masteryLevel || 0) >= MASTERY_LEVELS.STRONG
              ).length;
              const masteryPct =
                cardCount > 0 ? Math.round((masteredCount / cardCount) * 100) : 0;
              const assignedBy = deck.teacherName || "Giáo viên";

              return (
                <article key={deck.id} className="vf-assigned-card">
                  <div className="vf-assigned-card-top">
                    <span className="vf-assigned-kicker">
                      Giáo viên giao · {assignedBy}
                    </span>
                    <span className="vf-assigned-count">{cardCount} thẻ</span>
                  </div>

                  <h3 className="vf-assigned-card-title">{deck.title}</h3>

                  <div className="vf-assigned-progress">
                    <div className="vf-track" aria-hidden="true">
                      <span
                        className="vf-track-fill vf-track-fill--good"
                        style={{ width: `${masteryPct}%` }}
                      />
                    </div>
                    <span className="vf-assigned-mastery">
                      {masteredCount}/{cardCount} đã thuộc
                    </span>
                  </div>

                  <div className="vf-assigned-card-foot">
                    <button
                      type="button"
                      className="vf-btn vf-btn--primary vf-btn--sm"
                      onClick={() => openDeckInStudio(deck.id, "study")}
                    >
                      <span>Làm ngay →</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Asymmetric 2-Column Main Workspace */}
      <div className="vf-desk-grid">
        {/* Left Column: 6 Course Chapters */}
        <section aria-labelledby="vf-topics-heading">
          <div className="vf-col-head">
            <h2 id="vf-topics-heading" className="vf-col-title">
              6 chủ đề giao tiếp (A2–B1)
            </h2>
            <button
              type="button"
              className="vf-text-link"
              onClick={() => onOpenTopicOverview(topics[0]?.id || "self")}
            >
              <span>Xem mục lục</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="vf-chapter-list">
            {topics.map((topic, index) => {
              const chapterNum = String(index + 1).padStart(2, "0");
              const mastery = Math.round(
                Number(skillProgress?.topicMastery?.[topic.id] || 0)
              );
              const cardCount = cardsByTopic[topic.id] || 0;
              const topicArt = TOPIC_ILLUSTRATIONS[topic.id];

              return (
                <article key={topic.id} className="vf-chapter-row">
                  <span className="vf-chapter-num" aria-hidden="true">
                    {chapterNum}
                  </span>

                  {topicArt && (
                    <div
                      className="vf-art-frame vf-chapter-thumb"
                      onClick={() => onOpenTopicOverview(topic.id)}
                    >
                      <img
                        src={topicArt.src}
                        alt={topicArt.alt}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}

                  <div className="vf-chapter-body">
                    <div className="vf-chapter-top">
                      <button
                        type="button"
                        className="vf-chapter-title-btn"
                        onClick={() => onOpenTopicOverview(topic.id)}
                      >
                        {topic.titleVi}
                      </button>
                      <span className="vf-chapter-meta">
                        {mastery}% · {cardCount} thẻ
                      </span>
                    </div>

                    <p className="vf-chapter-desc">
                      {topic.subtitleVi || topic.subtitle || topic.descriptionVi}
                    </p>

                    <div className="vf-chapter-links" aria-label={`Luyện chủ đề ${topic.titleVi}`}>
                      <button
                        type="button"
                        className="vf-inline-action"
                        onClick={() => onLaunchGame("listening", topic.id)}
                      >
                        Nghe
                      </button>
                      <span className="vf-dot-sep" aria-hidden="true">
                        ·
                      </span>
                      <button
                        type="button"
                        className="vf-inline-action"
                        onClick={() => onLaunchGame("pronunciation", topic.id)}
                      >
                        Phát âm
                      </button>
                      <span className="vf-dot-sep" aria-hidden="true">
                        ·
                      </span>
                      <button
                        type="button"
                        className="vf-inline-action"
                        onClick={() => onLaunchGame("dialogue", topic.id)}
                      >
                        Đối thoại
                      </button>
                      <span className="vf-dot-sep" aria-hidden="true">
                        ·
                      </span>
                      <button
                        type="button"
                        className="vf-inline-action"
                        onClick={() => onOpenFlashcards(topic.id)}
                      >
                        Thẻ từ
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Right Column: Practice Shortcuts, Quick Flashcard, Recent Log */}
        <aside className="vf-desk-aside" aria-label="Lối tắt và ghi nhận">
          <section className="vf-aside-block" aria-labelledby="vf-shortcuts-heading">
            <div className="vf-col-head">
              <h2 id="vf-shortcuts-heading" className="vf-col-label">
                Lối tắt luyện tập
              </h2>
            </div>

            <div className="vf-shortcut-list">
              {QUICK_SHORTCUTS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="vf-shortcut-row"
                    onClick={() => onLaunchGame(item.gameId, "all")}
                  >
                    <span className="vf-shortcut-left">
                      <Icon size={16} className="vf-shortcut-icon" aria-hidden="true" />
                      <span>
                        <span className="vf-shortcut-title">{item.title}</span>
                        <span className="vf-shortcut-sub">{item.sub}</span>
                      </span>
                    </span>
                    <ChevronRight size={15} className="vf-shortcut-arrow" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="vf-aside-block" aria-label="Tạo flashcard nhanh">
            <button
              type="button"
              className="vf-quick-card"
              onClick={onCreateFlashcard}
            >
              <span className="vf-quick-card-head">
                <span className="vf-quick-card-head-copy">
                  <span className="vf-quick-card-title">Tạo flashcard nhanh</span>
                  <span className="vf-quick-card-stat">
                    {masteredCards}/{totalCards} đã thuộc
                  </span>
                </span>
                <span className="vf-art-frame vf-quick-card-art">
                  <img
                    src={APP_ART.banhChung.src}
                    alt={APP_ART.banhChung.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              </span>
              <p className="vf-quick-card-desc">
                Tự thêm từ vựng mới hoặc dán nhiều dòng cùng lúc để ôn nghe và kiểm tra phát âm.
              </p>
              <span className="vf-quick-card-cta">
                <span>Thêm thẻ mới</span>
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            </button>
          </section>

          <section className="vf-aside-block" aria-labelledby="vf-activity-heading">
            <div className="vf-col-head">
              <h2 id="vf-activity-heading" className="vf-col-label">
                Ghi nhận gần đây
              </h2>
            </div>

            {recentHistory.length === 0 ? (
              <div className="vf-log-empty">
                <p>
                  Chưa có bài luyện nào được lưu. Bắt đầu với một bài nghe ngắn hoặc ôn vài thẻ từ để ghi nhận tiến độ.
                </p>
                <button
                  type="button"
                  className="vf-text-link"
                  onClick={() => onLaunchGame("listening", "all")}
                >
                  <span>Thử bài nghe đầu tiên</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="vf-log-list">
                {recentHistory.map((session) => {
                  const gameLabel =
                    GAME_LABELS[session.gameType] || session.gameType || "Bài luyện";
                  const topicLabel = session.topicId
                    ? TOPIC_META[session.topicId]?.titleVi || session.topicId
                    : "Tất cả chủ đề";
                  const accuracy = Math.round(Number(session.accuracy || 0));

                  return (
                    <div key={session.id} className="vf-log-row">
                      <div className="vf-log-main">
                        <p className="vf-log-title">{gameLabel}</p>
                        <div className="vf-log-meta">
                          {topicLabel} · {formatRelativeTime(session.createdAt)}
                        </div>
                      </div>
                      <span className={`vf-log-score ${getScoreToneClass(accuracy)}`}>
                        {accuracy}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
