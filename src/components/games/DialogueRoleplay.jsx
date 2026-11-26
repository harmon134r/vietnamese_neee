import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lightbulb,
  MessageSquare,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { DIALOGUE_SCENARIOS, getTopicById } from "../../data";
import { GAME_TYPES, TOPIC_META } from "../../lib/contracts";
import {
  matchDialogueIntent,
  scoreVietnamesePronunciation,
} from "../../lib/pronunciation";
import { stopSpeaking } from "../../lib/speech";
import { useVietnameseSpeech } from "../../hooks/useVietnameseSpeech";

const MOOD_LABELS = {
  analytical: "Phân tích",
  anxious: "Hơi lo lắng",
  attentive: "Lắng nghe",
  chatty: "Cởi mở",
  cheerful: "Vui vẻ",
  concerned: "Quan tâm",
  curious: "Tò mò",
  down: "Hơi chùng xuống",
  engaged: "Hào hứng",
  enthusiastic: "Nhiệt tình",
  friendly: "Thân thiện",
  playful: "Hóm hỉnh",
  practical: "Thực tế",
  relieved: "Nhẹ nhõm",
  thoughtful: "Sâu sắc",
  tired: "Hơi mệt",
  upbeat: "Tích cực",
  warm: "Ấm áp",
  welcoming: "Niềm nở",
};

function formatMood(mood) {
  if (!mood) return "";
  return MOOD_LABELS[String(mood).toLowerCase()] || mood;
}

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "VN";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function DialogueRoleplay({
  activeTopicId = "all",
  onCompleteSession,
  onBack,
}) {
  const {
    speak,
    stopSpeak,
    isListening,
    sttSupported,
    interimTranscript,
    finalTranscript,
    micLevel,
    startListening,
    stopListening,
    resetTranscript,
    speechError,
  } = useVietnameseSpeech({ defaultRate: 0.98 });

  const allScenarios = useMemo(
    () => (Array.isArray(DIALOGUE_SCENARIOS) ? DIALOGUE_SCENARIOS : []),
    []
  );

  const [showAllTopics, setShowAllTopics] = useState(false);
  const visibleScenarios = useMemo(() => {
    if (showAllTopics || !activeTopicId || activeTopicId === "all") {
      return allScenarios;
    }
    const filtered = allScenarios.filter((s) => s.topicId === activeTopicId);
    return filtered.length > 0 ? filtered : allScenarios;
  }, [allScenarios, activeTopicId, showAllTopics]);

  const [activeScenario, setActiveScenario] = useState(null);
  const [currentTurnId, setCurrentTurnId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [composerMode, setComposerMode] = useState("speak"); // 'speak' | 'guided'
  const [autoSpeakNpc, setAutoSpeakNpc] = useState(true);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [typedReply, setTypedReply] = useState("");
  const [turnRecords, setTurnRecords] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [targetedOption, setTargetedOption] = useState(null);

  const startTimeRef = useRef(Date.now());
  const reportedRef = useRef(false);
  const chatEndRef = useRef(null);
  const voicePendingRef = useRef(null); // { mode: 'free' | 'option', option?: object }
  const chainTimerRef = useRef(null);

  const currentTurn = useMemo(() => {
    if (!activeScenario || !currentTurnId) return null;
    return (activeScenario.turns || []).find((t) => t.id === currentTurnId) || null;
  }, [activeScenario, currentTurnId]);

  const currentTurnNumber = useMemo(() => {
    if (!activeScenario || !currentTurnId) return 0;
    const idx = (activeScenario.turns || []).findIndex((t) => t.id === currentTurnId);
    return idx >= 0 ? idx + 1 : 0;
  }, [activeScenario, currentTurnId]);

  useEffect(() => {
    setShowAllTopics(false);
  }, [activeTopicId]);

  useEffect(() => {
    if (chatEndRef.current && typeof chatEndRef.current.scrollIntoView === "function") {
      chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages.length]);

  useEffect(() => {
    return () => {
      if (chainTimerRef.current) clearTimeout(chainTimerRef.current);
      stopSpeak();
      stopSpeaking();
      stopListening();
    };
  }, [stopSpeak, stopListening]);

  const speakChain = async (lines = []) => {
    if (!autoSpeakNpc) return;
    const valid = lines.filter((l) => typeof l === "string" && l.trim());
    if (valid.length === 0) return;
    if (chainTimerRef.current) clearTimeout(chainTimerRef.current);
    try {
      await speak(valid[0], { rate: 0.98 });
      if (valid[1]) {
        chainTimerRef.current = setTimeout(() => {
          speak(valid[1], { rate: 0.98 });
        }, 350);
      }
    } catch {
      // ignore interrupted speech
    }
  };

  const startScenario = (scenario) => {
    if (!scenario) return;
    if (chainTimerRef.current) clearTimeout(chainTimerRef.current);
    stopSpeak();
    stopListening();
    resetTranscript();

    const firstTurn = scenario.turns?.[0] || null;
    const initialMessages = [];

    if (
      scenario.openingLineVi &&
      firstTurn &&
      scenario.openingLineVi.trim() !== firstTurn.npcTextVi?.trim()
    ) {
      initialMessages.push({
        id: `open-${scenario.id}`,
        sender: "npc",
        textVi: scenario.openingLineVi,
        textEn: "",
        mood: "Mở đầu",
      });
    }

    if (firstTurn) {
      initialMessages.push({
        id: `turn-${firstTurn.id}`,
        sender: "npc",
        textVi: firstTurn.npcTextVi,
        textEn: firstTurn.npcEn || "",
        mood: firstTurn.mood || "",
      });
    }

    setActiveScenario(scenario);
    setCurrentTurnId(firstTurn ? firstTurn.id : null);
    setMessages(initialMessages);
    setTurnRecords([]);
    setTypedReply("");
    setTargetedOption(null);
    setCompleted(!firstTurn);
    startTimeRef.current = Date.now();
    reportedRef.current = false;

    if (firstTurn && autoSpeakNpc) {
      speakChain([firstTurn.npcTextVi]);
    }
  };

  const finishDialogue = (scenario, finalRecords) => {
    setCompleted(true);
    setCurrentTurnId(null);

    if (!reportedRef.current && typeof onCompleteSession === "function") {
      reportedRef.current = true;
      const count = Math.max(1, finalRecords.length);
      const avgScore = Math.round(
        finalRecords.reduce((s, r) => s + r.score, 0) / count
      );
      const avgTone = Math.round(
        finalRecords.reduce((s, r) => s + r.toneAccuracy, 0) / count
      );
      const voiceTurns = finalRecords.filter((r) => r.via === "voice").length;
      const durationSec = Math.max(
        1,
        Math.round((Date.now() - startTimeRef.current) / 1000)
      );
      const xpEarned = Math.max(25, Math.round(finalRecords.length * 14 + avgScore * 0.35));

      onCompleteSession({
        gameType: GAME_TYPES.DIALOGUE_BUILDER,
        topicId: scenario.topicId || null,
        skillTags: ["speaking", "listening", "pronunciation"],
        score: avgScore,
        maxScore: 100,
        accuracy: avgScore,
        durationSec,
        durationSeconds: durationSec,
        details: {
          scenarioId: scenario.id,
          turnsCompleted: finalRecords.length,
          avgTone,
          voiceTurns,
          xpEarned,
        },
      });
    }
  };

  const commitLearnerResponse = ({
    spokenText,
    matchedOption,
    evaluation,
    via,
  }) => {
    if (!activeScenario || !currentTurn || !matchedOption) return;

    const score = evaluation?.score ?? 90;
    const toneAccuracy = evaluation?.toneAccuracy ?? score;
    const record = {
      turnId: currentTurn.id,
      optionId: matchedOption.id,
      spokenText,
      targetText: matchedOption.textVi,
      score,
      toneAccuracy,
      feedbackVi: evaluation?.feedbackVi || "",
      via,
    };

    const nextRecords = [...turnRecords, record];
    setTurnRecords(nextRecords);

    const nextMessages = [
      {
        id: `user-${currentTurn.id}-${Date.now()}`,
        sender: "user",
        textVi: spokenText,
        matchedLabel: matchedOption.labelVi,
        score,
        toneAccuracy,
        feedbackVi: evaluation?.feedbackVi || "",
        via,
      },
    ];

    const audioQueue = [];

    if (matchedOption.npcReactionVi) {
      nextMessages.push({
        id: `react-${currentTurn.id}-${Date.now()}`,
        sender: "reaction",
        textVi: matchedOption.npcReactionVi,
      });
      audioQueue.push(matchedOption.npcReactionVi);
    }

    const nextTurn = matchedOption.nextTurnId
      ? (activeScenario.turns || []).find((t) => t.id === matchedOption.nextTurnId) || null
      : null;

    if (nextTurn) {
      nextMessages.push({
        id: `turn-${nextTurn.id}-${Date.now()}`,
        sender: "npc",
        textVi: nextTurn.npcTextVi,
        textEn: nextTurn.npcEn || "",
        mood: nextTurn.mood || "",
      });
      audioQueue.push(nextTurn.npcTextVi);
      setMessages((prev) => [...prev, ...nextMessages]);
      setCurrentTurnId(nextTurn.id);
      setTypedReply("");
      setTargetedOption(null);
      speakChain(audioQueue);
    } else {
      setMessages((prev) => [...prev, ...nextMessages]);
      setTypedReply("");
      setTargetedOption(null);
      speakChain(audioQueue);
      finishDialogue(activeScenario, nextRecords);
    }
  };

  const processSpokenTranscript = (transcript, forcedOption = null, via = "voice") => {
    if (!currentTurn || !transcript?.trim()) return;
    const options = currentTurn.expectedResponses || [];
    if (options.length === 0) return;

    let matchedOption = forcedOption;
    let evaluation = null;

    if (matchedOption) {
      evaluation = scoreVietnamesePronunciation(matchedOption.textVi, transcript);
    } else {
      const intentResult = matchDialogueIntent(transcript, options);
      matchedOption =
        options.find((o) => o.id === intentResult?.bestOptionId) || options[0];
      evaluation =
        intentResult?.evaluation ||
        scoreVietnamesePronunciation(matchedOption.textVi, transcript);
    }

    commitLearnerResponse({
      spokenText: transcript.trim(),
      matchedOption,
      evaluation,
      via,
    });
  };

  // Fallback listener if hook exposes transcript via finalTranscript state
  useEffect(() => {
    if (!finalTranscript || !voicePendingRef.current) return;
    const pending = voicePendingRef.current;
    voicePendingRef.current = null;
    processSpokenTranscript(finalTranscript, pending.option || null, "voice");
  }, [finalTranscript]);

  const handleStartFreeSpeak = () => {
    if (!currentTurn) return;
    if (isListening) {
      stopListening();
      return;
    }
    stopSpeak();
    resetTranscript();
    setTargetedOption(null);
    voicePendingRef.current = { mode: "free", option: null };
    startListening({
      maxDurationMs: 12000,
      onResult: (transcript) => {
        if (!transcript) return;
        voicePendingRef.current = null;
        processSpokenTranscript(transcript, null, "voice");
      },
    });
  };

  const handleSpeakSpecificOption = (opt) => {
    if (!currentTurn) return;
    if (isListening) {
      stopListening();
      setTargetedOption(null);
      return;
    }
    stopSpeak();
    resetTranscript();
    setTargetedOption(opt.id);
    voicePendingRef.current = { mode: "option", option: opt };
    startListening({
      maxDurationMs: 12000,
      onResult: (transcript) => {
        if (!transcript) return;
        voicePendingRef.current = null;
        processSpokenTranscript(transcript, opt, "voice");
      },
    });
  };

  const handleSendGuidedOption = (opt) => {
    stopSpeak();
    stopListening();
    const evaluation = scoreVietnamesePronunciation(opt.textVi, opt.textVi);
    commitLearnerResponse({
      spokenText: opt.textVi,
      matchedOption: opt,
      evaluation: {
        ...evaluation,
        score: Math.min(evaluation?.score ?? 90, 92),
        feedbackVi: "Đã gửi phản hồi tự nhiên (chế độ không micro).",
      },
      via: "guided",
    });
  };

  const handleSubmitTypedReply = (e) => {
    e.preventDefault();
    if (!typedReply.trim()) return;
    processSpokenTranscript(typedReply.trim(), null, "typed");
  };

  // 1. Scenario Picker View
  if (!activeScenario) {
    return (
      <div className="vf-g-panel" data-testid="dialogue-picker">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.18rem" }}>
              Chọn Tình Huống Nhập Vai Thực Tế
            </h3>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--g-text-muted)" }}>
              Đối thoại 4 lượt với người bản xứ — trả lời trực tiếp bằng micro hoặc chọn mẫu luyện đọc.
            </p>
          </div>
          {activeTopicId !== "all" && (
            <button
              type="button"
              className="vf-g-btn vf-g-btn--sm"
              onClick={() => setShowAllTopics((prev) => !prev)}
            >
              {showAllTopics ? "Chỉ xem chủ đề đang chọn" : "Xem tất cả 6 tình huống"}
            </button>
          )}
        </div>

        <div className="vf-g-scenario-grid">
          {visibleScenarios.map((sc) => {
            const tMeta = getTopicById?.(sc.topicId) || TOPIC_META[sc.topicId];
            return (
              <button
                key={sc.id}
                type="button"
                className="vf-g-scenario-card"
                onClick={() => startScenario(sc)}
                data-testid={`dialogue-scenario-${sc.id}`}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      marginBottom: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span className="vf-g-badge vf-g-badge--emerald">
                      {tMeta?.titleVi || sc.topicId}
                    </span>
                    <span className="vf-g-badge vf-g-mono">
                      {sc.turns?.length || 4} lượt
                    </span>
                  </div>
                  <h4 style={{ margin: "0 0 6px", fontSize: "1.05rem" }}>
                    {sc.titleVi}
                  </h4>
                  <p style={{ margin: "0 0 10px", fontSize: "0.86rem", color: "var(--g-text-muted)", lineHeight: 1.5 }}>
                    {sc.settingVi}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    paddingTop: "10px",
                    borderTop: "1px solid var(--g-border)",
                    width: "100%",
                  }}
                >
                  <div style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
                    <strong>{sc.partnerName}</strong> · {sc.partnerRole}
                  </div>
                  <span style={{ color: "#34d399", fontWeight: 700, fontSize: "0.84rem" }}>
                    Vào vai →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Active Roleplay Arena
  const totalTurns = activeScenario.turns?.length || 4;
  const avgScore =
    turnRecords.length > 0
      ? Math.round(
          turnRecords.reduce((s, r) => s + r.score, 0) / turnRecords.length
        )
      : 0;
  const avgTone =
    turnRecords.length > 0
      ? Math.round(
          turnRecords.reduce((s, r) => s + r.toneAccuracy, 0) / turnRecords.length
        )
      : 0;
  const xpEarned = Math.max(25, Math.round(turnRecords.length * 14 + avgScore * 0.35));

  return (
    <div className="vf-g-chat-shell" data-testid="dialogue-arena">
      {/* Partner & Controls Header */}
      <div className="vf-g-chat-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="vf-g-avatar">{getInitials(activeScenario.partnerName)}</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <strong style={{ fontSize: "1.02rem" }}>{activeScenario.partnerName}</strong>
              <span className="vf-g-badge">{activeScenario.partnerRole}</span>
              <span className="vf-g-badge vf-g-badge--emerald vf-g-mono">
                {completed
                  ? `Hoàn thành ${totalTurns}/${totalTurns}`
                  : `Lượt ${currentTurnNumber} / ${totalTurns}`}
              </span>
            </div>
            <div style={{ fontSize: "0.83rem", color: "var(--g-text-muted)", marginTop: "3px" }}>
              Mục tiêu: {activeScenario.goalVi}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            className={`vf-g-btn vf-g-btn--sm ${autoSpeakNpc ? "vf-g-btn--emerald" : ""}`}
            onClick={() => setAutoSpeakNpc((prev) => !prev)}
            title="Tự động phát giọng đối tác"
          >
            {autoSpeakNpc ? <Volume2 size={14} /> : <VolumeX size={14} />}
            Tự động đọc
          </button>
          <button
            type="button"
            className="vf-g-btn vf-g-btn--sm"
            onClick={() => setShowEnglish((prev) => !prev)}
          >
            {showEnglish ? <EyeOff size={14} /> : <Eye size={14} />}
            {showEnglish ? "Ẩn dịch EN" : "Hiện dịch EN"}
          </button>
          <button
            type="button"
            className="vf-g-btn vf-g-btn--sm"
            onClick={() => {
              stopSpeak();
              stopListening();
              setActiveScenario(null);
            }}
          >
            Đổi tình huống
          </button>
        </div>
      </div>

      {/* Chat Message Feed */}
      <div className="vf-g-chat-feed" data-testid="dialogue-messages">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`vf-g-bubble-row ${
                isUser ? "vf-g-bubble-row--user" : "vf-g-bubble-row--npc"
              }`}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.75rem",
                  color: "var(--g-text-muted)",
                }}
              >
                <span>{isUser ? "Bạn" : activeScenario.partnerName}</span>
                {msg.mood && <span className="vf-g-badge">{formatMood(msg.mood)}</span>}
                {isUser && msg.score !== undefined && (
                  <span className="vf-g-badge vf-g-badge--emerald vf-g-mono">
                    Phát âm {msg.score}% · Thanh điệu {msg.toneAccuracy}%
                  </span>
                )}
              </div>

              <div
                className={`vf-g-bubble ${
                  isUser
                    ? "vf-g-bubble--user"
                    : msg.sender === "reaction"
                      ? "vf-g-bubble--reaction"
                      : "vf-g-bubble--npc"
                }`}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <span>{msg.textVi}</span>
                  {!isUser && (
                    <button
                      type="button"
                      className="vf-g-btn vf-g-btn--ghost vf-g-btn--sm"
                      style={{ padding: "4px 6px", flexShrink: 0 }}
                      onClick={() => speak(msg.textVi, { rate: 0.95 })}
                      aria-label="Nghe lại câu này"
                    >
                      <Volume2 size={15} color="#38bdf8" />
                    </button>
                  )}
                </div>

                {showEnglish && msg.textEn && (
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "0.82rem",
                      color: "var(--g-text-muted)",
                      borderTop: "1px solid var(--g-border)",
                      paddingTop: "5px",
                    }}
                  >
                    {msg.textEn}
                  </div>
                )}

                {isUser && msg.feedbackVi && (
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "0.78rem",
                      color: "#a7f3d0",
                    }}
                  >
                    {msg.feedbackVi}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* End-of-Dialogue Report OR Dual Response Composer */}
      {completed ? (
        <div className="vf-g-summary" data-testid="dialogue-report">
          <div className="vf-g-summary-icon">
            <Trophy size={30} />
          </div>
          <h3 style={{ margin: "0 0 6px", fontSize: "1.35rem" }}>
            Hoàn thành đối thoại: {activeScenario.titleVi}
          </h3>
          <p style={{ margin: 0, color: "var(--g-text-muted)", fontSize: "0.92rem" }}>
            Bạn đã duy trì cuộc hội thoại tự nhiên cùng {activeScenario.partnerName} qua{" "}
            {turnRecords.length} lượt trao đổi.
          </p>

          <div className="vf-g-summary-grid">
            <div className="vf-g-metric-box">
              <div className="vf-g-metric-value vf-g-mono" style={{ color: "#34d399" }}>
                {avgScore}%
              </div>
              <div className="vf-g-metric-label">Điểm giao tiếp & phát âm</div>
            </div>
            <div className="vf-g-metric-box">
              <div className="vf-g-metric-value vf-g-mono" style={{ color: "#38bdf8" }}>
                {avgTone}%
              </div>
              <div className="vf-g-metric-label">Chuẩn thanh điệu TB</div>
            </div>
            <div className="vf-g-metric-box">
              <div className="vf-g-metric-value vf-g-mono" style={{ color: "#fbbf24" }}>
                +{xpEarned} XP
              </div>
              <div className="vf-g-metric-label">Điểm thưởng hoàn thành</div>
            </div>
          </div>

          <div className="vf-g-summary-actions">
            <button
              type="button"
              className="vf-g-btn vf-g-btn--emerald"
              onClick={() => startScenario(activeScenario)}
            >
              <RotateCcw size={16} /> Luyện lại tình huống này
            </button>
            <button
              type="button"
              className="vf-g-btn vf-g-btn--primary"
              onClick={() => setActiveScenario(null)}
            >
              <MessageSquare size={16} /> Đổi tình huống khác
            </button>
            {onBack && (
              <button type="button" className="vf-g-btn" onClick={onBack}>
                <ArrowLeft size={16} /> Về Trung tâm
              </button>
            )}
          </div>
        </div>
      ) : (
        currentTurn && (
          <div className="vf-g-composer" data-testid="dialogue-composer">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                marginBottom: "14px",
              }}
            >
              <div className="vf-g-tabs" style={{ marginBottom: 0 }}>
                <button
                  type="button"
                  className={`vf-g-tab ${composerMode === "speak" ? "vf-g-tab--active" : ""}`}
                  onClick={() => setComposerMode("speak")}
                  data-testid="dialogue-mode-speak"
                >
                  <Mic size={15} /> Nói trực tiếp
                </button>
                <button
                  type="button"
                  className={`vf-g-tab ${composerMode === "guided" ? "vf-g-tab--active" : ""}`}
                  onClick={() => setComposerMode("guided")}
                  data-testid="dialogue-mode-guided"
                >
                  <Sparkles size={15} /> Chọn & Luyện Đọc
                </button>
              </div>

              {Array.isArray(currentTurn.hintsVi) && currentTurn.hintsVi.length > 0 && (
                <button
                  type="button"
                  className={`vf-g-btn vf-g-btn--sm ${showHints ? "vf-g-btn--amber" : ""}`}
                  onClick={() => setShowHints((prev) => !prev)}
                >
                  <Lightbulb size={14} /> {showHints ? "Ẩn gợi ý nói" : "Gợi ý nói"}
                </button>
              )}
            </div>

            {showHints && Array.isArray(currentTurn.hintsVi) && currentTurn.hintsVi.length > 0 && (
              <div className="vf-g-drawer vf-g-drawer--hint" style={{ marginTop: 0, marginBottom: "14px" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, marginBottom: "6px" }}>
                  Gợi ý cách diễn đạt tự nhiên cho lượt này:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {currentTurn.hintsVi.map((hint, idx) => (
                    <span
                      key={idx}
                      className="vf-g-badge vf-g-badge--amber"
                      style={{ whiteSpace: "normal", textAlign: "left" }}
                    >
                      {hint}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {composerMode === "speak" ? (
              <div style={{ display: "grid", gap: "14px" }}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <button
                    type="button"
                    className={`vf-g-mic-btn ${
                      isListening && !targetedOption ? "vf-g-mic-btn--listening" : ""
                    }`}
                    disabled={!sttSupported}
                    onClick={handleStartFreeSpeak}
                    data-testid="dialogue-speak-mic-btn"
                  >
                    {isListening && !targetedOption ? (
                      <>
                        <MicOff size={19} /> Dừng ghi âm
                      </>
                    ) : (
                      <>
                        <Mic size={19} /> Nhấn để nói phản hồi
                      </>
                    )}
                  </button>

                  {isListening && !targetedOption && (
                    <div style={{ flex: 1, minWidth: "180px" }}>
                      <div className="vf-g-level-meter" style={{ marginBottom: "6px" }}>
                        <div
                          className="vf-g-level-fill"
                          style={{
                            width: `${Math.max(10, Math.round((micLevel || 0) * 100))}%`,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#e2e8f0" }}>
                        {interimTranscript || "Đang nghe tiếng Việt của bạn..."}
                      </div>
                    </div>
                  )}

                  {!sttSupported && (
                    <span style={{ fontSize: "0.84rem", color: "#fde68a" }}>
                      Trình duyệt không hỗ trợ nhận diện giọng nói — hãy dùng khung nhập bên dưới hoặc tab “Chọn & Luyện Đọc”.
                    </span>
                  )}
                </div>

                {speechError && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "0.84rem",
                      color: "#fda4af",
                    }}
                  >
                    <AlertCircle size={15} /> {speechError}
                  </div>
                )}

                {/* Natural response directions preview */}
                <div>
                  <div style={{ fontSize: "0.78rem", color: "var(--g-text-muted)", marginBottom: "6px" }}>
                    Các hướng phản hồi tự nhiên (nói theo ý bạn hoặc nhấn nghe mẫu):
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {(currentTurn.expectedResponses || []).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className="vf-g-phrase-chip"
                        onClick={() => speak(opt.textVi, { rate: 0.95 })}
                      >
                        <Volume2 size={13} color="#38bdf8" />
                        <span>
                          <strong>{opt.labelVi}:</strong> {opt.textVi}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text fallback for quiet mode / deterministic testing */}
                <form
                  onSubmit={handleSubmitTypedReply}
                  style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                >
                  <input
                    type="text"
                    className="vf-g-input"
                    style={{ flex: 1, minWidth: "220px" }}
                    value={typedReply}
                    onChange={(e) => setTypedReply(e.target.value)}
                    placeholder="Hoặc gõ câu trả lời tiếng Việt của bạn để hệ thống ghép nhánh & chấm điểm..."
                    data-testid="dialogue-typed-input"
                  />
                  <button
                    type="submit"
                    className="vf-g-btn vf-g-btn--emerald"
                    disabled={!typedReply.trim()}
                    data-testid="dialogue-typed-submit"
                  >
                    <Send size={15} /> Gửi phản hồi
                  </button>
                </form>
              </div>
            ) : (
              /* Guided Choice + Speak / Send Mode */
              <div style={{ display: "grid", gap: "10px" }}>
                {(currentTurn.expectedResponses || []).map((opt) => {
                  const isListeningThis = isListening && targetedOption === opt.id;
                  return (
                    <div key={opt.id} className="vf-g-response-card">
                      <div>
                        <span
                          className="vf-g-badge vf-g-badge--sky"
                          style={{ marginBottom: "6px" }}
                        >
                          {opt.labelVi}
                        </span>
                        <div style={{ fontSize: "0.96rem", fontWeight: 600, color: "#f8fafc" }}>
                          {opt.textVi}
                        </div>
                        {showEnglish && opt.textEn && (
                          <div
                            style={{
                              fontSize: "0.82rem",
                              color: "var(--g-text-muted)",
                              marginTop: "3px",
                            }}
                          >
                            {opt.textEn}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="vf-g-btn vf-g-btn--sm"
                          onClick={() => speak(opt.textVi, { rate: 0.95 })}
                        >
                          <Volume2 size={14} /> Nghe mẫu
                        </button>
                        <button
                          type="button"
                          className={`vf-g-btn vf-g-btn--sm ${
                            isListeningThis ? "vf-g-btn--coral" : "vf-g-btn--primary"
                          }`}
                          disabled={!sttSupported}
                          onClick={() => handleSpeakSpecificOption(opt)}
                        >
                          {isListeningThis ? <MicOff size={14} /> : <Mic size={14} />}
                          {isListeningThis ? "Dừng" : "Đọc theo câu này"}
                        </button>
                        <button
                          type="button"
                          className="vf-g-btn vf-g-btn--emerald vf-g-btn--sm"
                          onClick={() => handleSendGuidedOption(opt)}
                          data-testid={`dialogue-send-option-${opt.id}`}
                        >
                          <CheckCircle2 size={14} /> Gửi câu này
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

export default DialogueRoleplay;
