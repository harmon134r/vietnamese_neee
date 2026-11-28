import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { TOPICS, STARTER_DECKS, getTopicById, getContentStats } from "./data";
import {
  GAME_TYPES,
  createEmptySkillProgress,
  isValidTopicId,
} from "./lib/contracts";
import {
  addFlashcard,
  addFlashcardsBulk,
  createDeck,
  deleteDeck,
  deleteFlashcard,
  getStorageMode,
  loadDecks,
  loadGameHistory,
  loadSkillProgress,
  saveGameSession,
  setFlashcardMastery,
  updateDeck,
  updateFlashcard,
} from "./lib/storage";
import {
  getSession,
  getUserProfile,
  isSupabaseConfigured,
  isTeacherProfile,
  onAuthStateChange,
  resolveStudentDisplayName,
} from "./lib/supabase";
import { isD1Configured } from "./lib/d1Client";
import { stopSpeaking } from "./lib/speech";
import Navbar from "./components/layout/Navbar";
import BambooFrame from "./components/layout/BambooFrame";
import BottomRunner from "./components/layout/BottomRunner";
import Dashboard from "./components/layout/Dashboard";
import TopicOverview from "./components/layout/TopicOverview";
import AuthModal from "./components/layout/AuthModal";
import FlashcardStudio from "./components/flashcards/FlashcardStudio";
import GameHub from "./components/games/GameHub";

export function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [activeTopicId, setActiveTopicId] = useState("all");
  const [overviewTopicId, setOverviewTopicId] = useState("self");
  const [initialGame, setInitialGame] = useState("hub");
  const [flashcardTopicFilter, setFlashcardTopicFilter] = useState("all");
  const [flashcardInitialTab, setFlashcardInitialTab] = useState("study");
  const [flashcardCreatorTab, setFlashcardCreatorTab] = useState("single");
  const [flashcardCreateNewDeck, setFlashcardCreateNewDeck] = useState(false);

  const [decks, setDecks] = useState([]);
  const [activeDeckId, setActiveDeckId] = useState("");
  const [skillProgress, setSkillProgress] = useState(() => createEmptySkillProgress());
  const [gameHistory, setGameHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [storageMode, setStorageMode] = useState("local");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const toastTimerRef = useRef(new Map());
  const hydrateInFlightRef = useRef(null);
  const hydrateQueuedRef = useRef(false);
  const lastAuthUserIdRef = useRef(undefined);
  const decksRef = useRef(decks);
  decksRef.current = decks;

  const isTeacher = useMemo(
    () => Boolean(isTeacherProfile?.(userProfile, user)),
    [userProfile, user]
  );

  const teacherName = useMemo(
    () =>
      user
        ? resolveStudentDisplayName(
            userProfile,
            user,
            isTeacher ? "Giáo viên" : "Học sinh"
          )
        : "",
    [userProfile, user, isTeacher]
  );

  const contentStats = useMemo(() => {
    try {
      return typeof getContentStats === "function" ? getContentStats() : {};
    } catch {
      return {};
    }
  }, []);

  const dismissToast = useCallback((id) => {
    const timer = toastTimerRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimerRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = "info") => {
      if (!message) return;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
        toastTimerRef.current.delete(id);
      }, 4200);
      toastTimerRef.current.set(id, timer);
    },
    []
  );

  useEffect(() => {
    const timers = toastTimerRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const runHydrateOnce = useCallback(async () => {
    try {
      const [loadedDecks, loadedProgress, loadedHistory, mode] = await Promise.all([
        loadDecks(STARTER_DECKS),
        loadSkillProgress(),
        loadGameHistory({ limit: 25 }),
        getStorageMode(),
      ]);

      setDecks(loadedDecks);
      setActiveDeckId((prev) => {
        if (prev && loadedDecks.some((d) => d.id === prev)) return prev;
        return loadedDecks[0]?.id || "";
      });
      setSkillProgress(loadedProgress);
      setGameHistory(loadedHistory);
      setStorageMode(mode);
    } catch (err) {
      console.error("Failed to load munnn01 data:", err);
      notify("Không thể tải đầy đủ dữ liệu. Đã dùng bộ khởi tạo mặc định.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  const hydrateData = useCallback(() => {
    if (hydrateInFlightRef.current) {
      hydrateQueuedRef.current = true;
      return hydrateInFlightRef.current;
    }

    const execute = (async () => {
      try {
        do {
          hydrateQueuedRef.current = false;
          await runHydrateOnce();
        } while (hydrateQueuedRef.current);
      } finally {
        hydrateInFlightRef.current = null;
      }
    })();

    hydrateInFlightRef.current = execute;
    return execute;
  }, [runHydrateOnce]);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      let initialUserId = null;
      try {
        const { user: sessionUser } = await getSession();
        if (!active) return;
        initialUserId = sessionUser?.id || null;
        setUser(sessionUser);
        if (sessionUser) {
          const profile = await getUserProfile(sessionUser.id);
          if (active) setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      } catch {
        // graceful local fallback
      }
      if (active) {
        lastAuthUserIdRef.current = initialUserId;
        await hydrateData();
      }
    }

    bootstrap();

    const unsubscribe = onAuthStateChange(async (event, session) => {
      if (!active) return;
      // Ignore mount-time INITIAL_SESSION and background TOKEN_REFRESHED events
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
        return;
      }
      const nextUser = session?.user || null;
      const nextUserId = nextUser?.id || null;
      setUser(nextUser);
      if (nextUser) {
        try {
          const profile = await getUserProfile(nextUser.id);
          if (active) setUserProfile(profile);
        } catch {
          if (active) setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      if (event === "SIGNED_IN" && nextUserId === lastAuthUserIdRef.current) {
        return;
      }
      lastAuthUserIdRef.current = nextUserId;
      await hydrateData();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [hydrateData]);

  // Stop any playing Vietnamese TTS whenever switching top-level views
  useEffect(() => {
    stopSpeaking();
  }, [activeView]);

  // Navigation helpers
  const handleNavigate = useCallback((view) => {
    stopSpeaking();
    setActiveView(view);
    if (view === "games") {
      setInitialGame("hub");
    }
    if (view === "flashcards") {
      setFlashcardInitialTab("study");
      setFlashcardCreatorTab("single");
      setFlashcardCreateNewDeck(false);
    }
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }, []);

  const handleLaunchGame = useCallback((gameId = "hub", topicId = "all") => {
    stopSpeaking();
    setActiveTopicId(topicId === "all" || isValidTopicId(topicId) ? topicId : "all");
    setInitialGame(gameId || "hub");
    setActiveView("games");
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }, []);

  const handleOpenFlashcards = useCallback(
    (topicId = "all", initialTab = "study", options = {}) => {
      stopSpeaking();
      const validTopic = isValidTopicId(topicId) ? topicId : "all";
      const nextCreatorTab = options?.creatorTab || "single";
      const nextNewDeck = Boolean(options?.newDeck);

      setFlashcardTopicFilter(options?.deckId ? "all" : validTopic);
      setFlashcardInitialTab(initialTab);
      setFlashcardCreatorTab(nextCreatorTab);
      setFlashcardCreateNewDeck(nextNewDeck);

      if (options?.deckId) {
        setActiveDeckId(options.deckId);
      } else if (validTopic !== "all") {
        const matchingDeck = decks.find((d) => d.topicId === validTopic);
        if (matchingDeck) setActiveDeckId(matchingDeck.id);
      }
      setActiveView("flashcards");
      window.scrollTo?.({ top: 0, behavior: "smooth" });
    },
    [decks]
  );

  const handleOpenAssignedDeck = useCallback(
    (deckId, initialTab = "study") => {
      handleOpenFlashcards("all", initialTab, { deckId });
    },
    [handleOpenFlashcards]
  );

  const handleOpenTeacherPdfUpload = useCallback(() => {
    handleOpenFlashcards("all", "create", { creatorTab: "pdf", newDeck: true });
  }, [handleOpenFlashcards]);

  const handleCreateFlashcardShortcut = useCallback(() => {
    handleOpenFlashcards("all", "create");
  }, [handleOpenFlashcards]);

  const handleOpenTopicOverview = useCallback((topicId) => {
    stopSpeaking();
    const target = isValidTopicId(topicId) ? topicId : "self";
    setOverviewTopicId(target);
    setActiveView("topics");
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }, []);

  // =========================================================================
  // Flashcard & Deck CRUD Handlers (persisted via storage.js)
  // =========================================================================

  const handleCreateDeck = useCallback(
    async (deckInput) => {
      const created = await createDeck(deckInput);
      setDecks((prev) => [created, ...prev]);
      setActiveDeckId(created.id);
      notify(
        created.isAssigned
          ? `Đã tạo và giao bộ thẻ “${created.title}” cho học sinh.`
          : `Đã tạo bộ thẻ “${created.title}”.`,
        "success"
      );
      return created;
    },
    [notify]
  );

  const handleUpdateDeck = useCallback(
    async (deckId, updates) => {
      const updated = await updateDeck(deckId, updates);
      setDecks((prev) => prev.map((d) => (d.id === deckId ? updated : d)));
      if (updates?.isAssigned === true) {
        notify(`Đã giao bộ thẻ “${updated.title}” cho học sinh.`, "success");
      } else if (updates?.isAssigned === false) {
        notify(`Đã gỡ giao bộ thẻ “${updated.title}” khỏi danh sách lớp.`, "info");
      } else {
        notify("Đã cập nhật thông tin bộ thẻ.", "success");
      }
      return updated;
    },
    [notify]
  );

  const handleDeleteDeck = useCallback(
    async (deckId) => {
      await deleteDeck(deckId);
      setDecks((prev) => {
        const remaining = prev.filter((d) => d.id !== deckId);
        setActiveDeckId((curr) => (curr === deckId ? remaining[0]?.id || "" : curr));
        return remaining;
      });
      notify("Đã xóa bộ thẻ.", "info");
    },
    [notify]
  );

  const handleAddCard = useCallback(
    async (deckId, cardInput) => {
      const targetDeckId = deckId || activeDeckId || decks[0]?.id;
      if (!targetDeckId) {
        throw new Error("Vui lòng chọn hoặc tạo bộ thẻ trước khi thêm flashcard.");
      }
      const created = await addFlashcard(targetDeckId, cardInput);
      setDecks((prev) =>
        prev.map((d) =>
          d.id === targetDeckId
            ? { ...d, cards: [...d.cards, created], cardCount: d.cards.length + 1 }
            : d
        )
      );
      notify(`Đã thêm thẻ “${created.frontVi}”.`, "success");
      return created;
    },
    [activeDeckId, decks, notify]
  );

  const handleAddCardsBulk = useCallback(
    async (deckId, cardsInput) => {
      const targetDeckId = deckId || activeDeckId || decks[0]?.id;
      if (!targetDeckId) {
        throw new Error("Vui lòng chọn hoặc tạo bộ thẻ trước khi nhập hàng loạt.");
      }
      const added = await addFlashcardsBulk(targetDeckId, cardsInput);
      setDecks((prev) =>
        prev.map((d) =>
          d.id === targetDeckId
            ? { ...d, cards: [...d.cards, ...added], cardCount: d.cards.length + added.length }
            : d
        )
      );
      notify(`Đã thêm ${added.length} thẻ mới.`, "success");
      return added;
    },
    [activeDeckId, decks, notify]
  );

  const handleUpdateCard = useCallback(
    async (cardId, updates) => {
      const updated = await updateFlashcard(cardId, updates);
      setDecks((prev) =>
        prev.map((d) => ({
          ...d,
          cards: d.cards.map((c) => (c.id === cardId ? updated : c)),
        }))
      );
      notify("Đã lưu thay đổi flashcard.", "success");
      return updated;
    },
    [notify]
  );

  const handleDeleteCard = useCallback(
    async (cardId) => {
      await deleteFlashcard(cardId);
      setDecks((prev) =>
        prev.map((d) => {
          const nextCards = d.cards.filter((c) => c.id !== cardId);
          return nextCards.length === d.cards.length
            ? d
            : { ...d, cards: nextCards, cardCount: nextCards.length };
        })
      );
      notify("Đã xóa flashcard.", "info");
    },
    [notify]
  );

  const handleUpdateMastery = useCallback(async (cardId, masteryLevel) => {
    const targetDeck = (decksRef.current || []).find((d) =>
      (d.cards || []).some((c) => c.id === cardId)
    );
    const isAssignedDeck = Boolean(
      targetDeck?.isAssigned && targetDeck?.canEdit === false
    );
    const updated = await setFlashcardMastery(cardId, masteryLevel, {
      deckId: targetDeck?.id,
      isAssignedDeck,
    });
    setDecks((prev) =>
      prev.map((d) => ({
        ...d,
        cards: d.cards.map((c) =>
          c.id === cardId
            ? {
                ...c,
                ...(updated && typeof updated === "object" ? updated : {}),
                masteryLevel: updated?.masteryLevel ?? masteryLevel,
              }
            : c
        ),
      }))
    );
    return updated;
  }, []);

  // =========================================================================
  // Game & Practice Session Persistence
  // =========================================================================

  const handleCompleteSession = useCallback(
    async (result = {}) => {
      try {
        const normalizedPayload = {
          ...result,
          topicId: isValidTopicId(result.topicId) ? result.topicId : null,
          durationSeconds: result.durationSeconds ?? result.durationSec ?? 0,
        };
        const prevXp = Number(skillProgress?.xp || 0);
        const { session, progress } = await saveGameSession(normalizedPayload);
        setSkillProgress(progress);
        setGameHistory((prev) => [session, ...prev].slice(0, 25));

        const earnedXp = Math.max(0, Math.round((progress?.xp || 0) - prevXp));
        const topic = session.topicId ? getTopicById?.(session.topicId) : null;
        notify(
          `Hoàn thành${topic ? ` (${topic.titleVi})` : ""}! +${earnedXp || 10} XP · ${Math.round(
            session.accuracy
          )}% chính xác.`,
          "success"
        );
      } catch (err) {
        console.error("Failed to save game session:", err);
        notify("Không thể lưu kết quả phiên luyện tập.", "error");
      }
    },
    [notify, skillProgress?.xp]
  );

  const handleRecordPractice = useCallback(
    async (payload = {}) => {
      try {
        const normalizedPayload = {
          gameType: payload.gameType || GAME_TYPES.FLASHCARD_REVIEW,
          topicId: isValidTopicId(payload.topicId) ? payload.topicId : null,
          skillTags:
            Array.isArray(payload.skillTags) && payload.skillTags.length > 0
              ? payload.skillTags
              : ["reading", "pronunciation"],
          score: payload.score ?? 1,
          maxScore: payload.maxScore ?? 1,
          accuracy: payload.accuracy ?? 100,
          durationSeconds: payload.durationSeconds ?? payload.durationSec ?? 0,
          xpDelta: payload.xpDelta ?? 12,
          details: payload.details || {},
        };
        const { session, progress } = await saveGameSession(normalizedPayload);
        setSkillProgress(progress);
        setGameHistory((prev) => [session, ...prev].slice(0, 25));
      } catch (err) {
        console.warn("Could not record flashcard practice:", err);
      }
    },
    []
  );

  const handleAuthSuccess = useCallback(
    (nextUser, nextProfile) => {
      setUser(nextUser);
      setUserProfile(nextProfile || null);
      setStorageMode(
        nextUser
          ? isD1Configured()
            ? "cloudflare-d1"
            : isSupabaseConfigured
              ? "supabase"
              : "local"
          : "local"
      );
      if (!isSupabaseConfigured) {
        hydrateData();
      }
    },
    [hydrateData]
  );

  return (
    <div className="vf-app">
      <BambooFrame />

      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        skillProgress={skillProgress}
        user={user}
        userProfile={userProfile}
        isTeacher={isTeacher}
        storageMode={storageMode}
        isSupabaseConfigured={isSupabaseConfigured}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <main className="vf-main">
        {isLoading ? (
          <div className="vf-loading-screen" role="status" aria-live="polite">
            <div className="vf-spinner" />
            <span>Đang chuẩn bị bàn học...</span>
          </div>
        ) : (
          <>
            {activeView === "dashboard" && (
              <Dashboard
                topics={TOPICS}
                decks={decks}
                skillProgress={skillProgress}
                gameHistory={gameHistory}
                contentStats={contentStats}
                user={user}
                userProfile={userProfile}
                isTeacher={isTeacher}
                teacherName={teacherName}
                onLaunchGame={handleLaunchGame}
                onOpenFlashcards={(topicId) => handleOpenFlashcards(topicId, "study")}
                onOpenAssignedDeck={handleOpenAssignedDeck}
                onOpenTeacherPdfUpload={handleOpenTeacherPdfUpload}
                onCreateFlashcard={handleCreateFlashcardShortcut}
                onOpenTopicOverview={handleOpenTopicOverview}
              />
            )}

            {activeView === "games" && (
              <div className="vf-view-enter">
                <GameHub
                  activeTopicId={activeTopicId}
                  onSelectTopic={(tid) =>
                    setActiveTopicId(tid === "all" || isValidTopicId(tid) ? tid : "all")
                  }
                  initialGame={initialGame}
                  onCompleteSession={handleCompleteSession}
                  skillProgress={skillProgress}
                  onNavigateFlashcards={(topicId) =>
                    handleOpenFlashcards(topicId || activeTopicId, "study")
                  }
                />
              </div>
            )}

            {activeView === "flashcards" && (
              <div className="vf-view-enter">
                <FlashcardStudio
                  decks={decks}
                  activeDeckId={activeDeckId}
                  onSelectDeck={setActiveDeckId}
                  onCreateDeck={handleCreateDeck}
                  onUpdateDeck={handleUpdateDeck}
                  onDeleteDeck={handleDeleteDeck}
                  onAddCard={handleAddCard}
                  onAddCardsBulk={handleAddCardsBulk}
                  onUpdateCard={handleUpdateCard}
                  onDeleteCard={handleDeleteCard}
                  onUpdateMastery={handleUpdateMastery}
                  onRecordPractice={handleRecordPractice}
                  initialTopicFilter={flashcardTopicFilter}
                  initialTab={flashcardInitialTab}
                  initialCreatorTab={flashcardCreatorTab}
                  initialCreateNewDeck={flashcardCreateNewDeck}
                  isTeacher={isTeacher}
                  teacherName={teacherName}
                />
              </div>
            )}

            {activeView === "topics" && (
              <TopicOverview
                topics={TOPICS}
                selectedTopicId={overviewTopicId}
                onSelectTopic={setOverviewTopicId}
                skillProgress={skillProgress}
                decks={decks}
                onLaunchGame={handleLaunchGame}
                onOpenFlashcards={(topicId) => handleOpenFlashcards(topicId, "study")}
              />
            )}
          </>
        )}
      </main>

      <BottomRunner />

      <div className="vf-credit">@thembanhkhoai</div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
        userProfile={userProfile}
        isTeacher={isTeacher}
        onAuthSuccess={handleAuthSuccess}
        onSynced={hydrateData}
        onNotify={notify}
      />

      {toasts.length > 0 && (
        <div className="vf-toast-stack" role="region" aria-label="Thông báo" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`vf-toast vf-toast--${toast.type}`}>
              <span>{toast.message}</span>
              <button
                type="button"
                className="vf-toast-close"
                onClick={() => dismissToast(toast.id)}
                aria-label="Đóng thông báo"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
