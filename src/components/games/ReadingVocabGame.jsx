import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Puzzle,
  RotateCcw,
  Undo2,
  Volume2,
  X,
  XCircle,
} from "lucide-react";
import {
  READING_PASSAGES,
  SENTENCE_BUILDERS,
  TOPICS,
  getTopicById,
} from "../../data";
import { GAME_TYPES, TOPIC_META } from "../../lib/contracts";
import * as speechApi from "../../lib/speech";
import { useVietnameseSpeech } from "../../hooks/useVietnameseSpeech";

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenizeParagraphWithGlossary(paragraph, glossary) {
  if (!paragraph || !glossary || typeof glossary !== "object") {
    return [{ type: "text", value: paragraph || "" }];
  }
  const keys = Object.keys(glossary)
    .filter((k) => k && k.trim().length > 0)
    .sort((a, b) => b.length - a.length);

  if (keys.length === 0) {
    return [{ type: "text", value: paragraph }];
  }

  const lowerToCanonical = new Map();
  for (const key of keys) {
    lowerToCanonical.set(key.toLowerCase(), key);
  }

  const alternation = keys.map(escapeRegex).join("|");
  let regex;
  try {
    regex = new RegExp(
      `(?<![\\p{L}\\p{M}])(${alternation})(?![\\p{L}\\p{M}])`,
      "giu"
    );
  } catch {
    regex = new RegExp(`(${alternation})`, "gi");
  }

  const tokens = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(paragraph)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: paragraph.slice(lastIndex, match.index),
      });
    }
    const matchedText = match[0];
    const canonicalKey =
      lowerToCanonical.get(matchedText.toLowerCase()) || matchedText;
    tokens.push({
      type: "glossary",
      value: matchedText,
      glossaryKey: canonicalKey,
    });
    lastIndex = match.index + matchedText.length;
  }

  if (lastIndex < paragraph.length) {
    tokens.push({
      type: "text",
      value: paragraph.slice(lastIndex),
    });
  }

  return tokens;
}

function normalizeForSentenceCompare(text) {
  return String(text || "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/[.,!?;:"""''()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function createShuffledTiles(item) {
  const chunks = Array.isArray(item?.chunks) ? item.chunks : [];
  const tiles = chunks.map((text, index) => ({
    uid: `${item.id}-tile-${index}`,
    text,
    originalIndex: index,
  }));

  if (tiles.length <= 1) return tiles;

  const shuffled = [...tiles];
  for (let attempt = 0; attempt < 4; attempt += 1) {
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const isSameOrder = shuffled.every((t, idx) => t.originalIndex === idx);
    if (!isSameOrder) break;
  }
  return shuffled;
}

const ALL_BUILDER_ROUND_SIZE = 8;

function shuffleList(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildSentenceRound(
  allItems,
  activeTopicId,
  seed = 0,
  seenIds = new Set()
) {
  const safe = Array.isArray(allItems) ? allItems : [];
  if (safe.length === 0) return [];

  if (activeTopicId && activeTopicId !== "all") {
    const filtered = safe.filter((item) => item.topicId === activeTopicId);
    if (filtered.length > 0) {
      return seed > 0 ? shuffleList(filtered) : filtered;
    }
  }

  const seen = seenIds instanceof Set ? seenIds : new Set();
  const unseenShuffled = shuffleList(safe.filter((item) => !seen.has(item.id)));
  const seenShuffled = shuffleList(safe.filter((item) => seen.has(item.id)));
  const prioritized = [...unseenShuffled, ...seenShuffled];

  // Deal 1 balanced sentence per topic first (prioritizing unseen)
  const byTopic = new Map();
  for (const item of prioritized) {
    if (!byTopic.has(item.topicId)) {
      byTopic.set(item.topicId, item);
    }
  }
  const picked = Array.from(byTopic.values());
  const pickedIds = new Set(picked.map((x) => x.id));

  // Add bonus sentences (up to 8 total) from distinct topics
  const bonusTopics = new Set();
  for (const item of prioritized) {
    if (picked.length >= ALL_BUILDER_ROUND_SIZE) break;
    if (!pickedIds.has(item.id) && !bonusTopics.has(item.topicId)) {
      picked.push(item);
      pickedIds.add(item.id);
      bonusTopics.add(item.topicId);
    }
  }

  for (const item of prioritized) {
    if (picked.length >= ALL_BUILDER_ROUND_SIZE) break;
    if (!pickedIds.has(item.id)) {
      picked.push(item);
      pickedIds.add(item.id);
    }
  }

  return shuffleList(picked);
}

const PASSAGE_SHORT_LABELS = {
  self: "Bản thân",
  food: "Ẩm thực",
  routine: "Sinh hoạt",
  weather: "Thời tiết",
  emotions: "Cảm xúc",
  opinions: "Quan điểm",
};

export function ReadingVocabGame({
  activeTopicId = "all",
  initialSubMode = "reading",
  onCompleteSession,
  onBack,
}) {
  const { isSpeaking, voice, speak, stopSpeak } = useVietnameseSpeech({
    defaultRate: 0.95,
  });

  const [subMode, setSubMode] = useState(
    initialSubMode === "builder" ? "builder" : "reading"
  );

  const topicsList = useMemo(() => {
    if (Array.isArray(TOPICS) && TOPICS.length > 0) return TOPICS;
    return Object.values(TOPIC_META);
  }, []);

  // ---------- Sub-mode A: Reading Comprehension ----------
  const isAllPassagesScope = !activeTopicId || activeTopicId === "all";
  const passages = useMemo(() => {
    const list = Array.isArray(READING_PASSAGES) ? READING_PASSAGES : [];
    if (activeTopicId && activeTopicId !== "all") {
      const filtered = list.filter((p) => p.topicId === activeTopicId);
      if (filtered.length > 0) return filtered;
    }
    return list;
  }, [activeTopicId]);

  const [readingTopicFilter, setReadingTopicFilter] = useState("all");
  const filteredPassages = useMemo(() => {
    if (
      isAllPassagesScope &&
      readingTopicFilter &&
      readingTopicFilter !== "all"
    ) {
      const filtered = passages.filter((p) => p.topicId === readingTopicFilter);
      if (filtered.length > 0) return filtered;
    }
    return passages;
  }, [passages, isAllPassagesScope, readingTopicFilter]);

  const [passageIndex, setPassageIndex] = useState(0);
  const [selectedGlossaryKey, setSelectedGlossaryKey] = useState(null);
  const [lookedUpWords, setLookedUpWords] = useState([]);
  const [readingAnswers, setReadingAnswers] = useState({});
  const readingStartRef = useRef(Date.now());
  const readingReportedIdRef = useRef(null);

  const currentPassage =
    filteredPassages[passageIndex] || filteredPassages[0] || null;

  // ---------- Sub-mode B: Sentence Builder Sprint ----------
  const allBuildersForScope = useMemo(() => {
    const safe = Array.isArray(SENTENCE_BUILDERS) ? SENTENCE_BUILDERS : [];
    if (activeTopicId && activeTopicId !== "all") {
      const filtered = safe.filter((item) => item.topicId === activeTopicId);
      if (filtered.length > 0) return filtered;
    }
    return safe;
  }, [activeTopicId]);

  const [builderSeed, setBuilderSeed] = useState(0);
  const seenBuilderIdsRef = useRef(new Set());
  const prevBuilderTopicRef = useRef(activeTopicId);
  if (prevBuilderTopicRef.current !== activeTopicId) {
    prevBuilderTopicRef.current = activeTopicId;
    seenBuilderIdsRef.current.clear();
  }

  const sentenceRound = useMemo(
    () =>
      buildSentenceRound(
        SENTENCE_BUILDERS,
        activeTopicId,
        builderSeed,
        seenBuilderIdsRef.current
      ),
    [activeTopicId, builderSeed]
  );

  const [builderIndex, setBuilderIndex] = useState(0);
  const [bankTiles, setBankTiles] = useState([]);
  const [placedTiles, setPlacedTiles] = useState([]);
  const [builderStatus, setBuilderStatus] = useState("idle");
  const [showBuilderHint, setShowBuilderHint] = useState(false);
  const [builderScore, setBuilderScore] = useState(0);
  const [builderCombo, setBuilderCombo] = useState(0);
  const [builderBestCombo, setBuilderBestCombo] = useState(0);
  const [builderXp, setBuilderXp] = useState(0);
  const [builderCompleted, setBuilderCompleted] = useState(false);

  const builderStartRef = useRef(Date.now());
  const builderReportedRef = useRef(false);

  const currentBuilderItem = sentenceRound[builderIndex] || null;

  useEffect(() => {
    setReadingTopicFilter("all");
    setPassageIndex(0);
    setSelectedGlossaryKey(null);
    setLookedUpWords([]);
    setReadingAnswers({});
    readingStartRef.current = Date.now();
    readingReportedIdRef.current = null;
  }, [activeTopicId]);

  useEffect(() => {
    setBuilderIndex(0);
    setBuilderScore(0);
    setBuilderCombo(0);
    setBuilderBestCombo(0);
    setBuilderXp(0);
    setBuilderCompleted(false);
    builderStartRef.current = Date.now();
    builderReportedRef.current = false;
  }, [activeTopicId, builderSeed]);

  useEffect(() => {
    if (currentBuilderItem) {
      setBankTiles(createShuffledTiles(currentBuilderItem));
      setPlacedTiles([]);
      setBuilderStatus("idle");
      setShowBuilderHint(false);
    }
  }, [currentBuilderItem]);

  const currentBuilderTargetVi = currentBuilderItem?.targetSentenceVi || "";
  const nextBuilderTargetVi =
    sentenceRound[builderIndex + 1]?.targetSentenceVi || "";

  useEffect(() => {
    if (subMode !== "builder" || builderCompleted) return;
    if (typeof speechApi.prefetchVietnamese !== "function") return;
    const texts = [currentBuilderTargetVi, nextBuilderTargetVi].filter(Boolean);
    if (texts.length > 0) {
      speechApi.prefetchVietnamese(texts, voice ? { voice } : {});
    }
  }, [
    subMode,
    builderCompleted,
    currentBuilderTargetVi,
    nextBuilderTargetVi,
    voice,
  ]);

  useEffect(() => {
    return () => {
      stopSpeak();
      speechApi.stopSpeaking?.();
    };
  }, [stopSpeak]);

  // Reading handlers
  const handleSelectPassage = (idx) => {
    const safeIdx = Math.max(0, Math.min(filteredPassages.length - 1, idx));
    stopSpeak();
    setPassageIndex(safeIdx);
    setSelectedGlossaryKey(null);
    setReadingAnswers({});
    readingStartRef.current = Date.now();
    readingReportedIdRef.current = null;
  };

  const handleSelectReadingTopicFilter = (topicId) => {
    stopSpeak();
    setReadingTopicFilter(topicId);
    setPassageIndex(0);
    setSelectedGlossaryKey(null);
    setReadingAnswers({});
    readingStartRef.current = Date.now();
    readingReportedIdRef.current = null;
  };

  const handleRestartBuilder = () => {
    if (!activeTopicId || activeTopicId === "all") {
      for (const item of sentenceRound) {
        seenBuilderIdsRef.current.add(item.id);
      }
      if (seenBuilderIdsRef.current.size >= SENTENCE_BUILDERS.length) {
        seenBuilderIdsRef.current = new Set(sentenceRound.map((item) => item.id));
      }
    }
    setBuilderSeed((s) => s + 1);
  };

  const handleGlossaryClick = (glossaryKey) => {
    setSelectedGlossaryKey(glossaryKey);
    setLookedUpWords((prev) =>
      prev.includes(glossaryKey) ? prev : [...prev, glossaryKey]
    );
  };

  const handleReadingAnswer = (question, optIdx) => {
    if (!currentPassage || readingAnswers[question.id] !== undefined) return;
    const nextAnswers = { ...readingAnswers, [question.id]: optIdx };
    setReadingAnswers(nextAnswers);

    const totalQ = currentPassage.questions?.length || 0;
    if (
      totalQ > 0 &&
      Object.keys(nextAnswers).length === totalQ &&
      readingReportedIdRef.current !== currentPassage.id
    ) {
      readingReportedIdRef.current = currentPassage.id;
      const correctCount = currentPassage.questions.filter(
        (q) => nextAnswers[q.id] === q.correctIndex
      ).length;
      const accuracy = Math.round((correctCount / totalQ) * 100);
      const durationSec = Math.max(
        1,
        Math.round((Date.now() - readingStartRef.current) / 1000)
      );
      if (typeof onCompleteSession === "function") {
        onCompleteSession({
          gameType: GAME_TYPES.READING_COMPREHENSION,
          topicId: currentPassage.topicId || null,
          skillTags: ["reading", "listening"],
          score: correctCount,
          maxScore: totalQ,
          accuracy,
          durationSec,
          durationSeconds: durationSec,
          details: {
            mode: "reading_passage",
            passageId: currentPassage.id,
            lookedUpWordsCount: lookedUpWords.length,
          },
        });
      }
    }
  };

  // Sentence Builder handlers
  const placedIds = useMemo(
    () => new Set(placedTiles.map((t) => t.uid)),
    [placedTiles]
  );

  const handlePickTile = (tile) => {
    if (builderStatus === "correct" || builderStatus === "revealed") return;
    if (placedIds.has(tile.uid)) return;
    setPlacedTiles((prev) => [...prev, tile]);
    if (builderStatus === "wrong") setBuilderStatus("idle");
  };

  const handleRemovePlacedTile = (uid) => {
    if (builderStatus === "correct" || builderStatus === "revealed") return;
    setPlacedTiles((prev) => prev.filter((t) => t.uid !== uid));
    if (builderStatus === "wrong") setBuilderStatus("idle");
  };

  const handleUndoTile = () => {
    if (builderStatus === "correct" || builderStatus === "revealed") return;
    setPlacedTiles((prev) => prev.slice(0, -1));
    if (builderStatus === "wrong") setBuilderStatus("idle");
  };

  const handleClearTiles = () => {
    if (builderStatus === "correct" || builderStatus === "revealed") return;
    setPlacedTiles([]);
    setBuilderStatus("idle");
  };

  const handleCheckSentence = () => {
    if (!currentBuilderItem || placedTiles.length === 0) return;
    const assembled = placedTiles.map((t) => t.text).join(" ");
    const isExactMatch =
      normalizeForSentenceCompare(assembled) ===
      normalizeForSentenceCompare(currentBuilderItem.targetSentenceVi);

    if (isExactMatch) {
      const nextCombo = builderCombo + 1;
      setBuilderStatus("correct");
      setBuilderScore((prev) => prev + 1);
      setBuilderCombo(nextCombo);
      setBuilderBestCombo((prev) => Math.max(prev, nextCombo));
      setBuilderXp((prev) => prev + 15 + Math.min(nextCombo, 4) * 5);
      speak(currentBuilderItem.targetSentenceVi, { rate: 0.95 });
    } else {
      setBuilderStatus("wrong");
      setBuilderCombo(0);
    }
  };

  const handleRevealSentence = () => {
    if (!currentBuilderItem) return;
    setBuilderStatus("revealed");
    setBuilderCombo(0);
    speak(currentBuilderItem.targetSentenceVi, { rate: 0.92 });
  };

  const handleNextBuilder = () => {
    stopSpeak();
    if (builderIndex + 1 >= sentenceRound.length) {
      setBuilderCompleted(true);
      if (
        !builderReportedRef.current &&
        typeof onCompleteSession === "function"
      ) {
        builderReportedRef.current = true;
        const maxScore = Math.max(1, sentenceRound.length);
        const accuracy = Math.round((builderScore / maxScore) * 100);
        const durationSec = Math.max(
          1,
          Math.round((Date.now() - builderStartRef.current) / 1000)
        );
        onCompleteSession({
          gameType: GAME_TYPES.READING_COMPREHENSION,
          topicId: activeTopicId === "all" ? null : activeTopicId,
          skillTags: ["reading", "listening"],
          score: builderScore,
          maxScore,
          accuracy,
          durationSec,
          durationSeconds: durationSec,
          details: {
            mode: "sentence_builder",
            bestCombo: builderBestCombo,
            xpEarned: builderXp,
          },
        });
      }
      return;
    }
    setBuilderIndex((prev) => prev + 1);
  };

  const activeGlossaryEntry =
    selectedGlossaryKey && currentPassage?.glossary
      ? currentPassage.glossary[selectedGlossaryKey]
      : null;

  const readingQuestions = currentPassage?.questions || [];
  const readingAnsweredCount = Object.keys(readingAnswers).length;
  const readingDone =
    readingQuestions.length > 0 &&
    readingAnsweredCount === readingQuestions.length;
  const readingCorrectCount = readingQuestions.filter(
    (q) => readingAnswers[q.id] === q.correctIndex
  ).length;

  return (
    <div data-testid="reading-vocab-game">
      {/* Sub-mode Underline Tabs */}
      <div className="vf-g-subtabs-row">
        <div className="vf-g-subtabs">
          <button
            type="button"
            className={`vf-g-subtab ${
              subMode === "reading" ? "vf-g-subtab--active" : ""
            }`}
            onClick={() => {
              stopSpeak();
              setSubMode("reading");
            }}
            data-testid="reading-tab-passage"
          >
            <BookOpen size={15} />
            <span>Đọc hiểu</span>{" "}
            <span className="vf-g-tab-count vf-g-mono">({passages.length})</span>
          </button>
          <button
            type="button"
            className={`vf-g-subtab ${
              subMode === "builder" ? "vf-g-subtab--active" : ""
            }`}
            onClick={() => {
              stopSpeak();
              setSubMode("builder");
            }}
            data-testid="reading-tab-builder"
          >
            <Puzzle size={15} />
            <span>Ghép câu</span>{" "}
            <span className="vf-g-tab-count vf-g-mono">
              ({allBuildersForScope.length})
            </span>
          </button>
        </div>
      </div>

      {subMode === "reading" ? (
        <div className="vf-g-panel" data-testid="reading-passage-view">
          {isAllPassagesScope && passages.length > 6 && (
            <div
              className="vf-g-inline-filter"
              role="tablist"
              aria-label="Lọc bài đọc theo chủ đề"
              data-testid="reading-topic-filter"
            >
              <button
                type="button"
                role="tab"
                aria-selected={readingTopicFilter === "all"}
                className={`vf-g-filter-pill ${
                  readingTopicFilter === "all" ? "vf-g-filter-pill--active" : ""
                }`}
                onClick={() => handleSelectReadingTopicFilter("all")}
                data-testid="reading-filter-all"
              >
                <span>Tất cả</span>{" "}
                <span className="vf-g-filter-pill__count vf-g-mono">
                  {passages.length}
                </span>
              </button>
              {topicsList.map((topic) => {
                const count = passages.filter(
                  (p) => p.topicId === topic.id
                ).length;
                const isSelected = readingTopicFilter === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={`vf-g-filter-pill ${
                      isSelected ? "vf-g-filter-pill--active" : ""
                    }`}
                    onClick={() => handleSelectReadingTopicFilter(topic.id)}
                    data-testid={`reading-filter-${topic.id}`}
                  >
                    <span>
                      {PASSAGE_SHORT_LABELS[topic.id] || topic.titleVi}
                    </span>{" "}
                    <span className="vf-g-filter-pill__count vf-g-mono">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredPassages.length > 1 && (
            <div className="vf-g-passage-nav">
              <div className="vf-g-passage-nav-top">
                <div className="vf-g-session-meta-group">
                  <strong
                    className="vf-g-mono"
                    data-testid="reading-passage-counter"
                  >
                    Bài {passageIndex + 1} / {filteredPassages.length}
                  </strong>
                  {currentPassage && (
                    <>
                      <span className="vf-g-dot-sep">·</span>
                      <span style={{ color: "var(--g-text-muted)", fontSize: "0.82rem" }}>
                        {PASSAGE_SHORT_LABELS[currentPassage.topicId] ||
                          getTopicById?.(currentPassage.topicId)?.titleVi ||
                          TOPIC_META[currentPassage.topicId]?.titleVi}
                      </span>
                    </>
                  )}
                </div>

                <div className="vf-g-nav-controls">
                  <button
                    type="button"
                    className="vf-g-btn vf-g-btn--sm"
                    disabled={passageIndex <= 0}
                    onClick={() => handleSelectPassage(passageIndex - 1)}
                    data-testid="reading-passage-prev"
                  >
                    <ArrowLeft size={14} /> Bài trước
                  </button>
                  <button
                    type="button"
                    className="vf-g-btn vf-g-btn--sm"
                    disabled={passageIndex >= filteredPassages.length - 1}
                    onClick={() => handleSelectPassage(passageIndex + 1)}
                    data-testid="reading-passage-next"
                  >
                    Bài tiếp <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div
                className={`vf-g-passage-pills ${
                  filteredPassages.length > 6
                    ? "vf-g-passage-pills--scroll"
                    : ""
                }`}
                role="tablist"
                aria-label="Chọn bài đọc"
                data-testid="reading-passage-tabs"
              >
                {filteredPassages.map((p, idx) => {
                  const pillLabel = isAllPassagesScope
                    ? `Bài ${idx + 1}: ${p.titleVi}`
                    : `Bài ${idx + 1} · ${p.titleVi}`;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="tab"
                      aria-selected={idx === passageIndex}
                      title={p.titleVi}
                      className={`vf-g-passage-pill ${
                        idx === passageIndex ? "vf-g-passage-pill--active" : ""
                      }`}
                      onClick={() => handleSelectPassage(idx)}
                      data-testid={`reading-passage-tab-${idx}`}
                    >
                      <span className="vf-g-passage-pill__text">
                        {pillLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentPassage && (
            <div className="vf-g-editorial-col">
              {/* Editorial Article Header */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "14px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <div className="vf-g-article-meta">
                    {currentPassage.formatLabel || "Bài đọc"}
                    {" · "}
                    {getTopicById?.(currentPassage.topicId)?.titleVi ||
                      TOPIC_META[currentPassage.topicId]?.titleVi}
                  </div>
                  <h3 className="vf-g-article-title">
                    {currentPassage.titleVi}
                  </h3>
                </div>

                <button
                  type="button"
                  className="vf-g-btn vf-g-btn--sm"
                  onClick={() =>
                    isSpeaking
                      ? stopSpeak()
                      : speak((currentPassage.paragraphs || []).join(" "), {
                          rate: 0.92,
                        })
                  }
                >
                  <Volume2 size={14} />
                  {isSpeaking ? "Dừng đọc" : "Nghe toàn bài"}
                </button>
              </div>

              <div
                style={{
                  fontSize: "0.81rem",
                  color: "var(--g-text-muted)",
                  marginBottom: "14px",
                }}
              >
                Nhấn vào từ có gạch chấm bên dưới để xem nghĩa và nghe phát âm.
              </div>

              {/* Clean Dictionary Popover Card */}
              {selectedGlossaryKey && activeGlossaryEntry && (
                <div
                  className="vf-g-glossary-popover"
                  data-testid="glossary-word-card"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <strong
                          className="vf-g-serif"
                          style={{
                            fontSize: "1.26rem",
                            fontWeight: 500,
                            letterSpacing: "-0.02em",
                            color: "var(--g-text)",
                          }}
                        >
                          {selectedGlossaryKey}
                        </strong>
                        {activeGlossaryEntry.pos && (
                          <span
                            style={{
                              fontSize: "0.8rem",
                              fontStyle: "italic",
                              color: "var(--g-text-secondary)",
                            }}
                          >
                            {activeGlossaryEntry.pos}
                          </span>
                        )}
                      </div>
                      <p
                        className="vf-g-serif"
                        style={{
                          margin: "8px 0 4px",
                          fontSize: "0.99rem",
                          fontWeight: 400,
                          color: "var(--g-text)",
                          lineHeight: 1.62,
                        }}
                      >
                        {activeGlossaryEntry.definitionVi}
                      </p>
                      {activeGlossaryEntry.en && (
                        <div
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--g-text-muted)",
                          }}
                        >
                          {activeGlossaryEntry.en}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button
                        type="button"
                        className="vf-g-btn vf-g-btn--primary vf-g-btn--sm"
                        onClick={() =>
                          speak(selectedGlossaryKey, { rate: 0.9 })
                        }
                        data-testid="glossary-speak-btn"
                      >
                        <Volume2 size={14} /> Nghe
                      </button>
                      <button
                        type="button"
                        className="vf-g-btn vf-g-btn--ghost vf-g-btn--sm"
                        onClick={() => setSelectedGlossaryKey(null)}
                        aria-label="Đóng thẻ từ vựng"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Editorial Passage Body */}
              <article
                className="vf-g-passage-box"
                data-testid="reading-passage-text"
              >
                {(currentPassage.paragraphs || []).map((para, pIdx) => {
                  const tokens = tokenizeParagraphWithGlossary(
                    para,
                    currentPassage.glossary
                  );
                  return (
                    <p key={pIdx} className="vf-g-passage-p">
                      {tokens.map((tok, tIdx) =>
                        tok.type === "glossary" ? (
                          <button
                            key={`${pIdx}-${tIdx}`}
                            type="button"
                            className={`vf-g-glossary-word ${
                              selectedGlossaryKey === tok.glossaryKey
                                ? "vf-g-glossary-word--active"
                                : ""
                            }`}
                            onClick={() => handleGlossaryClick(tok.glossaryKey)}
                            data-glossary-term={tok.glossaryKey}
                          >
                            {tok.value}
                          </button>
                        ) : (
                          <React.Fragment key={`${pIdx}-${tIdx}`}>
                            {tok.value}
                          </React.Fragment>
                        )
                      )}
                    </p>
                  );
                })}
              </article>

              {/* Comprehension Questions */}
              <div style={{ display: "grid", gap: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    paddingBottom: "8px",
                    borderBottom: "1px solid var(--g-border)",
                  }}
                >
                  <h4
                    className="vf-g-serif"
                    style={{
                      margin: 0,
                      fontSize: "1.16rem",
                      fontWeight: 500,
                      letterSpacing: "-0.015em",
                    }}
                  >
                    Câu hỏi đọc hiểu{" "}
                    <span
                      className="vf-g-mono"
                      style={{
                        fontSize: "0.84rem",
                        fontWeight: 400,
                        color: "var(--g-text-muted)",
                      }}
                    >
                      ({readingAnsweredCount}/{readingQuestions.length})
                    </span>
                  </h4>
                  {readingDone && (
                    <span className="vf-g-tag vf-g-tag--good vf-g-mono">
                      Đúng {readingCorrectCount}/{readingQuestions.length}
                    </span>
                  )}
                </div>

                {readingQuestions.map((q, qIdx) => {
                  const pickedIdx = readingAnswers[q.id];
                  const isAnswered = pickedIdx !== undefined;
                  const isCorrect = isAnswered && pickedIdx === q.correctIndex;

                  return (
                    <div key={q.id} className="vf-g-reading-q-card">
                      <div className="vf-g-reading-q-title">
                        <span
                          className="vf-g-mono"
                          style={{
                            color: "var(--g-text-muted)",
                            marginRight: "8px",
                            fontSize: "0.84rem",
                            fontWeight: 400,
                          }}
                        >
                          {String(qIdx + 1).padStart(2, "0")}.
                        </span>
                        {q.questionVi}
                      </div>

                      <div className="vf-g-options-list">
                        {(q.options || []).map((optText, oIdx) => {
                          let stateCls = "";
                          if (isAnswered) {
                            if (oIdx === q.correctIndex)
                              stateCls = "vf-g-option-row--correct";
                            else if (oIdx === pickedIdx)
                              stateCls = "vf-g-option-row--wrong";
                            else stateCls = "vf-g-option-row--dim";
                          }
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={isAnswered}
                              onClick={() => handleReadingAnswer(q, oIdx)}
                              className={`vf-g-option-row ${stateCls}`}
                              data-testid={`reading-q-${qIdx}-opt-${oIdx}`}
                            >
                              <span className="vf-g-option-key">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span style={{ flex: 1 }}>{optText}</span>
                            </button>
                          );
                        })}
                      </div>

                      {isAnswered && q.explanationVi && (
                        <div
                          style={{
                            marginTop: "10px",
                            fontSize: "0.86rem",
                            lineHeight: 1.58,
                            color: isCorrect ? "#9ed8bc" : "#e8c891",
                          }}
                        >
                          <strong style={{ fontWeight: 500 }}>
                            {isCorrect ? "Chính xác: " : "Giải thích: "}
                          </strong>
                          {q.explanationVi}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {readingDone && (
                <div
                  className="vf-g-feedback-box vf-g-feedback-box--ok"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                  data-testid="reading-passage-complete"
                >
                  <div>
                    <strong
                      style={{
                        color: "#9ad4b8",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                      }}
                    >
                      Hoàn thành bài đọc · Đạt{" "}
                      {Math.round(
                        (readingCorrectCount /
                          Math.max(1, readingQuestions.length)) *
                          100
                      )}
                      %
                    </strong>
                    <div
                      style={{
                        fontSize: "0.83rem",
                        color: "var(--g-text-secondary)",
                        marginTop: "3px",
                      }}
                    >
                      Tiến độ đọc đã được lưu. Bạn có thể đọc tiếp bài sau hoặc chuyển sang ghép câu.
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {passageIndex + 1 < filteredPassages.length && (
                      <button
                        type="button"
                        className="vf-g-btn vf-g-btn--primary vf-g-btn--sm"
                        onClick={() => handleSelectPassage(passageIndex + 1)}
                      >
                        Bài tiếp theo <ArrowRight size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="vf-g-btn vf-g-btn--sm"
                      onClick={() => setSubMode("builder")}
                    >
                      <Puzzle size={14} /> Sang Ghép câu
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : builderCompleted ? (
        /* Sentence Builder Summary */
        <div className="vf-g-summary" data-testid="builder-summary">
          <div className="vf-g-summary-kicker">Tổng kết ghép câu</div>
          <h2 className="vf-g-summary-title">Hoàn thành phần ghép câu</h2>
          <p className="vf-g-summary-sub">
            Bạn đã ôn lại các cấu trúc sắp xếp câu tiếng Việt tự nhiên ở trình độ A2–B1.
          </p>

          <div className="vf-g-summary-grid">
            <div className="vf-g-metric-box">
              <div
                className="vf-g-metric-value vf-g-mono"
                style={{ color: "var(--g-good)" }}
              >
                {Math.round(
                  (builderScore / Math.max(1, sentenceRound.length)) * 100
                )}
                %
              </div>
              <div className="vf-g-metric-label">
                Đúng ngay ({builderScore}/{sentenceRound.length})
              </div>
            </div>
            <div className="vf-g-metric-box">
              <div className="vf-g-metric-value vf-g-mono">+{builderXp} XP</div>
              <div className="vf-g-metric-label">Điểm luyện tập</div>
            </div>
            <div className="vf-g-metric-box">
              <div className="vf-g-metric-value vf-g-mono">
                {builderBestCombo}
              </div>
              <div className="vf-g-metric-label">Chuỗi cao nhất</div>
            </div>
          </div>

          <div className="vf-g-summary-actions">
            <button
              type="button"
              className="vf-g-btn vf-g-btn--primary"
              onClick={handleRestartBuilder}
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
      ) : (
        /* Sub-mode B: Sentence Builder Sprint */
        <div className="vf-g-panel" data-testid="sentence-builder-view">
          {currentBuilderItem && (
            <>
              <div className="vf-g-session-meta">
                <div className="vf-g-session-meta-group">
                  <strong className="vf-g-mono">
                    Câu {builderIndex + 1} / {sentenceRound.length}
                  </strong>
                  <span className="vf-g-dot-sep">·</span>
                  <span>
                    {getTopicById?.(currentBuilderItem.topicId)?.titleVi ||
                      TOPIC_META[currentBuilderItem.topicId]?.titleVi}
                  </span>
                </div>
                <div className="vf-g-session-meta-group vf-g-mono">
                  <span>Chuỗi {builderCombo}</span>
                  <span className="vf-g-dot-sep">·</span>
                  <span>{builderXp} XP</span>
                </div>
              </div>

              <div className="vf-g-progress-track">
                <div
                  className="vf-g-progress-fill"
                  style={{
                    width: `${
                      ((builderIndex +
                        (builderStatus === "correct" ||
                        builderStatus === "revealed"
                          ? 1
                          : 0)) /
                        Math.max(1, sentenceRound.length)) *
                      100
                    }%`,
                  }}
                />
              </div>

              {/* Meaning Prompt */}
              <div className="vf-g-audio-stage" style={{ marginBottom: "18px" }}>
                <div
                  style={{
                    fontSize: "0.79rem",
                    color: "var(--g-text-muted)",
                    marginBottom: "6px",
                  }}
                >
                  Ghép thành câu tiếng Việt tự nhiên mang nghĩa
                </div>
                <div
                  className="vf-g-serif"
                  style={{
                    fontSize: "1.26rem",
                    fontWeight: 400,
                    letterSpacing: "-0.015em",
                    color: "var(--g-text)",
                    lineHeight: 1.48,
                  }}
                >
                  “{currentBuilderItem.promptEn}”
                </div>

                {currentBuilderItem.hintVi && (
                  <div style={{ marginTop: "12px" }}>
                    <button
                      type="button"
                      className={`vf-g-btn vf-g-btn--sm ${
                        showBuilderHint ? "vf-g-btn--warn" : "vf-g-btn--ghost"
                      }`}
                      onClick={() => setShowBuilderHint((prev) => !prev)}
                    >
                      <Lightbulb size={14} />{" "}
                      {showBuilderHint ? "Ẩn gợi ý" : "Gợi ý cấu trúc"}
                    </button>
                    {showBuilderHint && (
                      <div className="vf-g-drawer vf-g-drawer--hint">
                        {currentBuilderItem.hintVi}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Construction Tray */}
              <div
                className={`vf-g-tray ${
                  builderStatus === "correct"
                    ? "vf-g-tray--correct"
                    : builderStatus === "wrong"
                      ? "vf-g-tray--wrong"
                      : ""
                }`}
                data-testid="builder-tray"
              >
                {placedTiles.length === 0 ? (
                  <span
                    style={{
                      color: "var(--g-text-muted)",
                      fontSize: "0.87rem",
                    }}
                  >
                    Chọn các thẻ từ bên dưới theo đúng trật tự để tạo thành câu...
                  </span>
                ) : (
                  placedTiles.map((tile) => (
                    <button
                      key={tile.uid}
                      type="button"
                      className="vf-g-tile vf-g-tile--placed"
                      onClick={() => handleRemovePlacedTile(tile.uid)}
                    >
                      {tile.text}
                    </button>
                  ))
                )}
              </div>

              {/* Matte Physical Tile Bank */}
              <div className="vf-g-tile-bank" data-testid="builder-bank">
                {bankTiles.map((tile) => {
                  const isUsed = placedIds.has(tile.uid);
                  return (
                    <button
                      key={tile.uid}
                      type="button"
                      disabled={isUsed}
                      className={`vf-g-tile ${isUsed ? "vf-g-tile--used" : ""}`}
                      onClick={() => handlePickTile(tile)}
                    >
                      {tile.text}
                    </button>
                  );
                })}
              </div>

              {/* Action Controls */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                {builderStatus === "idle" || builderStatus === "wrong" ? (
                  <>
                    <button
                      type="button"
                      className="vf-g-btn vf-g-btn--primary"
                      disabled={placedTiles.length === 0}
                      onClick={handleCheckSentence}
                      data-testid="builder-check-btn"
                    >
                      <CheckCircle2 size={15} /> Kiểm tra câu
                    </button>
                    <button
                      type="button"
                      className="vf-g-btn"
                      disabled={placedTiles.length === 0}
                      onClick={handleUndoTile}
                    >
                      <Undo2 size={14} /> Hoàn tác
                    </button>
                    <button
                      type="button"
                      className="vf-g-btn vf-g-btn--ghost"
                      disabled={placedTiles.length === 0}
                      onClick={handleClearTiles}
                    >
                      Xóa hết
                    </button>
                    {builderStatus === "wrong" && (
                      <button
                        type="button"
                        className="vf-g-btn vf-g-btn--warn vf-g-btn--sm"
                        onClick={handleRevealSentence}
                      >
                        Xem đáp án chuẩn
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="vf-g-btn"
                      onClick={() =>
                        speak(currentBuilderItem.targetSentenceVi, {
                          rate: 0.95,
                        })
                      }
                    >
                      <Volume2 size={15} /> Nghe lại câu chuẩn
                    </button>
                    <button
                      type="button"
                      className="vf-g-btn vf-g-btn--primary"
                      onClick={handleNextBuilder}
                      data-testid="builder-next-btn"
                    >
                      {builderIndex + 1 >= sentenceRound.length
                        ? "Xem tổng kết"
                        : "Câu tiếp theo"}{" "}
                      <ArrowRight size={15} />
                    </button>
                  </>
                )}
              </div>

              {/* Feedback & Grammar Note */}
              {builderStatus === "wrong" && (
                <div className="vf-g-feedback-box vf-g-feedback-box--err">
                  <strong
                    style={{
                      color: "#eea7a7",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                    }}
                  >
                    <XCircle size={16} /> Trật tự chưa đúng — thử đổi lại vị trí các cụm từ nhé.
                  </strong>
                </div>
              )}

              {(builderStatus === "correct" ||
                builderStatus === "revealed") && (
                <div
                  className={`vf-g-feedback-box ${
                    builderStatus === "correct" ? "vf-g-feedback-box--ok" : ""
                  }`}
                  data-testid="builder-feedback"
                >
                  <div
                    style={{
                      marginBottom: "6px",
                      lineHeight: 1.55,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                        color:
                          builderStatus === "correct" ? "#9ad4b8" : "#e9c78f",
                      }}
                    >
                      {builderStatus === "correct"
                        ? "Chính xác: "
                        : "Câu chuẩn: "}
                    </span>
                    <span
                      className="vf-g-serif"
                      style={{
                        fontSize: "1.06rem",
                        fontWeight: 400,
                        color: "var(--g-text)",
                      }}
                    >
                      “{currentBuilderItem.targetSentenceVi}”
                    </span>
                  </div>
                  {currentBuilderItem.grammarNoteVi && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.88rem",
                        color: "var(--g-text-secondary)",
                        lineHeight: 1.58,
                      }}
                    >
                      <strong style={{ fontWeight: 500 }}>
                        Ghi chú ngữ pháp:
                      </strong>{" "}
                      {currentBuilderItem.grammarNoteVi}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ReadingVocabGame;
