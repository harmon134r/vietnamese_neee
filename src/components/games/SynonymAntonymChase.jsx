import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronsUp,
  Flame,
  Heart,
  Maximize2,
  Minimize2,
  Music,
  Play,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react";
import {
  CHASE_MODES,
  CHASE_SCENES,
  SYNONYM_ANTONYM_ITEMS,
  getChaseItems,
} from "../../data";
import { APP_ART } from "../../data/illustrations";
import { GAME_TYPES, TOPIC_META } from "../../lib/contracts";
import { createChillAudioEngine } from "../../lib/chillMusic";
import * as speechApi from "../../lib/speech";
import { loadGameHistory } from "../../lib/storage";

const ROUND_LENGTH = 12;
const MAX_HEARTS = 3;
const QUESTION_TIME_MS = 14000;
const SCENE_ROTATE_INTERVAL = 3;
const CORRECT_FEEDBACK_MS = 1150;
const WRONG_FEEDBACK_MS = 2200;

const MODE_LABELS = {
  synonym: "Đồng nghĩa",
  antonym: "Trái nghĩa",
  mixed: "Hỗn hợp",
};

const CAT_CELL_WIDTH = 320;
const CAT_CELL_HEIGHT = 240;
const DOG_CELL_WIDTH = 340;
const DOG_CELL_HEIGHT = 240;

function shuffleList(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildBalancedLanes(count) {
  const topCount = Math.floor(count / 2);
  const bottomCount = count - topCount;
  const lanes = [
    ...Array.from({ length: topCount }, () => "top"),
    ...Array.from({ length: bottomCount }, () => "bottom"),
  ];
  const shuffled = shuffleList(lanes);
  // Smooth out runs of 4+ identical lanes for lively jump/run variety
  for (let i = 3; i < shuffled.length; i += 1) {
    if (
      shuffled[i] === shuffled[i - 1] &&
      shuffled[i] === shuffled[i - 2] &&
      shuffled[i] === shuffled[i - 3]
    ) {
      const swapIdx = shuffled.findIndex(
        (lane, idx) => idx > i && lane !== shuffled[i]
      );
      if (swapIdx !== -1) {
        [shuffled[i], shuffled[swapIdx]] = [shuffled[swapIdx], shuffled[i]];
      }
    }
  }
  return shuffled;
}

function pickDistractor(item) {
  const pool = Array.isArray(item?.distractors)
    ? item.distractors.filter(
        (d) =>
          typeof d === "string" &&
          d.trim() &&
          d.trim().toLowerCase() !== String(item.correctAnswer || "").trim().toLowerCase()
      )
    : [];
  if (pool.length === 0) return "khác biệt";
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildChaseQuestions(mode, topicId) {
  const safeGet =
    typeof getChaseItems === "function"
      ? getChaseItems
      : ({ mode: m, topicId: t }) =>
          (SYNONYM_ANTONYM_ITEMS || []).filter((it) => {
            const matchMode = m === "mixed" || it.mode === m;
            const matchTopic = !t || t === "all" || it.topicId === t;
            return matchMode && matchTopic;
          });

  const primaryPool = safeGet({ mode, topicId }) || [];
  const allPool = topicId && topicId !== "all" ? safeGet({ mode, topicId: "all" }) || [] : primaryPool;

  let selectedItems = [];

  if (mode === "mixed") {
    const pickBalancedMixed = (source, targetCount, usedIds) => {
      const syns = shuffleList(
        source.filter((it) => it.mode === "synonym" && !usedIds.has(it.id))
      );
      const ants = shuffleList(
        source.filter((it) => it.mode === "antonym" && !usedIds.has(it.id))
      );
      const picked = [];
      let sIdx = 0;
      let aIdx = 0;
      let takeSyn = Math.random() >= 0.5;

      while (picked.length < targetCount && (sIdx < syns.length || aIdx < ants.length)) {
        if (takeSyn && sIdx < syns.length) {
          picked.push(syns[sIdx]);
          usedIds.add(syns[sIdx].id);
          sIdx += 1;
        } else if (!takeSyn && aIdx < ants.length) {
          picked.push(ants[aIdx]);
          usedIds.add(ants[aIdx].id);
          aIdx += 1;
        } else if (sIdx < syns.length) {
          picked.push(syns[sIdx]);
          usedIds.add(syns[sIdx].id);
          sIdx += 1;
        } else if (aIdx < ants.length) {
          picked.push(ants[aIdx]);
          usedIds.add(ants[aIdx].id);
          aIdx += 1;
        }
        takeSyn = !takeSyn;
      }
      return picked;
    };

    const usedIds = new Set();
    selectedItems = pickBalancedMixed(primaryPool, ROUND_LENGTH, usedIds);
    if (selectedItems.length < ROUND_LENGTH) {
      selectedItems = [
        ...selectedItems,
        ...pickBalancedMixed(allPool, ROUND_LENGTH - selectedItems.length, usedIds),
      ];
    }
  } else {
    const usedIds = new Set();
    const shuffledPrimary = shuffleList(primaryPool);
    for (const item of shuffledPrimary) {
      if (selectedItems.length >= ROUND_LENGTH) break;
      if (!usedIds.has(item.id)) {
        usedIds.add(item.id);
        selectedItems.push(item);
      }
    }
    if (selectedItems.length < ROUND_LENGTH) {
      const shuffledAll = shuffleList(allPool);
      for (const item of shuffledAll) {
        if (selectedItems.length >= ROUND_LENGTH) break;
        if (!usedIds.has(item.id)) {
          usedIds.add(item.id);
          selectedItems.push(item);
        }
      }
    }
  }

  const lanes = buildBalancedLanes(selectedItems.length);
  return selectedItems.map((item, idx) => {
    const correctLane = lanes[idx] || (idx % 2 === 0 ? "top" : "bottom");
    const distractor = pickDistractor(item);
    return {
      ...item,
      questionIndex: idx,
      correctLane,
      topOption: correctLane === "top" ? item.correctAnswer : distractor,
      bottomOption: correctLane === "bottom" ? item.correctAnswer : distractor,
    };
  });
}

function formatLeaderboardDate(isoString) {
  if (!isoString) return "—";
  const dt = new Date(isoString);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function HurdleBarrier({ state }) {
  return (
    <div
      className={`vf-chase-hurdle vf-chase-hurdle--${state}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 116 96"
        className="vf-chase-hurdle-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ground shadow */}
        <ellipse cx="58" cy="89" rx="44" ry="6" fill="rgba(18, 13, 9, 0.34)" />
        {/* Wooden base skids */}
        <path
          d="M18 85 L44 74 L44 79 L18 90 Z"
          fill="#8c6239"
          stroke="#4d321b"
          strokeWidth="1.6"
        />
        <path
          d="M72 85 L98 74 L98 79 L72 90 Z"
          fill="#8c6239"
          stroke="#4d321b"
          strokeWidth="1.6"
        />
        {/* Back crossbar X */}
        <line x1="30" y1="36" x2="86" y2="76" stroke="#75502d" strokeWidth="5" strokeLinecap="round" />
        <line x1="86" y1="36" x2="30" y2="76" stroke="#966a3d" strokeWidth="5" strokeLinecap="round" />
        {/* Vertical legs */}
        <rect x="26" y="29" width="7" height="53" rx="2" fill="#a87948" stroke="#4d321b" strokeWidth="1.6" />
        <rect x="83" y="21" width="7" height="58" rx="2" fill="#a87948" stroke="#4d321b" strokeWidth="1.6" />
        {/* Angled striped top plank (matching reference hurdle) */}
        <g transform="skewY(-9)">
          <rect
            x="16"
            y="24"
            width="84"
            height="17"
            rx="3.5"
            fill="#faf3e3"
            stroke="#5a381d"
            strokeWidth="2"
          />
          <rect x="19" y="25" width="14" height="15" fill="#d97736" />
          <rect x="47" y="25" width="14" height="15" fill="#d97736" />
          <rect x="75" y="25" width="14" height="15" fill="#d97736" />
          <rect
            x="16"
            y="24"
            width="84"
            height="17"
            rx="3.5"
            fill="none"
            stroke="#5a381d"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

export function SynonymAntonymChase({
  activeTopicId = "all",
  onCompleteSession,
  onBack,
}) {
  const scenes = useMemo(
    () => (Array.isArray(CHASE_SCENES) && CHASE_SCENES.length > 0 ? CHASE_SCENES : []),
    []
  );
  const modes = useMemo(
    () => (Array.isArray(CHASE_MODES) && CHASE_MODES.length > 0 ? CHASE_MODES : []),
    []
  );

  // Top segmented tab ("play" | "leaderboard")
  const [activeTab, setActiveTab] = useState("play");

  // Setup preferences
  const [selectedMode, setSelectedMode] = useState("synonym");
  const [startSceneId, setStartSceneId] = useState(scenes[0]?.id || "garden");
  const [autoRotateScene, setAutoRotateScene] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);

  // Live run state ("setup" | "playing" | "summary")
  const [phase, setPhase] = useState("setup");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(QUESTION_TIME_MS);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [visitedSceneIds, setVisitedSceneIds] = useState([]);
  const [sceneToast, setSceneToast] = useState(null);

  // Per-question feedback & character animation
  const [feedback, setFeedback] = useState(null);
  const [catAnim, setCatAnim] = useState("run"); // "run" | "jump" | "dash" | "stumble"
  const [dogAnim, setDogAnim] = useState("run"); // "run" | "lunge"
  const [hurdleState, setHurdleState] = useState("glide"); // "glide" | "cleared-jump" | "cleared-dash" | "hit"
  const [scorePop, setScorePop] = useState(null);
  const [historyLog, setHistoryLog] = useState([]);

  // Audio & viewport UI state
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Refs for timers, audio engine, and session lifecycle
  const audioEngineRef = useRef(null);
  const stageRef = useRef(null);
  const advanceTimerRef = useRef(null);
  const animTimerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const reportedRef = useRef(false);
  const feedbackRef = useRef(null);
  const phaseRef = useRef("setup");
  const activeTabRef = useRef("play");

  feedbackRef.current = feedback;
  phaseRef.current = phase;
  activeTabRef.current = activeTab;

  const getAudioEngine = useCallback(() => {
    if (!audioEngineRef.current) {
      audioEngineRef.current = createChillAudioEngine();
    }
    return audioEngineRef.current;
  }, []);

  const clearRunTimers = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (animTimerRef.current) {
      clearTimeout(animTimerRef.current);
      animTimerRef.current = null;
    }
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  // Guaranteed cleanup on unmount so chill music & TTS NEVER leak
  useEffect(() => {
    return () => {
      clearRunTimers();
      speechApi.stopSpeaking?.();
      if (audioEngineRef.current) {
        audioEngineRef.current.dispose?.();
        audioEngineRef.current = null;
      }
    };
  }, [clearRunTimers]);

  // Keep preview backdrop synced with chosen starting scene during setup
  useEffect(() => {
    if (phase === "setup") {
      const idx = scenes.findIndex((s) => s.id === startSceneId);
      setActiveSceneIndex(idx >= 0 ? idx : 0);
    }
  }, [phase, scenes, startSceneId]);

  // Sync fullscreen status cleanly
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Load BXH leaderboard records
  const refreshLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const records = await loadGameHistory({
        gameType: GAME_TYPES.SYNONYM_ANTONYM_CHASE,
        limit: 20,
      });
      const sorted = (Array.isArray(records) ? [...records] : []).sort((a, b) => {
        if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
        if ((b.accuracy || 0) !== (a.accuracy || 0)) return (b.accuracy || 0) - (a.accuracy || 0);
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      setLeaderboard(sorted);
    } catch {
      setLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "leaderboard") {
      refreshLeaderboard();
    }
  }, [activeTab, refreshLeaderboard]);

  const currentQuestion = questions[currentIndex] || null;
  const activeScene = scenes[activeSceneIndex] || scenes[0] || {
    id: "garden",
    labelVi: "Sân vườn mùa thu",
    subtitleVi: "Hàng rào gỗ & lá vàng rơi",
    image: "/images/chase/scene-garden.webp",
    groundColor: "#8b6343",
    accentColor: "#d9823b",
  };

  // Prefetch current + next 2 promptWords for 0ms VieNeu-TTS playback
  const currentPromptWord = currentQuestion?.promptWord || "";
  const nextPromptWord1 = questions[currentIndex + 1]?.promptWord || "";
  const nextPromptWord2 = questions[currentIndex + 2]?.promptWord || "";

  useEffect(() => {
    if (phase !== "playing") return;
    if (typeof speechApi.prefetchVietnamese !== "function") return;
    const words = [currentPromptWord, nextPromptWord1, nextPromptWord2].filter(Boolean);
    if (words.length > 0) {
      const voice = speechApi.getSelectedVoice?.();
      speechApi.prefetchVietnamese(words, voice ? { voice } : {});
    }
  }, [phase, currentPromptWord, nextPromptWord1, nextPromptWord2]);

  useEffect(() => {
    if (phase !== "playing" || typeof window === "undefined") return undefined;
    if (typeof speechApi.prefetchVietnamese !== "function") return undefined;
    const voiceChangeEvent = speechApi.VOICE_CHANGE_EVENT || "vietflow:voice-change";
    const handleVoiceChange = (event) => {
      const nextVoice = event?.detail?.voice || speechApi.getSelectedVoice?.() || "";
      const words = [currentPromptWord, nextPromptWord1, nextPromptWord2].filter(Boolean);
      if (words.length > 0) {
        speechApi.prefetchVietnamese(words, nextVoice ? { voice: nextVoice } : {});
      }
    };
    window.addEventListener(voiceChangeEvent, handleVoiceChange);
    return () => window.removeEventListener(voiceChangeEvent, handleVoiceChange);
  }, [phase, currentPromptWord, nextPromptWord1, nextPromptWord2]);

  // Speak Vietnamese word with smooth chill-music ducking
  const handleSpeakWord = useCallback((word) => {
    if (!word) return;
    const engine = audioEngineRef.current;
    engine?.duck?.(true);
    Promise.resolve(speechApi.speakVietnamese?.(word, { rate: 0.96 }))
      .catch(() => {})
      .finally(() => {
        engine?.duck?.(false);
      });
  }, []);

  const triggerSceneToast = useCallback((sceneLabel) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setSceneToast(sceneLabel);
    toastTimerRef.current = setTimeout(() => {
      setSceneToast(null);
      toastTimerRef.current = null;
    }, 2600);
  }, []);

  const finishRun = useCallback(
    (finalLog, finalScore, finalMaxStreak, finalHearts, totalQuestionsCount, visitedIds) => {
      clearRunTimers();
      speechApi.stopSpeaking?.();
      const engine = audioEngineRef.current;
      engine?.duck?.(false);
      if (finalHearts > 0) {
        engine?.playVictorySfx?.();
      }
      setPhase("summary");

      if (!reportedRef.current && typeof onCompleteSession === "function") {
        reportedRef.current = true;
        const answeredCount = Math.max(1, finalLog.length);
        const correctCount = finalLog.filter((item) => item.isCorrect).length;
        const accuracy = Math.round((correctCount / answeredCount) * 100);
        const maxScore = Math.max(finalScore, Math.max(1, totalQuestionsCount) * 15);
        const durationSec = Math.max(
          1,
          Math.round((Date.now() - startTimeRef.current) / 1000)
        );
        onCompleteSession({
          gameType: GAME_TYPES.SYNONYM_ANTONYM_CHASE,
          topicId: activeTopicId === "all" ? null : activeTopicId,
          skillTags: ["reading", "listening"],
          score: finalScore,
          maxScore,
          accuracy,
          durationSec,
          durationSeconds: durationSec,
          details: {
            mode: selectedMode,
            maxStreak: finalMaxStreak,
            heartsLeft: finalHearts,
            correctCount,
            totalQuestions: totalQuestionsCount,
            scenesVisited: visitedIds,
          },
        });
      }
    },
    [activeTopicId, clearRunTimers, onCompleteSession, selectedMode]
  );

  // Start a new run directly inside click handler so Web Audio starts cleanly
  const handleStartRun = useCallback(() => {
    clearRunTimers();
    speechApi.stopSpeaking?.();

    const engine = getAudioEngine();
    if (musicEnabled) {
      engine.setMuted?.(false);
      setIsMuted(false);
      engine.startMusic?.();
    } else {
      engine.setMuted?.(true);
      setIsMuted(true);
      engine.stopMusic?.();
    }

    const nextQuestions = buildChaseQuestions(selectedMode, activeTopicId);
    const startIdx = Math.max(
      0,
      scenes.findIndex((s) => s.id === startSceneId)
    );
    const initialSceneId = scenes[startIdx]?.id || startSceneId;

    setQuestions(nextQuestions);
    setCurrentIndex(0);
    setScore(0);
    setHearts(MAX_HEARTS);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeftMs(QUESTION_TIME_MS);
    setActiveSceneIndex(startIdx);
    setVisitedSceneIds([initialSceneId]);
    setSceneToast(null);
    setFeedback(null);
    setCatAnim("run");
    setDogAnim("run");
    setHurdleState("glide");
    setScorePop(null);
    setHistoryLog([]);
    startTimeRef.current = Date.now();
    reportedRef.current = false;
    setActiveTab("play");
    setPhase("playing");
  }, [activeTopicId, clearRunTimers, getAudioEngine, musicEnabled, scenes, selectedMode, startSceneId]);

  const handleReturnToSetup = useCallback(() => {
    clearRunTimers();
    speechApi.stopSpeaking?.();
    audioEngineRef.current?.stopMusic?.();
    setFeedback(null);
    setScorePop(null);
    setSceneToast(null);
    setPhase("setup");
  }, [clearRunTimers]);

  const handleToggleMute = useCallback(() => {
    const engine = getAudioEngine();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setMusicEnabled(!nextMuted);
    engine.setMuted?.(nextMuted);
    if (!nextMuted && phaseRef.current === "playing") {
      engine.startMusic?.();
    }
  }, [getAudioEngine, isMuted]);

  const handleToggleFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;
    try {
      if (document.fullscreenElement) {
        const res = document.exitFullscreen?.();
        if (res && typeof res.catch === "function") res.catch(() => {});
      } else {
        const res = stageRef.current?.requestFullscreen?.();
        if (res && typeof res.catch === "function") res.catch(() => {});
      }
    } catch {
      // ignore unsupported fullscreen API errors
    }
  }, []);

  // Core answer submission handler ("top" | "bottom" | null for timeout)
  const handleSelectLane = useCallback(
    (lane) => {
      if (phaseRef.current !== "playing" || feedbackRef.current !== null) return;
      const q = questions[currentIndex];
      if (!q) return;

      const engine = audioEngineRef.current;
      const isTimeout = lane === null;
      const isCorrect = !isTimeout && lane === q.correctLane;
      const chosenWord =
        lane === "top" ? q.topOption : lane === "bottom" ? q.bottomOption : null;

      const nextStreak = isCorrect ? streak + 1 : 0;
      const nextMaxStreak = Math.max(maxStreak, nextStreak);
      const pointsGained = isCorrect ? (nextStreak >= 3 ? 15 : 10) : 0;
      const nextScore = score + pointsGained;
      const nextHearts = isCorrect ? hearts : Math.max(0, hearts - 1);

      if (lane === "top") {
        engine?.playJumpSfx?.();
      }
      if (isCorrect) {
        engine?.playCorrectSfx?.(nextStreak);
        setCatAnim(lane === "top" ? "jump" : "dash");
        setDogAnim("run");
        setHurdleState(lane === "top" ? "cleared-jump" : "cleared-dash");
        setScorePop({
          id: `${q.id}-${currentIndex}`,
          text: `+${pointsGained}`,
          tone: "good",
          lane,
        });
      } else {
        engine?.playWrongSfx?.();
        setCatAnim("stumble");
        setDogAnim("lunge");
        setHurdleState("hit");
        setScorePop({
          id: `${q.id}-${currentIndex}`,
          text: isTimeout ? "Hết giờ · -1 ❤️" : "-1 ❤️",
          tone: "bad",
          lane: lane || "bottom",
        });
      }

      const logEntry = {
        id: q.id,
        mode: q.mode,
        topicId: q.topicId,
        promptWord: q.promptWord,
        pos: q.pos,
        correctAnswer: q.correctAnswer,
        chosenWord,
        explanationVi: q.explanationVi,
        exampleVi: q.exampleVi,
        isCorrect,
        isTimeout,
        pointsGained,
      };
      const nextHistory = [...historyLog, logEntry];

      setScore(nextScore);
      setStreak(nextStreak);
      setMaxStreak(nextMaxStreak);
      setHearts(nextHearts);
      setHistoryLog(nextHistory);
      setFeedback({
        isCorrect,
        isTimeout,
        selectedLane: lane,
        correctLane: q.correctLane,
        correctAnswer: q.correctAnswer,
        explanationVi: q.explanationVi,
        pointsGained,
      });

      const delayMs = isCorrect ? CORRECT_FEEDBACK_MS : WRONG_FEEDBACK_MS;
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);

      advanceTimerRef.current = setTimeout(() => {
        advanceTimerRef.current = null;
        const isLastQuestion = currentIndex + 1 >= questions.length;
        if (nextHearts <= 0 || isLastQuestion) {
          finishRun(
            nextHistory,
            nextScore,
            nextMaxStreak,
            nextHearts,
            questions.length,
            visitedSceneIds
          );
          return;
        }

        const nextIdx = currentIndex + 1;
        if (
          autoRotateScene &&
          scenes.length > 1 &&
          nextIdx > 0 &&
          nextIdx % SCENE_ROTATE_INTERVAL === 0
        ) {
          const nextSceneIdx = (activeSceneIndex + 1) % scenes.length;
          const nextSceneObj = scenes[nextSceneIdx];
          setActiveSceneIndex(nextSceneIdx);
          if (nextSceneObj) {
            setVisitedSceneIds((prev) =>
              prev.includes(nextSceneObj.id) ? prev : [...prev, nextSceneObj.id]
            );
            audioEngineRef.current?.playSceneChangeSfx?.();
            triggerSceneToast(nextSceneObj.labelVi);
          }
        }

        setCurrentIndex(nextIdx);
        setTimeLeftMs(QUESTION_TIME_MS);
        setFeedback(null);
        setCatAnim("run");
        setDogAnim("run");
        setHurdleState("glide");
        setScorePop(null);
      }, delayMs);
    },
    [
      activeSceneIndex,
      autoRotateScene,
      currentIndex,
      finishRun,
      hearts,
      historyLog,
      maxStreak,
      questions,
      scenes,
      score,
      streak,
      triggerSceneToast,
      visitedSceneIds,
    ]
  );

  // Calm 14s per-question countdown (pauses cleanly while showing feedback or viewing BXH)
  useEffect(() => {
    if (phase !== "playing" || activeTab !== "play" || feedback !== null) {
      return undefined;
    }
    const interval = setInterval(() => {
      setTimeLeftMs((prev) => Math.max(0, prev - 100));
    }, 100);
    return () => clearInterval(interval);
  }, [phase, activeTab, feedback, currentIndex]);

  useEffect(() => {
    if (
      phase === "playing" &&
      activeTab === "play" &&
      feedback === null &&
      timeLeftMs === 0
    ) {
      handleSelectLane(null);
    }
  }, [phase, activeTab, feedback, timeLeftMs, handleSelectLane]);

  // Keyboard controls: ArrowUp / KeyW / Space => NHẢY (top); ArrowDown / KeyS / ArrowRight => CHẠY THẲNG (bottom)
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleKeyDown = (e) => {
      if (phaseRef.current !== "playing" || activeTabRef.current !== "play") return;
      if (feedbackRef.current !== null) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const tag = e.target?.tagName?.toLowerCase?.();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      const isTopKey =
        e.key === "ArrowUp" ||
        e.code === "ArrowUp" ||
        e.code === "KeyW" ||
        e.key === "w" ||
        e.key === "W" ||
        e.code === "Space" ||
        e.key === " ";

      const isBottomKey =
        e.key === "ArrowDown" ||
        e.code === "ArrowDown" ||
        e.code === "KeyS" ||
        e.key === "s" ||
        e.key === "S" ||
        e.key === "ArrowRight" ||
        e.code === "ArrowRight";

      if (isTopKey) {
        e.preventDefault();
        handleSelectLane("top");
      } else if (isBottomKey) {
        e.preventDefault();
        handleSelectLane("bottom");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSelectLane]);

  // Dynamic dog chase position (closes in when hearts drop, widens slightly on streaks)
  const dogLeftPct = useMemo(() => {
    const baseByHearts =
      hearts >= 3 ? 9 : hearts === 2 ? 15.5 : hearts === 1 ? 21.5 : 26.5;
    const streakPull = streak >= 4 ? -3.5 : streak >= 2 ? -2 : 0;
    return Math.max(4, baseByHearts + streakPull);
  }, [hearts, streak]);

  const isScrolling = phase === "playing" && activeTab === "play";
  const timerPct = Math.max(0, Math.min(100, (timeLeftMs / QUESTION_TIME_MS) * 100));
  const promptIsSynonym = currentQuestion?.mode === "synonym";
  const catSheet = APP_ART.chaseCatSheet || {
    src: "/images/chase/cat-sheet.png",
    alt: "Chú mèo chạy nhảy",
    frames: 4,
  };
  const dogSheet = APP_ART.chaseDogSheet || {
    src: "/images/chase/dog-sheet.png",
    alt: "Chú chó rượt đuổi",
    frames: 4,
  };

  return (
    <div className="vf-chase-root" data-testid="synonym-antonym-chase">
      {/* Top Segmented Tabs matching Reference Image #2: Chơi | BXH */}
      <div className="vf-chase-tabs-wrap">
        <div
          className="vf-chase-tabs"
          role="tablist"
          aria-label="Chuyển đổi chơi và bảng xếp hạng"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "play"}
            className={`vf-chase-tab ${
              activeTab === "play" ? "vf-chase-tab--active" : ""
            }`}
            onClick={() => setActiveTab("play")}
            data-testid="chase-tab-play"
          >
            Chơi
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "leaderboard"}
            className={`vf-chase-tab ${
              activeTab === "leaderboard" ? "vf-chase-tab--active" : ""
            }`}
            onClick={() => setActiveTab("leaderboard")}
            data-testid="chase-tab-leaderboard"
          >
            BXH
          </button>
        </div>
      </div>

      {/* TAB 2: LEADERBOARD (BXH) */}
      {activeTab === "leaderboard" ? (
        <section className="vf-chase-bxh" data-testid="chase-leaderboard">
          <div className="vf-chase-bxh-head">
            <div>
              <h3 className="vf-chase-bxh-title">
                <Trophy size={18} /> Bảng xếp hạng rượt đuổi
              </h3>
              <p className="vf-chase-bxh-sub">
                Top 20 lượt chạy điểm cao nhất của bạn trên thiết bị & tài khoản hiện tại.
              </p>
            </div>
            <button
              type="button"
              className="vf-g-btn vf-g-btn--primary vf-g-btn--sm"
              onClick={() => setActiveTab("play")}
            >
              <Play size={14} /> Quay lại chơi
            </button>
          </div>

          {leaderboardLoading ? (
            <div className="vf-chase-bxh-empty">Đang tải bảng xếp hạng...</div>
          ) : leaderboard.length === 0 ? (
            <div className="vf-chase-bxh-empty" data-testid="chase-bxh-empty">
              <Sparkles size={24} className="vf-chase-bxh-empty-icon" />
              <p className="vf-chase-bxh-empty-title">
                Chưa có lượt rượt đuổi nào được ghi nhận
              </p>
              <p className="vf-chase-bxh-empty-sub">
                Hoàn thành ván đầu tiên để lưu kỷ lục điểm số, độ chính xác và chuỗi đúng dài nhất của bạn!
              </p>
              <button
                type="button"
                className="vf-g-btn vf-g-btn--primary vf-g-btn--sm"
                onClick={() => setActiveTab("play")}
              >
                <Play size={14} /> Chơi ván đầu tiên
              </button>
            </div>
          ) : (
            <div className="vf-chase-bxh-table-wrap">
              <table className="vf-chase-bxh-table">
                <thead>
                  <tr>
                    <th>Hạng</th>
                    <th>Chế độ</th>
                    <th>Điểm</th>
                    <th>Chính xác</th>
                    <th>Chuỗi tối đa</th>
                    <th>Ngày chơi</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row, idx) => {
                    const modeKey = row.details?.mode || "synonym";
                    const modeLabel = MODE_LABELS[modeKey] || "Đồng nghĩa";
                    const bestRunStreak = Number(row.details?.maxStreak ?? 0);
                    return (
                      <tr key={row.id || idx} className={idx < 3 ? "vf-chase-bxh-top" : ""}>
                        <td className="vf-g-mono">
                          <span className={`vf-chase-rank vf-chase-rank--${idx + 1}`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td>
                          <span className={`vf-chase-mode-pill vf-chase-mode-pill--${modeKey}`}>
                            {modeLabel}
                          </span>
                        </td>
                        <td className="vf-g-mono vf-chase-bxh-score">{row.score}</td>
                        <td className="vf-g-mono">{Math.round(Number(row.accuracy || 0))}%</td>
                        <td className="vf-g-mono">×{bestRunStreak}</td>
                        <td className="vf-chase-bxh-date">
                          {formatLeaderboardDate(row.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : phase === "summary" ? (
        /* END-OF-RUN SUMMARY */
        <section className="vf-chase-summary" data-testid="chase-summary">
          <div className="vf-g-summary-kicker">
            {hearts > 0 ? "Hoàn thành cuộc rượt đuổi" : "Kết thúc lượt chạy"}
          </div>
          <h2 className="vf-g-summary-title">
            {hearts > 0
              ? "Chú mèo đã về đích an toàn!"
              : "Chú cún đã đuổi kịp mất rồi!"}
          </h2>
          <p className="vf-g-summary-sub">
            Chế độ <strong>{MODE_LABELS[selectedMode] || "Đồng nghĩa"}</strong> ·{" "}
            {historyLog.filter((item) => item.isCorrect).length}/{historyLog.length} câu đúng.
            Nghe lại các cặp từ bên dưới để ghi nhớ sâu hơn.
          </p>

          <div className="vf-chase-summary-stats">
            <div className="vf-g-metric-box">
              <div className="vf-g-metric-value vf-g-mono" style={{ color: "var(--g-accent)" }}>
                {score}
              </div>
              <div className="vf-g-metric-label">Điểm số</div>
            </div>
            <div className="vf-g-metric-box">
              <div className="vf-g-metric-value vf-g-mono" style={{ color: "var(--g-good)" }}>
                {Math.round(
                  (historyLog.filter((i) => i.isCorrect).length /
                    Math.max(1, historyLog.length)) *
                    100
                )}
                %
              </div>
              <div className="vf-g-metric-label">Độ chính xác</div>
            </div>
            <div className="vf-g-metric-box">
              <div className="vf-g-metric-value vf-g-mono">×{maxStreak}</div>
              <div className="vf-g-metric-label">Chuỗi dài nhất</div>
            </div>
            <div className="vf-g-metric-box">
              <div className="vf-g-metric-value vf-g-mono">
                {hearts}/{MAX_HEARTS}
              </div>
              <div className="vf-g-metric-label">Tim còn lại</div>
            </div>
          </div>

          {visitedSceneIds.length > 0 && (
            <div className="vf-chase-visited-scenes">
              <span className="vf-chase-visited-label">Bối cảnh đã đi qua:</span>
              <div className="vf-chase-visited-chips">
                {visitedSceneIds.map((sceneId) => {
                  const sc = scenes.find((s) => s.id === sceneId);
                  if (!sc) return null;
                  return (
                    <span key={sc.id} className="vf-g-tag">
                      {sc.labelVi}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="vf-chase-review-list">
            {historyLog.map((entry, idx) => (
              <div
                key={`${entry.id}-${idx}`}
                className={`vf-chase-review-card ${
                  entry.isCorrect
                    ? "vf-chase-review-card--good"
                    : "vf-chase-review-card--bad"
                }`}
              >
                <div className="vf-chase-review-main">
                  <div className="vf-chase-review-top">
                    {entry.isCorrect ? (
                      <CheckCircle2 size={16} color="var(--g-good)" />
                    ) : (
                      <XCircle size={16} color="var(--g-bad)" />
                    )}
                    <span className="vf-g-serif vf-chase-review-pair">
                      <strong>{entry.promptWord}</strong>
                      <span className="vf-chase-review-arrow">
                        {entry.mode === "synonym" ? " ≈ " : " ↔ "}
                      </span>
                      <strong>{entry.correctAnswer}</strong>
                    </span>
                    <span
                      className={`vf-chase-mode-pill vf-chase-mode-pill--${entry.mode}`}
                    >
                      {entry.mode === "synonym" ? "Đồng nghĩa" : "Trái nghĩa"}
                    </span>
                  </div>
                  <p className="vf-chase-review-explain">{entry.explanationVi}</p>
                </div>

                <button
                  type="button"
                  className="vf-g-btn vf-g-btn--ghost vf-g-btn--sm"
                  onClick={() =>
                    handleSpeakWord(`${entry.promptWord}, ${entry.correctAnswer}`)
                  }
                  aria-label={`Nghe cặp từ ${entry.promptWord} và ${entry.correctAnswer}`}
                >
                  <Volume2 size={15} /> Nghe
                </button>
              </div>
            ))}
          </div>

          <div className="vf-g-summary-actions">
            <button
              type="button"
              className="vf-g-btn vf-g-btn--primary"
              onClick={handleStartRun}
              data-testid="chase-replay-btn"
            >
              <RotateCcw size={15} /> Chơi lại
            </button>
            <button
              type="button"
              className="vf-g-btn"
              onClick={handleReturnToSetup}
              data-testid="chase-change-mode-btn"
            >
              <SlidersHorizontal size={15} /> Đổi chế độ
            </button>
            <button
              type="button"
              className="vf-g-btn"
              onClick={() => setActiveTab("leaderboard")}
            >
              <Trophy size={15} /> Xem BXH
            </button>
          </div>
        </section>
      ) : (
        /* 16:9 CHASE STAGE (Pre-Game Setup Overlay OR Live 2-Lane Chase Arena) */
        <div
          ref={stageRef}
          className={`vf-chase-stage ${
            phase === "setup" ? "vf-chase-stage--setup" : "vf-chase-stage--live"
          } ${isFullscreen ? "vf-chase-stage--fullscreen" : ""}`}
          data-testid="chase-stage"
        >
          {/* Seamless Infinite Scrolling Scenic Backdrop Layers with 1.1s Opacity Cross-Fade */}
          <div className="vf-chase-backdrop" aria-hidden="true">
            {scenes.map((scene, idx) => {
              const isActive = idx === activeSceneIndex;
              return (
                <div
                  key={scene.id}
                  className={`vf-chase-scene-layer ${
                    isActive ? "vf-chase-scene-layer--active" : ""
                  }`}
                >
                  <div
                    className={`vf-chase-bg-track ${
                      isScrolling ? "vf-chase-bg-track--scrolling" : ""
                    }`}
                  >
                    <img
                      src={scene.image}
                      alt=""
                      className="vf-chase-bg-tile"
                      draggable={false}
                      decoding="async"
                    />
                    <img
                      src={scene.image}
                      alt=""
                      className="vf-chase-bg-tile vf-chase-bg-tile--mirrored"
                      draggable={false}
                      decoding="async"
                    />
                    <img
                      src={scene.image}
                      alt=""
                      className="vf-chase-bg-tile"
                      draggable={false}
                      decoding="async"
                    />
                  </div>
                </div>
              );
            })}
            <div className="vf-chase-scrim" />
          </div>

          {/* PRE-GAME SETUP OVERLAY */}
          {phase === "setup" ? (
            <div className="vf-chase-setup-overlay" data-testid="chase-setup-overlay">
              <div className="vf-chase-setup-card">
                <div className="vf-chase-setup-head">
                  <div>
                    <h3 className="vf-chase-setup-title">
                      Đuổi Bắt Đồng Nghĩa – Trái Nghĩa
                    </h3>
                    <p className="vf-chase-setup-sub">
                      Giúp chú mèo nhảy qua rào chắn hoặc bứt tốc chạy thẳng để thoát khỏi chú cún!
                      {activeTopicId && activeTopicId !== "all" && TOPIC_META[activeTopicId]
                        ? ` · Ưu tiên chủ đề: ${TOPIC_META[activeTopicId].titleVi}`
                        : ""}
                    </p>
                  </div>
                </div>

                {/* 1. Mode Selection */}
                <div className="vf-chase-setup-section">
                  <div className="vf-chase-setup-label">Chọn chế độ chơi</div>
                  <div
                    className="vf-chase-mode-cards"
                    role="radiogroup"
                    aria-label="Chọn chế độ chơi"
                  >
                    {modes.map((m) => {
                      const active = selectedMode === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          className={`vf-chase-mode-card ${
                            active ? "vf-chase-mode-card--active" : ""
                          }`}
                          onClick={() => setSelectedMode(m.id)}
                          data-testid={`chase-mode-${m.id}`}
                        >
                          <span className="vf-chase-mode-card-title">{m.labelVi}</span>
                          <span className="vf-chase-mode-card-short">{m.shortVi}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Scene Selection & Auto-Rotate Toggle */}
                <div className="vf-chase-setup-section">
                  <div className="vf-chase-setup-label-row">
                    <span className="vf-chase-setup-label">Khung cảnh rượt đuổi</span>
                    <label className="vf-chase-toggle">
                      <input
                        type="checkbox"
                        checked={autoRotateScene}
                        onChange={(e) => setAutoRotateScene(e.target.checked)}
                        data-testid="chase-auto-scene-toggle"
                      />
                      <span className="vf-chase-toggle-track" aria-hidden="true" />
                      <span className="vf-chase-toggle-text">
                        Tự đổi cảnh sau mỗi 3 câu
                      </span>
                    </label>
                  </div>

                  <div className="vf-chase-scene-grid">
                    {scenes.map((scene) => {
                      const active = startSceneId === scene.id;
                      return (
                        <button
                          key={scene.id}
                          type="button"
                          className={`vf-chase-scene-card ${
                            active ? "vf-chase-scene-card--active" : ""
                          }`}
                          onClick={() => setStartSceneId(scene.id)}
                          data-testid={`chase-scene-${scene.id}`}
                        >
                          <div className="vf-chase-scene-thumb">
                            <img
                              src={scene.image}
                              alt={scene.labelVi}
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                          <span className="vf-chase-scene-name">{scene.labelVi}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Chill Music Toggle & Start CTA */}
                <div className="vf-chase-setup-footer">
                  <label className="vf-chase-toggle">
                    <input
                      type="checkbox"
                      checked={musicEnabled}
                      onChange={(e) => setMusicEnabled(e.target.checked)}
                      data-testid="chase-music-toggle"
                    />
                    <span className="vf-chase-toggle-track" aria-hidden="true" />
                    <span className="vf-chase-toggle-text">
                      <Music size={14} /> Nhạc nền Chilling Lo-Fi
                    </span>
                  </label>

                  <div className="vf-chase-setup-actions">
                    {onBack && (
                      <button
                        type="button"
                        className="vf-g-btn vf-g-btn--ghost vf-g-btn--sm"
                        onClick={onBack}
                      >
                        <ArrowLeft size={14} /> Danh sách
                      </button>
                    )}
                    <button
                      type="button"
                      className="vf-g-btn vf-g-btn--primary vf-g-btn--lg vf-chase-start-btn"
                      onClick={handleStartRun}
                      data-testid="chase-start-btn"
                    >
                      <Play size={16} /> Bắt đầu rượt đuổi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* LIVE 2-LANE CHASE ARENA */
            <>
              {/* TOP-LEFT HUD */}
              <div className="vf-chase-hud-left">
                <button
                  type="button"
                  className="vf-chase-hud-circle"
                  onClick={handleReturnToSetup}
                  aria-label="Quay lại thiết lập"
                  title="Đổi chế độ / bối cảnh"
                  data-testid="chase-hud-back"
                >
                  <ArrowLeft size={17} />
                </button>

                <div
                  className="vf-chase-score-pill vf-g-mono"
                  data-testid="chase-score-pill"
                >
                  Điểm: {score}
                </div>

                <div
                  className="vf-chase-hearts-pill"
                  aria-label={`Còn ${hearts} trên ${MAX_HEARTS} tim`}
                  data-testid="chase-hearts-pill"
                >
                  {Array.from({ length: MAX_HEARTS }).map((_, idx) => (
                    <Heart
                      key={idx}
                      size={16}
                      className={`vf-chase-heart ${
                        idx < hearts ? "vf-chase-heart--full" : "vf-chase-heart--lost"
                      }`}
                    />
                  ))}
                </div>

                {streak > 0 && (
                  <div
                    className="vf-chase-streak-pill vf-g-mono"
                    data-testid="chase-streak-pill"
                  >
                    <Flame size={14} /> ×{streak}
                  </div>
                )}

                <div className="vf-chase-context-pill">
                  <span>{MODE_LABELS[selectedMode] || "Đồng nghĩa"}</span>
                  <span className="vf-chase-pill-sep">·</span>
                  <span>{activeScene.labelVi}</span>
                  <span className="vf-chase-pill-sep">·</span>
                  <span className="vf-g-mono">
                    {currentIndex + 1}/{questions.length}
                  </span>
                </div>
              </div>

              {/* TOP-RIGHT HUD */}
              <div className="vf-chase-hud-right">
                <button
                  type="button"
                  className="vf-chase-hud-circle"
                  onClick={handleToggleMute}
                  aria-label={isMuted ? "Bật nhạc nền" : "Tắt nhạc nền"}
                  title={isMuted ? "Bật nhạc nền chilling" : "Tắt nhạc nền"}
                  data-testid="chase-hud-mute"
                >
                  {isMuted ? <VolumeX size={17} /> : <Music size={17} />}
                </button>

                <button
                  type="button"
                  className="vf-chase-hud-circle"
                  onClick={() => handleSpeakWord(currentQuestion?.promptWord)}
                  aria-label="Nghe từ gợi ý tiếng Việt"
                  title="Nghe phát âm từ gợi ý"
                  data-testid="chase-hud-speak"
                >
                  <Volume2 size={17} />
                </button>

                <button
                  type="button"
                  className="vf-chase-hud-circle"
                  onClick={handleToggleFullscreen}
                  aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                  title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                  data-testid="chase-hud-fullscreen"
                >
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>

              {/* SCENE CHANGE FLOATING BADGE */}
              {sceneToast && (
                <div
                  className="vf-chase-scene-toast"
                  role="status"
                  aria-live="polite"
                  data-testid="chase-scene-toast"
                >
                  <RefreshCw size={13} /> Đang chạy qua: <strong>{sceneToast}</strong>
                </div>
              )}

              {/* LEFT HALF: ANIMATED DOG CHASING CAT + STRIPED WOODEN HURDLE */}
              <div className="vf-chase-actors-layer" aria-hidden="true">
                {/* Golden Dog chasing behind */}
                <div
                  className={`vf-chase-actor vf-chase-dog vf-chase-dog--${dogAnim}`}
                  style={{ left: `${dogLeftPct}%` }}
                >
                  <span className="vf-chase-shadow vf-chase-shadow--dog" />
                  <span className="vf-chase-dust vf-chase-dust--1" />
                  <span className="vf-chase-dust vf-chase-dust--2" />
                  <div className="vf-chase-sprite-viewport vf-chase-sprite-viewport--dog">
                    <img
                      src={dogSheet.src}
                      alt=""
                      width={DOG_CELL_WIDTH * (dogSheet.frames || 4)}
                      height={DOG_CELL_HEIGHT}
                      className={`vf-chase-sprite-sheet vf-chase-sprite-sheet--dog ${
                        isScrolling ? "" : "vf-chase-sprite-sheet--paused"
                      }`}
                      draggable={false}
                      decoding="async"
                    />
                  </div>
                </div>

                {/* Brown Tabby Cat running ahead & leaping/dashing */}
                <div
                  className={`vf-chase-actor vf-chase-cat vf-chase-cat--${catAnim}`}
                >
                  <span
                    className={`vf-chase-shadow vf-chase-shadow--cat ${
                      catAnim === "jump" ? "vf-chase-shadow--airborne" : ""
                    }`}
                  />
                  <span className="vf-chase-dust vf-chase-dust--1" />
                  <div className="vf-chase-sprite-viewport vf-chase-sprite-viewport--cat">
                    <img
                      src={catSheet.src}
                      alt=""
                      width={CAT_CELL_WIDTH * (catSheet.frames || 4)}
                      height={CAT_CELL_HEIGHT}
                      className={`vf-chase-sprite-sheet vf-chase-sprite-sheet--cat ${
                        isScrolling ? "" : "vf-chase-sprite-sheet--paused"
                      }`}
                      draggable={false}
                      decoding="async"
                    />
                  </div>
                </div>

                {/* Striped Wooden Hurdle Barrier gliding on bottom path */}
                {currentQuestion && (
                  <HurdleBarrier
                    key={`hurdle-${currentIndex}`}
                    state={hurdleState}
                  />
                )}
              </div>

              {/* RIGHT HALF: EXACT IMAGE #2 TRANSLUCENT TWO-LANE DECISION SPLIT */}
              {currentQuestion && (
                <div className="vf-chase-lanes" data-testid="chase-lanes">
                  {/* Top Lane: NHẢY */}
                  <button
                    type="button"
                    className={`vf-chase-lane vf-chase-lane--top ${
                      feedback
                        ? feedback.correctLane === "top"
                          ? "vf-chase-lane--correct"
                          : feedback.selectedLane === "top"
                            ? "vf-chase-lane--wrong"
                            : "vf-chase-lane--dim"
                        : ""
                    }`}
                    onClick={() => handleSelectLane("top")}
                    disabled={feedback !== null}
                    data-testid="chase-lane-top"
                  >
                    <span className="vf-chase-lane-badge">
                      <ChevronsUp size={14} /> NHẢY
                      <kbd className="vf-chase-kbd">↑</kbd>
                    </span>
                    <span className="vf-chase-lane-word vf-g-serif">
                      {currentQuestion.topOption}
                    </span>
                    {scorePop && scorePop.lane === "top" && (
                      <span
                        key={scorePop.id}
                        className={`vf-chase-score-pop vf-chase-score-pop--${scorePop.tone}`}
                      >
                        {scorePop.text}
                      </span>
                    )}
                  </button>

                  {/* Bottom Lane: CHẠY THẲNG */}
                  <button
                    type="button"
                    className={`vf-chase-lane vf-chase-lane--bottom ${
                      feedback
                        ? feedback.correctLane === "bottom"
                          ? "vf-chase-lane--correct"
                          : feedback.selectedLane === "bottom"
                            ? "vf-chase-lane--wrong"
                            : "vf-chase-lane--dim"
                        : ""
                    }`}
                    onClick={() => handleSelectLane("bottom")}
                    disabled={feedback !== null}
                    data-testid="chase-lane-bottom"
                  >
                    <span className="vf-chase-lane-badge">
                      <ArrowRight size={14} /> CHẠY THẲNG
                      <kbd className="vf-chase-kbd">↓</kbd>
                    </span>
                    <span className="vf-chase-lane-word vf-g-serif">
                      {currentQuestion.bottomOption}
                    </span>
                    {scorePop && scorePop.lane === "bottom" && (
                      <span
                        key={scorePop.id}
                        className={`vf-chase-score-pop vf-chase-score-pop--${scorePop.tone}`}
                      >
                        {scorePop.text}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* CONCISE EXPLANATION FEEDBACK BANNER */}
              {feedback && (
                <div
                  className={`vf-chase-feedback ${
                    feedback.isCorrect
                      ? "vf-chase-feedback--good"
                      : "vf-chase-feedback--bad"
                  }`}
                  role="status"
                  aria-live="polite"
                  data-testid="chase-feedback"
                >
                  <div className="vf-chase-feedback-head">
                    {feedback.isCorrect ? (
                      <>
                        <CheckCircle2 size={15} /> Chính xác! +{feedback.pointsGained} điểm
                      </>
                    ) : (
                      <>
                        <XCircle size={15} />{" "}
                        {feedback.isTimeout ? "Hết giờ" : "Chưa chính xác"} · Đáp án:{" "}
                        <strong>{feedback.correctAnswer}</strong>
                      </>
                    )}
                  </div>
                  {feedback.explanationVi && (
                    <div className="vf-chase-feedback-body">{feedback.explanationVi}</div>
                  )}
                </div>
              )}

              {/* BOTTOM-CENTER PROMPT PILL (exact Image #2 placement!) */}
              {currentQuestion && (
                <div className="vf-chase-prompt-pill" data-testid="chase-prompt-pill">
                  <div
                    className={`vf-chase-prompt-kicker ${
                      promptIsSynonym
                        ? "vf-chase-prompt-kicker--synonym"
                        : "vf-chase-prompt-kicker--antonym"
                    }`}
                  >
                    {promptIsSynonym
                      ? "CHỌN TỪ ĐỒNG NGHĨA VỚI:"
                      : "CHỌN TỪ TRÁI NGHĨA VỚI:"}
                  </div>

                  <div className="vf-chase-prompt-main">
                    <span
                      className="vf-chase-prompt-word vf-g-serif"
                      data-testid="chase-prompt-word"
                    >
                      {currentQuestion.promptWord}
                    </span>
                    {currentQuestion.pos && (
                      <span className="vf-chase-prompt-pos">
                        · {currentQuestion.pos}
                      </span>
                    )}
                    <button
                      type="button"
                      className="vf-chase-prompt-speak"
                      onClick={() => handleSpeakWord(currentQuestion.promptWord)}
                      aria-label={`Nghe từ ${currentQuestion.promptWord}`}
                      data-testid="chase-prompt-speak-btn"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>

                  {/* Calm 14s Progress Bar along bottom edge of Prompt Pill */}
                  <div
                    className="vf-chase-timer-track"
                    aria-hidden="true"
                  >
                    <div
                      className={`vf-chase-timer-fill ${
                        timerPct <= 25 ? "vf-chase-timer-fill--low" : ""
                      }`}
                      style={{ width: `${timerPct}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SynonymAntonymChase;
