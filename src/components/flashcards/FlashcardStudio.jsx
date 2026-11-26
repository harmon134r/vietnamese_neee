import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ListChecks,
  Plus,
  Search,
  Shuffle,
} from "lucide-react";
import { MASTERY_LEVELS, TOPIC_IDS, TOPIC_META } from "../../lib/contracts.js";
import { FlashcardStage } from "./FlashcardStage.jsx";
import { FlashcardCreator } from "./FlashcardCreator.jsx";
import { FlashcardDeckManager } from "./FlashcardDeckManager.jsx";
import "./flashcards.css";

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function FlashcardStudio({
  decks = [],
  activeDeckId,
  onSelectDeck,
  onCreateDeck,
  onUpdateDeck,
  onDeleteDeck,
  onAddCard,
  onAddCardsBulk,
  onUpdateCard,
  onDeleteCard,
  onUpdateMastery,
  onRecordPractice,
  initialTopicFilter = "all",
  initialTab = "study",
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // "study" | "create" | "manage"
  const [createNewDeckMode, setCreateNewDeckMode] = useState(false);
  const [topicFilter, setTopicFilter] = useState(initialTopicFilter || "all");
  const [masteryFilter, setMasteryFilter] = useState("all"); // "all" | "review" | "new" | "mastered"
  const [searchQuery, setSearchQuery] = useState("");
  const [shuffledOrder, setShuffledOrder] = useState(null); // string[] | null
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setTopicFilter(initialTopicFilter || "all");
  }, [initialTopicFilter]);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Filter decks by topic filter
  const visibleDecks = useMemo(() => {
    if (!topicFilter || topicFilter === "all") return decks;
    return decks.filter((d) => d.topicId === topicFilter);
  }, [decks, topicFilter]);

  // Resolve currently active deck
  const activeDeck = useMemo(() => {
    if (visibleDecks.length === 0) return decks[0] || null;
    const found = visibleDecks.find((d) => d.id === activeDeckId);
    return found || visibleDecks[0];
  }, [visibleDecks, decks, activeDeckId]);

  // Keep parent activeDeckId synced when topic filter narrows deck list
  useEffect(() => {
    if (activeDeck && activeDeck.id !== activeDeckId) {
      onSelectDeck?.(activeDeck.id);
    }
  }, [activeDeck, activeDeckId, onSelectDeck]);

  // Reset shuffle & index when switching deck
  useEffect(() => {
    setShuffledOrder(null);
    setCurrentIndex(0);
  }, [activeDeck?.id]);

  const allDeckCards = useMemo(() => activeDeck?.cards || [], [activeDeck]);

  // Compute mastery statistics for active deck
  const stats = useMemo(() => {
    let mastered = 0;
    let review = 0;
    let fresh = 0;
    for (const c of allDeckCards) {
      const lvl = c.masteryLevel || 0;
      if (lvl >= MASTERY_LEVELS.STRONG) mastered += 1;
      else if (lvl >= MASTERY_LEVELS.REVIEW) review += 1;
      else fresh += 1;
    }
    const total = allDeckCards.length;
    return {
      total,
      mastered,
      review,
      fresh,
      masteredPct: total ? Math.round((mastered / total) * 100) : 0,
      reviewPct: total ? Math.round((review / total) * 100) : 0,
    };
  }, [allDeckCards]);

  // Apply mastery filter, search query, and optional shuffle order
  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase("vi");
    let list = allDeckCards.filter((card) => {
      const lvl = card.masteryLevel || 0;
      if (masteryFilter === "mastered" && lvl < MASTERY_LEVELS.STRONG) return false;
      if (masteryFilter === "review" && (lvl < MASTERY_LEVELS.REVIEW || lvl >= MASTERY_LEVELS.STRONG)) {
        return false;
      }
      if (masteryFilter === "new" && lvl !== MASTERY_LEVELS.NEW) return false;

      if (q) {
        const hay = `${card.frontVi} ${card.definition} ${card.exampleVi} ${card.pos}`.toLocaleLowerCase("vi");
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (shuffledOrder && shuffledOrder.length > 0) {
      const rank = new Map(shuffledOrder.map((id, idx) => [id, idx]));
      list = [...list].sort((a, b) => {
        const ra = rank.has(a.id) ? rank.get(a.id) : Number.MAX_SAFE_INTEGER;
        const rb = rank.has(b.id) ? rank.get(b.id) : Number.MAX_SAFE_INTEGER;
        return ra - rb;
      });
    }

    return list;
  }, [allDeckCards, masteryFilter, searchQuery, shuffledOrder]);

  // Clamp currentIndex safely when filteredCards shrinks
  useEffect(() => {
    if (filteredCards.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= filteredCards.length) {
      setCurrentIndex(filteredCards.length - 1);
    }
  }, [filteredCards.length, currentIndex]);

  const handleToggleShuffle = useCallback(() => {
    if (shuffledOrder) {
      setShuffledOrder(null);
      setCurrentIndex(0);
    } else {
      setShuffledOrder(shuffleArray(allDeckCards.map((c) => c.id)));
      setCurrentIndex(0);
    }
  }, [shuffledOrder, allDeckCards]);

  const handleOpenCreate = useCallback((newDeck = false) => {
    setCreateNewDeckMode(newDeck);
    setActiveTab("create");
  }, []);

  const handleCreatedAndStudy = useCallback(
    (deckId, startIndex = 0) => {
      if (deckId) onSelectDeck?.(deckId);
      setTopicFilter("all");
      setMasteryFilter("all");
      setSearchQuery("");
      setShuffledOrder(null);
      setCreateNewDeckMode(false);
      setActiveTab("study");
      setCurrentIndex(Math.max(0, startIndex));
    },
    [onSelectDeck]
  );

  return (
    <section className="fc-studio" aria-label="Flashcard Studio Tiếng Việt">
      {/* Studio Top Header */}
      <div className="fc-header">
        <div className="fc-header-copy">
          <span className="fc-eyebrow">Flashcard Studio · Luyện Phát Âm &amp; Từ Vựng</span>
          <h2>{activeDeck ? activeDeck.title : "Bộ thẻ tiếng Việt của bạn"}</h2>
          <p>
            Lật thẻ, nghe giọng đọc tiếng Việt tự nhiên, bấm micro chấm phát âm ngay trên thẻ hoặc tự tạo bộ thẻ từ từ vựng của bạn.
          </p>
        </div>

        <div className="fc-mode-switcher" role="tablist" aria-label="Chế độ Flashcard Studio">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "study"}
            className={`fc-mode-tab ${activeTab === "study" ? "is-active" : ""}`}
            onClick={() => setActiveTab("study")}
          >
            <BookOpen size={16} />
            <span>Học thẻ</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "create"}
            className={`fc-mode-tab ${activeTab === "create" ? "is-active" : ""}`}
            onClick={() => handleOpenCreate(false)}
          >
            <Plus size={16} />
            <span>Tạo thẻ</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "manage"}
            className={`fc-mode-tab ${activeTab === "manage" ? "is-active" : ""}`}
            onClick={() => setActiveTab("manage")}
          >
            <ListChecks size={16} />
            <span>Quản lý ({allDeckCards.length})</span>
          </button>
        </div>
      </div>

      {/* Deck Selector, Mastery Stats & Filters */}
      <div className="fc-toolbar">
        <div className="fc-deck-strip" role="listbox" aria-label="Danh sách bộ thẻ">
          {visibleDecks.map((deck) => {
            const isSelected = activeDeck?.id === deck.id;
            return (
              <button
                key={deck.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`fc-deck-pill ${isSelected ? "is-active" : ""}`}
                onClick={() => {
                  onSelectDeck?.(deck.id);
                  if (activeTab === "create") setCreateNewDeckMode(false);
                }}
              >
                <span
                  className="fc-deck-dot"
                  style={{ background: deck.color || "#38bdf8" }}
                  aria-hidden="true"
                />
                <span>{deck.title}</span>
                <span className="fc-deck-count">{deck.cards?.length || 0}</span>
              </button>
            );
          })}

          <button
            type="button"
            className="fc-new-deck-pill"
            onClick={() => handleOpenCreate(true)}
          >
            <Plus size={14} />
            <span>Bộ thẻ mới</span>
          </button>
        </div>

        {/* Mastery Progress Track */}
        <div className="fc-mastery-bar">
          <div className="fc-mastery-track" aria-label="Tiến độ ghi nhớ bộ thẻ">
            <div
              className="fc-mastery-fill-mastered"
              style={{ width: `${stats.masteredPct}%` }}
            />
            <div
              className="fc-mastery-fill-review"
              style={{ width: `${stats.reviewPct}%` }}
            />
          </div>
          <span className="fc-mastery-caption">
            <strong>{stats.mastered}</strong>/{stats.total} đã thuộc ({stats.masteredPct}%)
          </span>
        </div>

        {/* Filters + Search + Shuffle (shown in Study & Manage tabs) */}
        {activeTab !== "create" && (
          <div className="fc-toolbar-meta">
            <div className="fc-filter-group">
              <button
                type="button"
                className={`fc-filter-chip ${masteryFilter === "all" ? "is-active" : ""}`}
                onClick={() => {
                  setMasteryFilter("all");
                  setCurrentIndex(0);
                }}
              >
                Tất cả ({stats.total})
              </button>
              <button
                type="button"
                className={`fc-filter-chip tone-review ${masteryFilter === "review" ? "is-active" : ""}`}
                onClick={() => {
                  setMasteryFilter("review");
                  setCurrentIndex(0);
                }}
              >
                Cần ôn ({stats.review})
              </button>
              <button
                type="button"
                className={`fc-filter-chip ${masteryFilter === "new" ? "is-active" : ""}`}
                onClick={() => {
                  setMasteryFilter("new");
                  setCurrentIndex(0);
                }}
              >
                Chưa học ({stats.fresh})
              </button>
              <button
                type="button"
                className={`fc-filter-chip tone-mastered ${masteryFilter === "mastered" ? "is-active" : ""}`}
                onClick={() => {
                  setMasteryFilter("mastered");
                  setCurrentIndex(0);
                }}
              >
                Đã thuộc ({stats.mastered})
              </button>
            </div>

            <div className="fc-toolbar-actions">
              <select
                className="fc-select"
                style={{ width: "auto", padding: "6px 10px", fontSize: "0.78rem", height: 34 }}
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                aria-label="Lọc bộ thẻ theo chủ đề"
              >
                <option value="all">Tất cả chủ đề</option>
                {TOPIC_IDS.map((tid) => (
                  <option key={tid} value={tid}>
                    {TOPIC_META[tid].titleVi}
                  </option>
                ))}
              </select>

              <div className="fc-search-box">
                <Search size={14} />
                <input
                  type="search"
                  className="fc-search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentIndex(0);
                  }}
                  placeholder="Tìm từ, nghĩa..."
                  aria-label="Tìm kiếm flashcard"
                />
              </div>

              <button
                type="button"
                className={`fc-action-btn ${shuffledOrder ? "is-active" : ""}`}
                onClick={handleToggleShuffle}
                disabled={allDeckCards.length < 2}
                title={shuffledOrder ? "Đang trộn thẻ — bấm để về thứ tự gốc" : "Trộn ngẫu nhiên thứ tự thẻ"}
              >
                <Shuffle size={14} />
                <span>{shuffledOrder ? "Đang trộn" : "Trộn thẻ"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Tab */}
      {activeTab === "study" && (
        <FlashcardStage
          cards={filteredCards}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          onUpdateMastery={onUpdateMastery}
          onRecordPractice={onRecordPractice}
          onOpenCreate={() => handleOpenCreate(false)}
        />
      )}

      {activeTab === "create" && (
        <FlashcardCreator
          decks={decks}
          activeDeckId={activeDeck?.id || ""}
          defaultNewDeck={createNewDeckMode}
          onCreateDeck={onCreateDeck}
          onAddCard={onAddCard}
          onAddCardsBulk={onAddCardsBulk}
          onCreatedAndStudy={handleCreatedAndStudy}
        />
      )}

      {activeTab === "manage" && (
        <FlashcardDeckManager
          deck={activeDeck}
          cards={filteredCards}
          onUpdateDeck={onUpdateDeck}
          onDeleteDeck={onDeleteDeck}
          onUpdateCard={onUpdateCard}
          onDeleteCard={onDeleteCard}
          onOpenCreate={() => handleOpenCreate(false)}
        />
      )}
    </section>
  );
}

export default FlashcardStudio;
