import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flame,
  Lightbulb,
  Puzzle,
  RotateCcw,
  Sparkles,
  Trophy,
  Undo2,
  Volume2,
  X,
  XCircle,
} from "lucide-react";
import { READING_PASSAGES, SENTENCE_BUILDERS, getTopicById } from "../../data";
import { GAME_TYPES, TOPIC_META } from "../../lib/contracts";
import { stopSpeaking } from "../../lib/speech";
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
    regex = new RegExp(`(?<![\\p{L}\\p{M}])(${alternation})(?![\\p{L}\\p{M}])`, "giu");
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
    const canonicalKey = lowerToCanonical.get(matchedText.toLowerCase()) || matchedText;
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

  // Fisher-Yates shuffle ensuring order differs from solved order when possible
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

function buildSentenceRound(allItems, activeTopicId) {
  const safe = Array.isArray(allItems) ? allItems : [];
  if (activeTopicId && activeTopicId !== "all") {
    const filtered = safe.filter((item) => item.topicId === activeTopicId);
    if (filtered.length > 0) return filtered;
  }
  // Balanced pick of 6 items across topics when 'all' is selected
  const byTopic = new Map();
  for (const item of safe) {
    if (!byTopic.has(item.topicId)) {
      byTopic.set(item.topicId, item);
    }
  }
  const picked = Array.from(byTopic.values());
  return picked.length > 0 ? picked.slice(0, 6) : safe.slice(0, 6);
}

export function ReadingVocabGame({
  activeTopicId = "all",
  initialSubMode = "reading",
  onCompleteSession,
  onBack,
}) {
  const { isSpeaking, speak, stopSpeak } = useVietnameseSpeech({ defaultRate: 0.95 });

  const [subMode, setSubMode] = useState(
    initialSubMode === "builder" ? "builder" : "reading"
  );

  // ---------- Sub-mode A: Reading Comprehension ----------
  const passages = useMemo(() => {
    const list = Array.isArray(READING_PASSAGES) ? READING_PASSAGES : [];
    if (activeTopicId && activeTopicId !== "all") {
      const filtered = list.filter((p) => p.topicId === activeTopicId);
      if (filtered.length > 0) return filtered;
    }
    return list;
  }, [activeTopicId]);

  const [passageIndex, setPassageIndex] = useState(0);
  const [selectedGlossaryKey, setSelectedGlossaryKey] = useState(null);
  const [lookedUpWords, setLookedUpWords] = useState([]);
  const [readingAnswers, setReadingAnswers] = useState({});
  const readingStartRef = useRef(Date.now());
  const readingReportedIdRef = useRef(null);

  const currentPassage = passages[passageIndex] || passages[0] || null;

  // ---------- Sub-mode B: Sentence Builder Sprint ----------
  const [builderSeed, setBuilderSeed] = useState(0);
  const sentenceRound = useMemo(
    () => buildSentenceRound(SENTENCE_BUILDERS, activeTopicId),
    [activeTopicId, builderSeed]
  );

  const [builderIndex, setBuilderIndex] = useState(0);
  const [bankTiles, setBankTiles] = useState([]);
  const [placedTiles, setPlacedTiles] = useState([]);
  const [builderStatus, setBuilderStatus] = useState("idle"); // 'idle' | 'correct' | 'wrong' | 'revealed'
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
    setPassageIndex(0);
    setSelectedGlossaryKey(null);
    setLookedUpWords([]);
    setReadingAnswers({});
    readingStartRef.current = Date.now();
    readingReportedIdRef.current = null;

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

  useEffect(() => {
    return () => {
      stopSpeak();
      stopSpeaking();
    };
  }, [stopSpeak]);

  // Reading handlers
  const handleSelectPassage = (idx) => {
    stopSpeak();
    setPassageIndex(idx);
    setSelectedGlossaryKey(null);
    setReadingAnswers({});
    readingStartRef.current = Date.now();
    readingReportedIdRef.current = null;
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
  const placedIds = useMemo(() => new Set(placedTiles.map((t) => t.uid)), [placedTiles]);

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
      if (!builderReportedRef.current && typeof onCompleteSession === "function") {
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
    readingQuestions.length > 0 && readingAnsweredCount === readingQuestions.length;
  const readingCorrectCount = readingQuestions.filter(
    (q) => readingAnswers[q.id] === q.correctIndex
  ).length;

  return (
    <div data-testid="reading-vocab-game">
      {/* Sub-mode switcher */}
      <div className="vf-g-tabs">
        <button
          type="button"
          className={`vf-g-tab ${subMode === "reading" ? "vf-g-tab--active" : ""}`}
          onClick={() => {
            stopSpeak();
            setSubMode("reading");
          }}
          data-testid="reading-tab-passage"
        >
          <BookOpen size={16} /> Đọc Hiểu Thực Tế
        </button>
        <button
          type="button"
          className={`vf-g-tab ${subMode === "builder" ? "vf-g-tab--active" : ""}`}
          onClick={() => {
            stopSpeak();
            setSubMode("builder");
          }}
          data-testid="reading-tab-builder"
        >
          <Puzzle size={16} /> Ghép Câu Phản Xạ
        </button>
      </div>

      {subMode === "reading" ? (
        <div className="vf-g-panel" data-testid="reading-passage-view">
          {passages.length > 1 && (
            <div className="vf-g-topic-bar" style={{ marginBottom: "16px" }}>
              {passages.map((p, idx) => {
                const tMeta = getTopicById?.(p.topicId) || TOPIC_META[p.topicId];
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`vf-g-topic-pill ${
                      idx === passageIndex ? "vf-g-topic-pill--active" : ""
                    }`}
                    onClick={() => handleSelectPassage(idx)}
                  >
                    {tMeta?.titleVi || p.titleVi}
                  </button>
                );
              })}
            </div>
          )}

          {currentPassage && (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                    <span className="vf-g-badge vf-g-badge--amber">
                      {currentPassage.formatLabel || "Bài đọc thực tế"}
                    </span>
                    <span className="vf-g-badge">
                      {getTopicById?.(currentPassage.topicId)?.titleVi ||
                        TOPIC_META[currentPassage.topicId]?.titleVi}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
                    {currentPassage.titleVi}
                  </h3>
                </div>

                <button
                  type="button"
                  className="vf-g-btn vf-g-btn--sm"
                  onClick={() =>
                    isSpeaking
                      ? stopSpeak()
                      : speak((currentPassage.paragraphs || []).join(" "), { rate: 0.92 })
                  }
                >
                  <Volume2 size={15} />
                  {isSpeaking ? "Dừng đọc bài" : "Nghe toàn bài"}
                </button>
              </div>

              <div
                style={{
                  fontSize: "0.82rem",
                  color: "var(--g-text-muted)",
                  marginBottom: "10px",
                }}
              >
                Nhấn vào các từ gạch chân nét đứt để tra nghĩa tiếng Việt, phiên âm IPA và nghe phát âm:
              </div>

              {/* Floating / Inline Glossary Word Card */}
              {selectedGlossaryKey && activeGlossaryEntry && (
                <div className="vf-g-glossary-popover" data-testid="glossary-word-card">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <strong style={{ fontSize: "1.12rem", color: "#ffffff" }}>
                          {selectedGlossaryKey}
                        </strong>
                        {activeGlossaryEntry.pos && (
                          <span className="vf-g-badge vf-g-badge--sky">
                            {activeGlossaryEntry.pos}
                          </span>
                        )}
                        {activeGlossaryEntry.ipa && (
                          <span className="vf-g-mono" style={{ fontSize: "0.84rem", color: "#94a3b8" }}>
                            {activeGlossaryEntry.ipa}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: "8px 0 4px", fontSize: "0.94rem", color: "#f1f5f9" }}>
                        {activeGlossaryEntry.definitionVi}
                      </p>
                      {activeGlossaryEntry.en && (
                        <div style={{ fontSize: "0.84rem", color: "var(--g-text-muted)" }}>
                          Nghĩa tiếng Anh: {activeGlossaryEntry.en}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button
                        type="button"
                        className="vf-g-btn vf-g-btn--primary vf-g-btn--sm"
                        onClick={() => speak(selectedGlossaryKey, { rate: 0.9 })}
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

              {/* Interactive Passage Paragraphs */}
              <div className="vf-g-passage-box" data-testid="reading-passage-text">
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
              </div>

              {/* Comprehension Questions */}
              <div style={{ display: "grid", gap: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: "1.02rem" }}>
                    Câu hỏi đọc hiểu ({readingAnsweredCount}/{readingQuestions.length})
                  </h4>
                  {readingDone && (
                    <span className="vf-g-badge vf-g-badge--emerald vf-g-mono">
                      Đúng {readingCorrectCount}/{readingQuestions.length} câu
                    </span>
                  )}
                </div>

                {readingQuestions.map((q, qIdx) => {
                  const pickedIdx = readingAnswers[q.id];
                  const isAnswered = pickedIdx !== undefined;
                  const isCorrect = isAnswered && pickedIdx === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      style={{
                        padding: "16px",
                        borderRadius: "16px",
                        background: "rgba(11, 16, 27, 0.45)",
                        border: "1px solid var(--g-border)",
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: "12px", fontSize: "0.96rem" }}>
                        Câu {qIdx + 1}: {q.questionVi}
                      </div>

                      <div className="vf-g-options-grid">
                        {(q.options || []).map((optText, oIdx) => {
                          let stateCls = "";
                          if (isAnswered) {
                            if (oIdx === q.correctIndex) stateCls = "vf-g-option-card--correct";
                            else if (oIdx === pickedIdx) stateCls = "vf-g-option-card--wrong";
                            else stateCls = "vf-g-option-card--dim";
                          }
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={isAnswered}
                              onClick={() => handleReadingAnswer(q, oIdx)}
                              className={`vf-g-option-card ${stateCls}`}
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
                            color: isCorrect ? "#a7f3d0" : "#fde68a",
                          }}
                        >
                          <strong>{isCorrect ? "Chính xác: " : "Giải thích: "}</strong>
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
                    <strong style={{ color: "#6ee7b7" }}>
                      Hoàn thành bài đọc! Đạt{" "}
                      {Math.round(
                        (readingCorrectCount / Math.max(1, readingQuestions.length)) * 100
                      )}
                      %
                    </strong>
                    <div style={{ fontSize: "0.84rem", color: "var(--g-text-muted)", marginTop: "2px" }}>
                      Đã lưu tiến độ kỹ năng Đọc. Bạn có thể chuyển sang bài tiếp theo hoặc luyện Ghép Câu Phản Xạ.
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {passageIndex + 1 < passages.length && (
                      <button
                        type="button"
                        className="vf-g-btn vf-g-btn--primary vf-g-btn--sm"
                        onClick={() => handleSelectPassage(passageIndex + 1)}
                      >
                        Bài đọc tiếp theo <ArrowRight size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="vf-g-btn vf-g-btn--amber vf-g-btn--sm"
                      onClick={() => setSubMode("builder")}
                    >
                      <Puzzle size={14} /> Sang Ghép Câu Phản Xạ
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : builderCompleted ? (
        /* Sentence Builder Summary */
        <div className="vf-g-summary" data-testid="builder-summary">
          <div className="vf-g-summary-icon">
            <Trophy size={30} />
          </div>
          <h2 style={{ margin: "0 0 6px", fontSize: "1.45rem" }}>
            Hoàn thành Ghép Câu Phản Xạ!
          </h2>
          <p style={{ margin: 0, color: "var(--g-text-muted)" }}>
            Bạn đã luyện sắp xếp cấu trúc câu tiếng Việt tự nhiên cho trình độ A2–B1.
          </p>

          <div className="vf-g-summary-grid">
            <div className="vf-g-metric-box">
              <div className="vf-g-metric-value vf-g-mono" style={{ color: "#34d399" }}>
                {Math.round((builderScore / Math.max(1, sentenceRound.length)) * 100)}%
              </div>
              <div className="vf-g-metric-label">
                Đúng ngay ({builderScore}/{sentenceRound.length})
              </div>
            </div>
            <div className="vf-g-metric-box">
              <div className="vf-g-metric-value vf-g-mono" style={{ color: "#fbbf24" }}>
                +{builderXp} XP
              </div>
              <div className="vf-g-metric-label">Điểm kinh nghiệm</div>
            </div>
            <div className="vf-g-metric-box">
              <div className="vf-g-metric-value vf-g-mono" style={{ color: "#38bdf8" }}>
                {builderBestCombo}
              </div>
              <div className="vf-g-metric-label">Combo cao nhất</div>
            </div>
          </div>

          <div className="vf-g-summary-actions">
            <button
              type="button"
              className="vf-g-btn vf-g-btn--primary"
              onClick={() => setBuilderSeed((s) => s + 1)}
            >
              <RotateCcw size={16} /> Chơi vòng mới
            </button>
            {onBack && (
              <button type="button" className="vf-g-btn" onClick={onBack}>
                <ArrowLeft size={16} /> Về Trung tâm trò chơi
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Sub-mode B: Sentence Builder Sprint */
        <div className="vf-g-panel" data-testid="sentence-builder-view">
          {currentBuilderItem && (
            <>
              <div className="vf-g-topbar" style={{ marginBottom: "16px" }}>
                <div className="vf-g-topbar-left">
                  <span className="vf-g-badge vf-g-badge--amber">
                    <Puzzle size={14} /> Câu {builderIndex + 1} / {sentenceRound.length}
                  </span>
                  <span className="vf-g-badge">
                    {getTopicById?.(currentBuilderItem.topicId)?.titleVi ||
                      TOPIC_META[currentBuilderItem.topicId]?.titleVi}
                  </span>
                </div>
                <div className="vf-g-topbar-right">
                  <span className="vf-g-badge vf-g-badge--amber vf-g-mono">
                    <Flame size={14} /> Combo {builderCombo}
                  </span>
                  <span className="vf-g-badge vf-g-badge--emerald vf-g-mono">
                    <Sparkles size={14} /> {builderXp} XP
                  </span>
                </div>
              </div>

              <div className="vf-g-progress-track">
                <div
                  className="vf-g-progress-fill"
                  style={{
                    width: `${
                      ((builderIndex + (builderStatus === "correct" || builderStatus === "revealed" ? 1 : 0)) /
                        Math.max(1, sentenceRound.length)) *
                      100
                    }%`,
                  }}
                />
              </div>

              {/* Meaning Prompt */}
              <div className="vf-g-audio-stage" style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--g-text-muted)", marginBottom: "6px" }}>
                  Hãy ghép thành câu tiếng Việt tự nhiên mang nghĩa:
                </div>
                <div style={{ fontSize: "1.16rem", fontWeight: 700, color: "#f8fafc" }}>
                  “{currentBuilderItem.promptEn}”
                </div>

                {currentBuilderItem.hintVi && (
                  <div style={{ marginTop: "12px" }}>
                    <button
                      type="button"
                      className={`vf-g-btn vf-g-btn--sm ${showBuilderHint ? "vf-g-btn--amber" : ""}`}
                      onClick={() => setShowBuilderHint((prev) => !prev)}
                    >
                      <Lightbulb size={14} />{" "}
                      {showBuilderHint ? "Ẩn gợi ý cấu trúc" : "Gợi ý cấu trúc"}
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
                  <span style={{ color: "var(--g-text-muted)", fontSize: "0.88rem" }}>
                    Nhấn vào các thẻ từ bên dưới theo đúng thứ tự để ghép câu...
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

              {/* Shuffled Tile Bank */}
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
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                {builderStatus === "idle" || builderStatus === "wrong" ? (
                  <>
                    <button
                      type="button"
                      className="vf-g-btn vf-g-btn--primary"
                      disabled={placedTiles.length === 0}
                      onClick={handleCheckSentence}
                      data-testid="builder-check-btn"
                    >
                      <CheckCircle2 size={16} /> Kiểm tra câu
                    </button>
                    <button
                      type="button"
                      className="vf-g-btn"
                      disabled={placedTiles.length === 0}
                      onClick={handleUndoTile}
                    >
                      <Undo2 size={15} /> Hoàn tác
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
                        className="vf-g-btn vf-g-btn--amber vf-g-btn--sm"
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
                      onClick={() => speak(currentBuilderItem.targetSentenceVi, { rate: 0.95 })}
                    >
                      <Volume2 size={16} /> Nghe lại câu chuẩn
                    </button>
                    <button
                      type="button"
                      className="vf-g-btn vf-g-btn--emerald"
                      onClick={handleNextBuilder}
                      data-testid="builder-next-btn"
                    >
                      {builderIndex + 1 >= sentenceRound.length
                        ? "Xem tổng kết"
                        : "Câu tiếp theo"}{" "}
                      <ArrowRight size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* Feedback & Grammar Note */}
              {builderStatus === "wrong" && (
                <div className="vf-g-feedback-box vf-g-feedback-box--err">
                  <strong style={{ color: "#fda4af", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <XCircle size={17} /> Thứ tự chưa khớp lắm — bạn thử điều chỉnh lại vị trí các cụm từ nhé!
                  </strong>
                </div>
              )}

              {(builderStatus === "correct" || builderStatus === "revealed") && (
                <div
                  className={`vf-g-feedback-box ${
                    builderStatus === "correct"
                      ? "vf-g-feedback-box--ok"
                      : ""
                  }`}
                  data-testid="builder-feedback"
                >
                  <div style={{ fontWeight: 700, color: builderStatus === "correct" ? "#6ee7b7" : "#fde68a", marginBottom: "6px" }}>
                    {builderStatus === "correct" ? "Chính xác!" : "Câu chuẩn:"}{" "}
                    “{currentBuilderItem.targetSentenceVi}”
                  </div>
                  {currentBuilderItem.grammarNoteVi && (
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "#cbd5e1" }}>
                      <strong>Ghi chú ngữ pháp:</strong> {currentBuilderItem.grammarNoteVi}
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
