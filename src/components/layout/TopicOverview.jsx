import React, { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarClock,
  CloudSun,
  Compass,
  Headphones,
  Heart,
  Layers,
  MessageCircle,
  MessageSquare,
  Mic,
  Sparkles,
  Square,
  User,
  Utensils,
  Volume2,
} from "lucide-react";
import { TOPIC_META } from "../../lib/contracts";
import { speakVietnamese, stopSpeaking } from "../../lib/speech";

const TOPIC_ICONS = {
  self: User,
  food: Utensils,
  routine: CalendarClock,
  weather: CloudSun,
  emotions: Heart,
  opinions: MessageSquare,
};

const PLAYBACK_RATES = [
  { value: 0.8, label: "0.8x" },
  { value: 1, label: "1.0x" },
];

export function TopicOverview({
  topics = [],
  selectedTopicId,
  onSelectTopic,
  skillProgress,
  decks = [],
  onLaunchGame,
  onOpenFlashcards,
}) {
  const [speechRate, setSpeechRate] = useState(1);
  const [playingKey, setPlayingKey] = useState(null);

  const activeTopic =
    topics.find((t) => t.id === selectedTopicId) || topics[0] || null;

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    stopSpeaking();
    setPlayingKey(null);
  }, [activeTopic?.id]);

  const handlePlayPhrase = async (key, text) => {
    if (!text) return;
    if (playingKey === key) {
      stopSpeaking();
      setPlayingKey(null);
      return;
    }

    setPlayingKey(key);
    try {
      await speakVietnamese(text, {
        rate: speechRate,
        onStart: () => setPlayingKey(key),
        onEnd: () => setPlayingKey((prev) => (prev === key ? null : prev)),
        onError: () => setPlayingKey((prev) => (prev === key ? null : prev)),
      });
    } catch {
      setPlayingKey(null);
    }
  };

  if (!activeTopic) {
    return (
      <div className="vf-activity-panel vf-view-enter">
        <p style={{ margin: 0, color: "var(--text-muted)" }}>
          Đang tải danh sách chủ đề...
        </p>
      </div>
    );
  }

  const TopicIcon = TOPIC_ICONS[activeTopic.id] || Compass;
  const accent =
    activeTopic.accentColor ||
    activeTopic.accent ||
    TOPIC_META[activeTopic.id]?.accent ||
    "#38bdf8";
  const mastery = Math.round(
    Number(skillProgress?.topicMastery?.[activeTopic.id] || 0)
  );
  const keyPhrases = Array.isArray(activeTopic.keyPhrases)
    ? activeTopic.keyPhrases
    : [];
  const grammar = activeTopic.grammarSpotlight || null;

  const topicCardCount = decks.reduce((sum, deck) => {
    const matches = (deck.cards || []).filter(
      (c) => (c.topicId || deck.topicId) === activeTopic.id
    ).length;
    return sum + matches;
  }, 0);

  const launchItems = [
    {
      id: "listening",
      title: "Nghe hiểu",
      sub: "Hội thoại & câu hỏi thực tế",
      icon: Headphones,
      color: "#38bdf8",
      onClick: () => onLaunchGame("listening", activeTopic.id),
    },
    {
      id: "pronunciation",
      title: "Phát âm & Thanh điệu",
      sub: "Cặp từ tối thiểu & đọc câu",
      icon: Mic,
      color: "#fb7185",
      onClick: () => onLaunchGame("pronunciation", activeTopic.id),
    },
    {
      id: "dialogue",
      title: "Đối thoại nhập vai",
      sub: "Thực hành nói 4 lượt tương tác",
      icon: MessageCircle,
      color: "#34d399",
      onClick: () => onLaunchGame("dialogue", activeTopic.id),
    },
    {
      id: "reading",
      title: "Đọc hiểu & Ghép câu",
      sub: "Đoạn văn có từ điển chạm",
      icon: BookOpen,
      color: "#fbbf24",
      onClick: () => onLaunchGame("reading", activeTopic.id),
    },
    {
      id: "flashcards",
      title: "Flashcard chủ đề",
      sub: `${topicCardCount} thẻ từ vựng A2–B1`,
      icon: Layers,
      color: "#a78bfa",
      onClick: () => onOpenFlashcards(activeTopic.id),
    },
  ];

  return (
    <div className="vf-topics-page vf-view-enter">
      {/* Topic Selector Tabs */}
      <div className="vf-section-head" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="vf-section-title" style={{ fontSize: "1.55rem" }}>
            6 Chủ Đề Tiếng Việt Pre-Intermediate (A2–B1)
          </h1>
          <p className="vf-section-subtitle">
            Chọn chủ đề để nghe mẫu câu giao tiếp chuẩn, nắm điểm ngữ pháp và mở ngay bài luyện tập tương ứng.
          </p>
        </div>
      </div>

      <div className="vf-topic-selector" role="tablist" aria-label="Chọn chủ đề">
        {topics.map((topic) => {
          const Icon = TOPIC_ICONS[topic.id] || Compass;
          const tAccent =
            topic.accentColor || topic.accent || TOPIC_META[topic.id]?.accent || "#38bdf8";
          const isActive = topic.id === activeTopic.id;

          return (
            <button
              key={topic.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`vf-topic-pill-btn ${isActive ? "is-active" : ""}`}
              style={{ "--topic-accent": tAccent }}
              onClick={() => onSelectTopic(topic.id)}
            >
              <Icon size={15} aria-hidden="true" />
              <span>{topic.titleVi}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Topic Hero Banner */}
      <section
        className="vf-topic-banner"
        style={{ "--topic-accent": accent }}
        aria-label={`Chi tiết chủ đề ${activeTopic.titleVi}`}
      >
        <div>
          <div className="vf-topic-banner-head">
            <div className="vf-topic-icon" style={{ "--topic-accent": accent }}>
              <TopicIcon size={22} aria-hidden="true" />
            </div>
            <div>
              <span className="vf-pill vf-pill--indigo" style={{ marginBottom: 6 }}>
                {activeTopic.cefrFocus || activeTopic.cefrLevel || "CEFR A2–B1"}
              </span>
              <h2 className="vf-topic-banner-title">{activeTopic.titleVi}</h2>
              <span className="vf-topic-en">{activeTopic.titleEn}</span>
            </div>
          </div>

          <p className="vf-topic-banner-desc">
            {activeTopic.descriptionVi || activeTopic.summary || activeTopic.subtitleVi}
          </p>
        </div>

        <div className="vf-topic-banner-stats">
          <div>
            <div className="vf-topic-progress-row">
              <span>Tiến độ chủ đề</span>
              <strong style={{ color: "#ffffff" }}>{mastery}%</strong>
            </div>
            <div className="vf-progress-track">
              <div
                className="vf-progress-fill"
                style={{ width: `${mastery}%`, "--fill-color": accent }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="vf-pill">{keyPhrases.length} mẫu câu nghe nhanh</span>
            <span className="vf-pill">{topicCardCount} thẻ flashcard</span>
          </div>

          <button
            type="button"
            className="vf-btn vf-btn--primary vf-btn--sm"
            onClick={() => onLaunchGame("listening", activeTopic.id)}
          >
            <Headphones size={15} aria-hidden="true" />
            <span>Bắt đầu luyện chủ đề này</span>
          </button>
        </div>
      </section>

      {/* Interactive Key Phrases */}
      <section aria-labelledby="vf-phrases-heading">
        <div className="vf-section-head">
          <div>
            <h3 id="vf-phrases-heading" className="vf-section-title">
              Mẫu Câu Giao Tiếp Trọng Tâm
            </h3>
            <p className="vf-section-subtitle">
              Nhấn biểu tượng loa trên từng thẻ để nghe phát âm tiếng Việt tự nhiên ngay lập tức.
            </p>
          </div>

          <div className="vf-speed-group" role="group" aria-label="Tốc độ phát âm">
            {PLAYBACK_RATES.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`vf-speed-btn ${speechRate === option.value ? "is-active" : ""}`}
                onClick={() => setSpeechRate(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="vf-phrases-grid">
          {keyPhrases.map((phrase, idx) => {
            const phraseKey = `${activeTopic.id}-phrase-${idx}`;
            const isPlaying = playingKey === phraseKey;
            return (
              <article
                key={phraseKey}
                className={`vf-phrase-card ${isPlaying ? "is-playing" : ""}`}
              >
                <div>
                  <p className="vf-phrase-vi">{phrase.vi}</p>
                  {phrase.ipa && <p className="vf-phrase-ipa">{phrase.ipa}</p>}
                  {phrase.en && <p className="vf-phrase-en">{phrase.en}</p>}
                  {phrase.noteVi && <p className="vf-phrase-note">{phrase.noteVi}</p>}
                </div>

                <button
                  type="button"
                  className={`vf-audio-btn ${isPlaying ? "is-playing" : ""}`}
                  onClick={() => handlePlayPhrase(phraseKey, phrase.vi)}
                  aria-label={isPlaying ? `Dừng đọc "${phrase.vi}"` : `Nghe phát âm "${phrase.vi}"`}
                  title={isPlaying ? "Dừng phát âm" : "Nghe phát âm tiếng Việt"}
                >
                  {isPlaying ? <Square size={15} /> : <Volume2 size={18} />}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* Grammar Spotlight */}
      {grammar && (
        <section aria-labelledby="vf-grammar-heading">
          <div className="vf-section-head">
            <div>
              <h3 id="vf-grammar-heading" className="vf-section-title">
                Điểm Ngữ Pháp Nổi Bật
              </h3>
              <p className="vf-section-subtitle">
                Cấu trúc quan trọng giúp diễn đạt tự nhiên và mạch lạc hơn ở mức A2–B1.
              </p>
            </div>
          </div>

          <div className="vf-grammar-card">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span className="vf-pill vf-pill--indigo">
                <Sparkles size={13} aria-hidden="true" />
                Grammar Spotlight
              </span>
              <span className="vf-grammar-pattern">{grammar.pattern}</span>
            </div>

            {grammar.explanationVi && (
              <p className="vf-grammar-explanation">{grammar.explanationVi}</p>
            )}

            {grammar.exampleVi && (
              <div className="vf-grammar-example">
                <div>
                  <p className="vf-grammar-example-vi">{grammar.exampleVi}</p>
                  {grammar.exampleEn && (
                    <p className="vf-grammar-example-en">{grammar.exampleEn}</p>
                  )}
                </div>

                <button
                  type="button"
                  className={`vf-audio-btn ${playingKey === "grammar-example" ? "is-playing" : ""}`}
                  onClick={() => handlePlayPhrase("grammar-example", grammar.exampleVi)}
                  aria-label="Nghe câu ví dụ ngữ pháp"
                  title="Nghe câu ví dụ"
                >
                  {playingKey === "grammar-example" ? <Square size={15} /> : <Volume2 size={18} />}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Quick Launch Arena */}
      <section aria-labelledby="vf-topic-launch-heading">
        <div className="vf-section-head">
          <div>
            <h3 id="vf-topic-launch-heading" className="vf-section-title">
              Thực Hành Ngay Với Chủ Đề “{activeTopic.titleVi}”
            </h3>
            <p className="vf-section-subtitle">
              Chuyển thẳng vào chế độ luyện tập đã lọc sẵn theo chủ đề này.
            </p>
          </div>
        </div>

        <div className="vf-launch-grid">
          {launchItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className="vf-launch-card"
                style={{ "--launch-color": item.color }}
                onClick={item.onClick}
              >
                <span className="vf-launch-icon">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span className="vf-launch-title">{item.title}</span>
                <span className="vf-launch-sub">{item.sub}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default TopicOverview;
