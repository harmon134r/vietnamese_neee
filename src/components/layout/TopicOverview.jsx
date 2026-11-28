import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Headphones,
  Layers,
  MessageCircle,
  Mic,
  Square,
  Volume2,
} from "lucide-react";
import { getContentStats } from "../../data";
import * as speechApi from "../../lib/speech";
import { APP_ART, TOPIC_ILLUSTRATIONS } from "../../data/illustrations";

const TOPIC_SHORT_LABELS = {
  self: "Bản thân",
  food: "Ẩm thực",
  routine: "Sinh hoạt",
  weather: "Thời tiết",
  emotions: "Cảm xúc",
  opinions: "Quan điểm",
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
  const [voiceId, setVoiceId] = useState(
    () => speechApi.getSelectedVoice?.() || speechApi.RANDOM_VOICE_ID || "random"
  );
  const contentStats = useMemo(() => getContentStats(), []);

  const activeIndex = Math.max(
    0,
    topics.findIndex((t) => t.id === selectedTopicId)
  );
  const activeTopic = topics[activeIndex] || topics[0] || null;

  useEffect(() => {
    const voiceChangeEvent =
      speechApi.VOICE_CHANGE_EVENT || "vietflow:voice-change";
    const voiceStorageKey = speechApi.VOICE_STORAGE_KEY || "vietflow_tts_voice";

    const syncVoice = (event) => {
      const next = event?.detail?.voice || speechApi.getSelectedVoice?.();
      if (next) setVoiceId(next);
    };
    const handleStorage = (event) => {
      if (!event?.key || event.key === voiceStorageKey) {
        const next = speechApi.getSelectedVoice?.();
        if (next) setVoiceId(next);
      }
    };

    const handleFocusSync = () => {
      const next = speechApi.getSelectedVoice?.();
      if (next) setVoiceId(next);
    };
    const handleVisibility = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        handleFocusSync();
      }
    };

    window.addEventListener(voiceChangeEvent, syncVoice);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocusSync);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener(voiceChangeEvent, syncVoice);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocusSync);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    return () => {
      speechApi.stopSpeaking?.();
    };
  }, []);

  useEffect(() => {
    speechApi.stopSpeaking?.();
    setPlayingKey(null);
  }, [activeTopic?.id]);

  // Quietly prefetch the first 3 key phrases of the selected topic
  useEffect(() => {
    if (!activeTopic) return;
    if (typeof speechApi.prefetchVietnamese !== "function") return;
    const texts = (Array.isArray(activeTopic.keyPhrases) ? activeTopic.keyPhrases : [])
      .slice(0, 3)
      .map((phrase) => (typeof phrase === "string" ? phrase : phrase?.vi))
      .filter(Boolean);
    if (texts.length > 0) {
      speechApi.prefetchVietnamese(texts, voiceId ? { voice: voiceId } : {});
    }
  }, [activeTopic, voiceId]);

  const handlePlayPhrase = async (key, text) => {
    if (!text) return;
    if (playingKey === key) {
      speechApi.stopSpeaking?.();
      setPlayingKey(null);
      return;
    }

    setPlayingKey(key);
    try {
      await speechApi.speakVietnamese?.(text, {
        rate: speechRate,
        voice: voiceId,
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
      <div className="vf-chapter-page vf-view-enter">
        <p style={{ margin: 0, color: "var(--text-muted)" }}>
          Đang tải danh sách chủ đề...
        </p>
      </div>
    );
  }

  const chapterCode = String(activeIndex + 1).padStart(2, "0");
  const mastery = Math.round(
    Number(skillProgress?.topicMastery?.[activeTopic.id] || 0)
  );
  const keyPhrases = Array.isArray(activeTopic.keyPhrases)
    ? activeTopic.keyPhrases
    : [];
  const grammar = activeTopic.grammarSpotlight || null;
  const topicArt = TOPIC_ILLUSTRATIONS[activeTopic.id] || null;
  const isFoodTopic = activeTopic.id === "food";

  const topicCardCount = decks.reduce((sum, deck) => {
    const matches = (deck.cards || []).filter(
      (c) => (c.topicId || deck.topicId) === activeTopic.id
    ).length;
    return sum + matches;
  }, 0);

  const topicStats = contentStats.byTopic?.[activeTopic.id] || {
    listeningExercises: 0,
    minimalPairs: 0,
    pronunciationSentences: 0,
    dialogueScenarios: 0,
    readingPassages: 0,
    sentenceBuilders: 0,
  };

  const practiceLinks = [
    {
      id: "listening",
      title: "Nghe hiểu",
      sub: `${topicStats.listeningExercises} bài nghe hội thoại theo ngữ cảnh`,
      icon: Headphones,
      onClick: () => onLaunchGame("listening", activeTopic.id),
    },
    {
      id: "pronunciation",
      title: "Phát âm & thanh điệu",
      sub: `${topicStats.minimalPairs} cặp từ · ${topicStats.pronunciationSentences} câu đọc mẫu`,
      icon: Mic,
      onClick: () => onLaunchGame("pronunciation", activeTopic.id),
    },
    {
      id: "dialogue",
      title: "Đối thoại nhập vai",
      sub: `${topicStats.dialogueScenarios} tình huống · 4 lượt hỏi đáp`,
      icon: MessageCircle,
      onClick: () => onLaunchGame("dialogue", activeTopic.id),
    },
    {
      id: "reading",
      title: "Đọc hiểu & ghép câu",
      sub: `${topicStats.readingPassages} bài đọc · ${topicStats.sentenceBuilders} câu ghép`,
      icon: BookOpen,
      onClick: () => onLaunchGame("reading", activeTopic.id),
    },
    {
      id: "flashcards",
      title: "Thẻ từ vựng",
      sub: `${topicCardCount} thẻ thuộc chủ đề này`,
      icon: Layers,
      onClick: () => onOpenFlashcards(activeTopic.id),
    },
  ];

  return (
    <div className="vf-chapter-page vf-view-enter">
      {/* Horizontal Plain-Text Chapter Tabs */}
      <div className="vf-chapter-tabs-wrap">
        <div className="vf-chapter-tabs" role="tablist" aria-label="Chọn chủ đề">
          {topics.map((topic, index) => {
            const isActive = topic.id === activeTopic.id;
            const num = String(index + 1).padStart(2, "0");
            const shortTitle = TOPIC_SHORT_LABELS[topic.id] || topic.titleVi;
            return (
              <button
                key={topic.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`vf-chapter-tab ${isActive ? "is-active" : ""}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelectTopic(topic.id)}
              >
                <span className="vf-chapter-tab-idx">{num}</span>
                <span>{shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapter Header */}
      <section
        className="vf-chapter-hero"
        aria-label={`Chi tiết chủ đề ${activeTopic.titleVi}`}
      >
        <div className="vf-chapter-hero-main">
          {topicArt && (
            <div className="vf-chapter-art-group">
              <div className="vf-art-frame vf-chapter-hero-art">
                <img
                  src={topicArt.src}
                  alt={topicArt.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              {isFoodTopic && (
                <div className="vf-art-frame vf-chapter-hero-art-accent">
                  <img
                    src={APP_ART.goiCuon.src}
                    alt={APP_ART.goiCuon.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
            </div>
          )}

          <div className="vf-chapter-hero-copy">
            <div className="vf-chapter-kicker">
              Chương {chapterCode} · {activeTopic.cefrFocus || activeTopic.cefrLevel || "A2–B1"}
            </div>
            <h1 className="vf-chapter-heading">{activeTopic.titleVi}</h1>
            {activeTopic.titleEn && (
              <p className="vf-chapter-en">{activeTopic.titleEn}</p>
            )}
            <p className="vf-chapter-summary">
              {activeTopic.descriptionVi || activeTopic.summary || activeTopic.subtitleVi}
            </p>
          </div>
        </div>

        <div className="vf-chapter-side">
          <div>
            <div className="vf-chapter-progress-head">
              <span>Tiến độ chủ đề</span>
              <strong>{mastery}%</strong>
            </div>
            <div className="vf-track">
              <div className="vf-track-fill" style={{ width: `${mastery}%` }} />
            </div>
          </div>

          <div className="vf-chapter-counts">
            {keyPhrases.length} mẫu câu giao tiếp · {topicCardCount} thẻ flashcard
          </div>

          <button
            type="button"
            className="vf-btn vf-btn--primary vf-btn--sm"
            onClick={() => onLaunchGame("listening", activeTopic.id)}
          >
            Luyện nghe chủ đề này
          </button>
        </div>
      </section>

      {/* 2-Column Key Phrases Table */}
      <section aria-labelledby="vf-phrases-heading">
        <div className="vf-section-bar">
          <div>
            <h2 id="vf-phrases-heading" className="vf-section-h2">
              Mẫu câu giao tiếp
            </h2>
            <p className="vf-section-sub">
              Nhấn biểu tượng loa để nghe cách đọc tự nhiên và đối chiếu ghi chú cách dùng.
            </p>
          </div>

          <div className="vf-rate-toggle" role="group" aria-label="Tốc độ đọc">
            {PLAYBACK_RATES.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`vf-rate-btn ${speechRate === option.value ? "is-active" : ""}`}
                onClick={() => setSpeechRate(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="vf-phrases-table">
          {keyPhrases.map((phrase, idx) => {
            const phraseKey = `${activeTopic.id}-phrase-${idx}`;
            const isPlaying = playingKey === phraseKey;
            return (
              <article
                key={phraseKey}
                className={`vf-phrase-cell ${isPlaying ? "is-playing" : ""}`}
              >
                <div style={{ minWidth: 0 }}>
                  <p className="vf-phrase-vi">{phrase.vi}</p>
                  {phrase.en && <p className="vf-phrase-en">{phrase.en}</p>}
                  {phrase.noteVi && <p className="vf-phrase-note">{phrase.noteVi}</p>}
                </div>

                <button
                  type="button"
                  className={`vf-audio-btn ${isPlaying ? "is-playing" : ""}`}
                  onClick={() => handlePlayPhrase(phraseKey, phrase.vi)}
                  aria-label={isPlaying ? `Dừng đọc "${phrase.vi}"` : `Nghe "${phrase.vi}"`}
                  title={isPlaying ? "Dừng phát âm" : "Nghe câu mẫu"}
                >
                  {isPlaying ? <Square size={14} /> : <Volume2 size={16} />}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* Textbook-Style Grammar Note */}
      {grammar && (
        <section aria-labelledby="vf-grammar-heading">
          <div className="vf-grammar-box">
            <span id="vf-grammar-heading" className="vf-grammar-kicker">
              Ghi chú ngữ pháp
            </span>
            <span className="vf-grammar-pattern">{grammar.pattern}</span>

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
                  {playingKey === "grammar-example" ? (
                    <Square size={14} />
                  ) : (
                    <Volume2 size={16} />
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Flat Practice Links */}
      <section aria-labelledby="vf-topic-launch-heading">
        <div className="vf-section-bar">
          <div>
            <h2 id="vf-topic-launch-heading" className="vf-section-h2">
              Thực hành chủ đề này
            </h2>
            <p className="vf-section-sub">
              Mở thẳng bài tập đã lọc sẵn cho “{activeTopic.titleVi}”.
            </p>
          </div>
        </div>

        <div className="vf-practice-strip">
          {practiceLinks.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className="vf-practice-link"
                onClick={item.onClick}
              >
                <Icon size={16} className="vf-practice-link-icon" aria-hidden="true" />
                <span className="vf-practice-link-title">{item.title}</span>
                <span className="vf-practice-link-sub">{item.sub}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default TopicOverview;
