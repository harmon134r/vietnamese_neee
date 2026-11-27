import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

const mockSpeak = vi.fn(() => Promise.resolve({ source: "api" }));
const mockStopSpeak = vi.fn();
const mockSetRate = vi.fn();
const mockSetVoice = vi.fn();
const mockPrefetch = vi.fn();
const mockStartListening = vi.fn();
const mockStopListening = vi.fn();
const mockResetTranscript = vi.fn();

const speechHookState = {
  isSpeaking: false,
  speakingText: "",
  rate: 1,
  setRate: mockSetRate,
  voice: "random",
  setVoice: mockSetVoice,
  prefetch: mockPrefetch,
  speak: mockSpeak,
  stopSpeak: mockStopSpeak,
  isListening: false,
  sttSupported: true,
  interimTranscript: "",
  finalTranscript: "",
  micLevel: 0,
  lastRecordingUrl: null,
  startListening: mockStartListening,
  stopListening: mockStopListening,
  resetTranscript: mockResetTranscript,
  speechError: null,
};

vi.mock("../../lib/speech", () => {
  const RANDOM_VOICE = {
    id: "random",
    label: "Ngẫu nhiên",
    shortLabel: "Xoay vòng 5 giọng Bắc",
    gender: "mixed",
    region: "Bắc",
    style: "Tự động chọn trong 5 giọng Miền Bắc",
  };
  const NORTHERN_VOICES = [
    { id: "ngochuyen", label: "Ngọc Huyền", shortLabel: "Nữ · Bắc · Tự nhiên", gender: "female", region: "Bắc", style: "Giọng đọc tự nhiên" },
    { id: "trucly", label: "Trúc Ly", shortLabel: "Nữ · Bắc · Tự nhiên", gender: "female", region: "Bắc", style: "Phong cách tự nhiên" },
    { id: "maianh", label: "Mai Anh", shortLabel: "Nữ · Bắc · Tin tức rõ chữ", gender: "female", region: "Bắc", style: "Phong cách tin tức rõ chữ" },
    { id: "haidang", label: "Hải Đăng", shortLabel: "Nam · Bắc · Tự nhiên", gender: "male", region: "Bắc", style: "Phong cách tự nhiên" },
    { id: "thienminh", label: "Thiện Minh", shortLabel: "Nam · Bắc · Kể chuyện", gender: "male", region: "Bắc", style: "Phong cách kể chuyện" },
  ];
  const ALL_VOICE_OPTIONS = [RANDOM_VOICE, ...NORTHERN_VOICES];
  return {
    RANDOM_VOICE_ID: "random",
    DEFAULT_VOICE_ID: "random",
    RANDOM_VOICE_OPTION: RANDOM_VOICE,
    VIETNAMESE_VOICES: NORTHERN_VOICES,
    VOICE_OPTIONS: ALL_VOICE_OPTIONS,
    VOICE_STORAGE_KEY: "vietflow_tts_voice",
    VOICE_CHANGE_EVENT: "vietflow:voice-change",
    getSelectedVoice: vi.fn(() => "random"),
    setSelectedVoice: vi.fn((id) => id),
    getVoiceMeta: vi.fn((id) => ALL_VOICE_OPTIONS.find((v) => v.id === id) || RANDOM_VOICE),
    prefetchVietnamese: vi.fn(),
    speakVietnamese: vi.fn(() => Promise.resolve({ source: "api" })),
    stopSpeaking: vi.fn(),
    isSpeechRecognitionSupported: vi.fn(() => true),
    startVietnameseListening: vi.fn(() => ({ stop: vi.fn(), abort: vi.fn() })),
  };
});

vi.mock("../../hooks/useVietnameseSpeech", () => ({
  useVietnameseSpeech: vi.fn(() => speechHookState),
  default: vi.fn(() => speechHookState),
}));

import { GameHub } from "./GameHub";
import { ListeningGame } from "./ListeningGame";
import { PronunciationLab } from "./PronunciationLab";
import { DialogueRoleplay } from "./DialogueRoleplay";
import { ReadingVocabGame } from "./ReadingVocabGame";
import { Navbar } from "../layout/Navbar";
import { TopicOverview } from "../layout/TopicOverview";
import { GAME_TYPES } from "../../lib/contracts";
import {
  prefetchVietnamese,
  setSelectedVoice,
  speakVietnamese,
} from "../../lib/speech";
import {
  DIALOGUE_SCENARIOS,
  LISTENING_EXERCISES,
  PRONUNCIATION_SENTENCES,
  READING_PASSAGES,
  SENTENCE_BUILDERS,
  TOPICS,
} from "../../data";

beforeEach(() => {
  vi.clearAllMocks();
  speechHookState.sttSupported = true;
  speechHookState.isListening = false;
  speechHookState.isSpeaking = false;
  speechHookState.finalTranscript = "";
  speechHookState.interimTranscript = "";
  speechHookState.speechError = null;
});

afterEach(() => {
  cleanup();
});

describe("GameHub", () => {
  it("renders all 4 game modes and all 6 topic filters plus All", () => {
    render(
      <GameHub
        activeTopicId="all"
        skillProgress={{
          listening: 65,
          speaking: 50,
          reading: 72,
          pronunciation: 40,
        }}
      />
    );

    expect(screen.getByTestId("game-hub")).toBeInTheDocument();
    expect(screen.getByTestId("game-mode-card-listening")).toBeInTheDocument();
    expect(screen.getByTestId("game-mode-card-pronunciation")).toBeInTheDocument();
    expect(screen.getByTestId("game-mode-card-dialogue")).toBeInTheDocument();
    expect(screen.getByTestId("game-mode-card-reading")).toBeInTheDocument();

    expect(screen.getByTestId("topic-pill-all")).toBeInTheDocument();
    for (const topic of TOPICS) {
      expect(screen.getByTestId(`topic-pill-${topic.id}`)).toBeInTheDocument();
    }
  });

  it("shows topic spotlight with key phrases and grammar when a topic is clicked", () => {
    const onSelectTopic = vi.fn();
    render(<GameHub activeTopicId="all" onSelectTopic={onSelectTopic} />);

    fireEvent.click(screen.getByTestId("topic-pill-food"));
    expect(onSelectTopic).toHaveBeenCalledWith("food");

    const spotlight = screen.getByTestId("topic-spotlight");
    expect(spotlight).toBeInTheDocument();
    expect(within(spotlight).getByText(/Điểm ngữ pháp nổi bật/i)).toBeInTheDocument();

    const firstPhrase = TOPICS.find((t) => t.id === "food").keyPhrases[0];
    fireEvent.click(within(spotlight).getByText(firstPhrase.vi));
    expect(speakVietnamese).toHaveBeenCalledWith(firstPhrase.vi, expect.any(Object));
  });

  it("launches a game mode and cleanly navigates back to hub", () => {
    render(<GameHub activeTopicId="self" />);

    fireEvent.click(screen.getByTestId("launch-game-listening"));
    expect(screen.getByTestId("listening-game")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("game-back-to-hub"));
    expect(screen.getByTestId("game-hub")).toBeInTheDocument();
  });

  it("respects initialGame prop for direct deep-linking from Dashboard", () => {
    render(<GameHub activeTopicId="weather" initialGame="dialogue" />);
    expect(screen.getByTestId("dialogue-picker")).toBeInTheDocument();
  });
});

describe("ListeningGame", () => {
  it("plays audio, tracks replays, checks answers, and completes a topic round", () => {
    const onCompleteSession = vi.fn();
    const selfExercises = LISTENING_EXERCISES.filter((e) => e.topicId === "self");

    render(
      <ListeningGame
        activeTopicId="self"
        onCompleteSession={onCompleteSession}
      />
    );

    // Prefetches current + next 2 exercises on mount
    expect(prefetchVietnamese).toHaveBeenCalledWith(
      selfExercises.slice(0, 3).map((e) => e.audioTextVi),
      { voice: "random" }
    );

    // Play audio and verify replay count increments
    fireEvent.click(screen.getByTestId("listening-play-btn"));
    expect(mockSpeak).toHaveBeenCalledWith(
      selfExercises[0].audioTextVi,
      expect.objectContaining({ rate: 1 })
    );
    expect(screen.getByTestId("listening-replay-count")).toHaveTextContent("1");

    // Answer every exercise in the 'self' topic round
    for (let i = 0; i < selfExercises.length; i += 1) {
      const ex = selfExercises[i];
      fireEvent.click(screen.getByTestId(`listening-option-${ex.correctOptionId}`));
      expect(screen.getByTestId("listening-feedback")).toBeInTheDocument();
      expect(screen.getByTestId("listening-transcript")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("listening-next-btn"));
    }

    expect(screen.getByTestId("listening-summary")).toBeInTheDocument();
    expect(onCompleteSession).toHaveBeenCalledTimes(1);
    expect(onCompleteSession).toHaveBeenCalledWith(
      expect.objectContaining({
        gameType: GAME_TYPES.LISTEN_MATCH,
        topicId: "self",
        skillTags: ["listening", "reading"],
        score: selfExercises.length,
        maxScore: selfExercises.length,
        accuracy: 100,
      })
    );
  });
});

describe("PronunciationLab", () => {
  it("renders 6-tone contour legend, switches to Sentence Shadowing, scores tone errors via fallback, and saves session", () => {
    const onCompleteSession = vi.fn();
    const firstSelfSentence = PRONUNCIATION_SENTENCES.find((s) => s.topicId === "self");

    // Simulate browser without STT to test graceful fallback mode
    speechHookState.sttSupported = false;

    render(
      <PronunciationLab
        activeTopicId="self"
        onCompleteSession={onCompleteSession}
      />
    );

    expect(screen.getByTestId("pronunciation-pairs-view")).toBeInTheDocument();
    expect(screen.getByText(/Biểu đồ 6 Thanh Điệu Tiếng Việt/i)).toBeInTheDocument();
    expect(prefetchVietnamese).toHaveBeenCalledWith(
      expect.any(Array),
      { voice: "random" }
    );

    // Switch to Sentence Shadowing tab
    prefetchVietnamese.mockClear();
    fireEvent.click(screen.getByTestId("pronunciation-tab-shadowing"));
    expect(screen.getByTestId("pronunciation-shadowing-view")).toBeInTheDocument();
    expect(prefetchVietnamese).toHaveBeenCalledWith(
      expect.arrayContaining([firstSelfSentence.textVi]),
      { voice: "random" }
    );

    // Submit simulated Vietnamese sentence through fallback input
    const input = screen.getByTestId("shadowing-fallback-input");
    fireEvent.change(input, { target: { value: firstSelfSentence.textVi } });
    fireEvent.click(screen.getByTestId("shadowing-fallback-submit"));

    const evalBox = screen.getByTestId("shadowing-evaluation");
    expect(evalBox).toBeInTheDocument();
    expect(screen.getByTestId("pronunciation-word-diffs")).toBeInTheDocument();
    expect(within(evalBox).getAllByText("100%").length).toBeGreaterThanOrEqual(1);

    // Save session summary
    fireEvent.click(screen.getByTestId("pronunciation-finish-btn"));
    expect(screen.getByTestId("pronunciation-summary")).toBeInTheDocument();
    expect(onCompleteSession).toHaveBeenCalledTimes(1);
    expect(onCompleteSession).toHaveBeenCalledWith(
      expect.objectContaining({
        gameType: GAME_TYPES.PRONUNCIATION_LAB,
        topicId: "self",
        skillTags: ["pronunciation", "speaking", "listening"],
        accuracy: 100,
      })
    );
  });

  it("highlights tone-mismatch with expected vs spoken tone labels in minimal pair fallback", () => {
    speechHookState.sttSupported = false;
    render(<PronunciationLab activeTopicId="self" />);

    const input = screen.getByPlaceholderText(/Nhập từ bạn muốn chấm thử/i);
    // Target item 0 in mp-self-1 is "mới" (Thanh sắc); typing "mời" (Thanh huyền) triggers tone-mismatch
    fireEvent.change(input, { target: { value: "mời" } });
    fireEvent.click(screen.getByRole("button", { name: /Chấm thanh điệu/i }));

    const diffStrip = screen.getByTestId("pronunciation-word-diffs");
    expect(diffStrip).toHaveTextContent(/Cần: Sắc/i);
    expect(diffStrip).toHaveTextContent(/Nói: Huyền/i);
  });
});

describe("DialogueRoleplay", () => {
  it("runs a complete multi-turn roleplay using both intent matching and guided mode, then reports completion", () => {
    const onCompleteSession = vi.fn();
    const scenario = DIALOGUE_SCENARIOS[0];

    render(
      <DialogueRoleplay
        activeTopicId="all"
        onCompleteSession={onCompleteSession}
      />
    );

    fireEvent.click(screen.getByTestId(`dialogue-scenario-${scenario.id}`));
    expect(screen.getByTestId("dialogue-arena")).toBeInTheDocument();

    // Prefetches current NPC line + expected responses + next turn NPC line
    const turn0 = scenario.turns[0];
    const turn1 = scenario.turns.find(
      (t) => t.id === turn0.expectedResponses[0].nextTurnId
    );
    expect(prefetchVietnamese).toHaveBeenCalledWith(
      [
        turn0.npcTextVi,
        ...turn0.expectedResponses.map((r) => r.textVi),
        ...(turn1 ? [turn1.npcTextVi] : []),
      ],
      { voice: "random" }
    );

    // Turn 1: respond via Speak/Typed intent matching pipeline
    let activeTurn = scenario.turns[0];
    const firstOpt = activeTurn.expectedResponses[0];
    fireEvent.change(screen.getByTestId("dialogue-typed-input"), {
      target: { value: firstOpt.textVi },
    });
    fireEvent.click(screen.getByTestId("dialogue-typed-submit"));

    // Switch to Guided mode for remaining turns until completion
    fireEvent.click(screen.getByTestId("dialogue-mode-guided"));

    let nextTurnId = firstOpt.nextTurnId;
    let safety = 0;
    while (nextTurnId && safety < 10) {
      safety += 1;
      const turn = scenario.turns.find((t) => t.id === nextTurnId);
      if (!turn) break;
      const opt = turn.expectedResponses[0];
      fireEvent.click(screen.getByTestId(`dialogue-send-option-${opt.id}`));
      nextTurnId = opt.nextTurnId;
    }

    expect(screen.getByTestId("dialogue-report")).toBeInTheDocument();
    expect(onCompleteSession).toHaveBeenCalledTimes(1);
    expect(onCompleteSession).toHaveBeenCalledWith(
      expect.objectContaining({
        gameType: GAME_TYPES.DIALOGUE_BUILDER,
        topicId: scenario.topicId,
        skillTags: ["speaking", "listening", "pronunciation"],
      })
    );
  });
});

describe("ReadingVocabGame", () => {
  it("opens interactive glossary word cards and completes reading comprehension questions", () => {
    const onCompleteSession = vi.fn();
    const selfPassage = READING_PASSAGES.find((p) => p.topicId === "self");

    render(
      <ReadingVocabGame
        activeTopicId="self"
        onCompleteSession={onCompleteSession}
      />
    );

    expect(screen.getByTestId("reading-passage-view")).toBeInTheDocument();

    // Click first interactive glossary word in the passage
    const passageEl = screen.getByTestId("reading-passage-text");
    const glossaryButtons = passageEl.querySelectorAll("button[data-glossary-term]");
    expect(glossaryButtons.length).toBeGreaterThan(0);

    const firstGlossaryTerm = glossaryButtons[0].getAttribute("data-glossary-term");
    fireEvent.click(glossaryButtons[0]);

    const wordCard = screen.getByTestId("glossary-word-card");
    expect(wordCard).toBeInTheDocument();
    expect(within(wordCard).getByText(firstGlossaryTerm)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("glossary-speak-btn"));
    expect(mockSpeak).toHaveBeenCalledWith(firstGlossaryTerm, expect.any(Object));

    // Answer all comprehension questions
    selfPassage.questions.forEach((q, idx) => {
      fireEvent.click(screen.getByTestId(`reading-q-${idx}-opt-${q.correctIndex}`));
    });

    expect(screen.getByTestId("reading-passage-complete")).toBeInTheDocument();
    expect(onCompleteSession).toHaveBeenCalledTimes(1);
    expect(onCompleteSession).toHaveBeenCalledWith(
      expect.objectContaining({
        gameType: GAME_TYPES.READING_COMPREHENSION,
        topicId: "self",
        skillTags: ["reading", "listening"],
        accuracy: 100,
      })
    );
  });

  it("assembles Vietnamese sentences in Sentence Builder Sprint and completes round", () => {
    const onCompleteSession = vi.fn();
    const selfBuilders = SENTENCE_BUILDERS.filter((b) => b.topicId === "self");

    render(
      <ReadingVocabGame
        activeTopicId="self"
        initialSubMode="builder"
        onCompleteSession={onCompleteSession}
      />
    );

    expect(screen.getByTestId("sentence-builder-view")).toBeInTheDocument();
    expect(prefetchVietnamese).toHaveBeenCalledWith(
      selfBuilders.slice(0, 2).map((b) => b.targetSentenceVi),
      { voice: "random" }
    );

    for (const item of selfBuilders) {
      const bank = screen.getByTestId("builder-bank");
      for (const chunk of item.chunks) {
        const availableButtons = Array.from(bank.querySelectorAll("button")).filter(
          (btn) => !btn.disabled && btn.textContent === chunk
        );
        expect(availableButtons.length).toBeGreaterThan(0);
        fireEvent.click(availableButtons[0]);
      }

      fireEvent.click(screen.getByTestId("builder-check-btn"));
      expect(screen.getByTestId("builder-feedback")).toBeInTheDocument();
      expect(mockSpeak).toHaveBeenCalledWith(item.targetSentenceVi, expect.any(Object));
      fireEvent.click(screen.getByTestId("builder-next-btn"));
    }

    expect(screen.getByTestId("builder-summary")).toBeInTheDocument();
    expect(onCompleteSession).toHaveBeenCalledTimes(1);
    expect(onCompleteSession).toHaveBeenCalledWith(
      expect.objectContaining({
        gameType: GAME_TYPES.READING_COMPREHENSION,
        topicId: "self",
        skillTags: ["reading", "listening"],
        accuracy: 100,
      })
    );
  });
});

describe("Navbar Northern Voice Picker & TopicOverview Prefetch", () => {
  it("defaults to Ngẫu nhiên with Shuffle icon, opens Random + 5 Northern voices popover, closes on Escape/outside click, and switches cleanly", () => {
    render(
      <Navbar
        activeView="dashboard"
        onNavigate={vi.fn()}
        skillProgress={{ xp: 120, streakDays: 3 }}
        user={null}
        storageMode="local"
        isSupabaseConfigured={false}
        onOpenAuth={vi.fn()}
      />
    );

    const trigger = screen.getByTestId("navbar-voice-trigger");
    expect(trigger).toHaveTextContent("Ngẫu nhiên");
    expect(within(trigger).getByTestId("navbar-voice-icon-random")).toBeInTheDocument();
    expect(screen.queryByTestId("navbar-voice-menu")).not.toBeInTheDocument();

    // Open popover and verify header + Random option + all 5 Northern voices & sublabels
    fireEvent.click(trigger);
    const menu = screen.getByTestId("navbar-voice-menu");
    expect(menu).toHaveTextContent("Giọng đọc Miền Bắc · VieNeu-TTS");
    expect(within(menu).getByText("Ngẫu nhiên")).toBeInTheDocument();
    expect(within(menu).getByText("Tự động xoay vòng 5 giọng Bắc")).toBeInTheDocument();
    expect(within(menu).getByText("Ngọc Huyền")).toBeInTheDocument();
    expect(within(menu).getByText("Trúc Ly")).toBeInTheDocument();
    expect(within(menu).getByText("Mai Anh")).toBeInTheDocument();
    expect(within(menu).getByText("Hải Đăng")).toBeInTheDocument();
    expect(within(menu).getByText("Thiện Minh")).toBeInTheDocument();
    expect(within(menu).getByText("Nữ · Tin tức rõ chữ")).toBeInTheDocument();
    expect(within(menu).getByText("Nam · Kể chuyện")).toBeInTheDocument();

    // Close on Escape
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByTestId("navbar-voice-menu")).not.toBeInTheDocument();

    // Re-open and close on outside click
    fireEvent.click(trigger);
    expect(screen.getByTestId("navbar-voice-menu")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId("navbar-voice-menu")).not.toBeInTheDocument();

    // Re-open and select Thiện Minh -> switches icon from Shuffle to Volume2
    fireEvent.click(trigger);
    fireEvent.click(within(screen.getByTestId("navbar-voice-menu")).getByText("Thiện Minh"));
    expect(setSelectedVoice).toHaveBeenCalledWith("thienminh");
    expect(screen.queryByTestId("navbar-voice-menu")).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent("Thiện Minh");
    expect(within(trigger).getByTestId("navbar-voice-icon-voice")).toBeInTheDocument();

    // Re-open and select Ngẫu nhiên -> switches icon back to Shuffle
    fireEvent.click(trigger);
    fireEvent.click(within(screen.getByTestId("navbar-voice-menu")).getByText("Ngẫu nhiên"));
    expect(setSelectedVoice).toHaveBeenCalledWith("random");
    expect(trigger).toHaveTextContent("Ngẫu nhiên");
    expect(within(trigger).getByTestId("navbar-voice-icon-random")).toBeInTheDocument();
  });

  it("prefetches the first 3 keyPhrases of the selected topic in TopicOverview", () => {
    const foodTopic = TOPICS.find((t) => t.id === "food");
    render(
      <TopicOverview
        topics={TOPICS}
        selectedTopicId="food"
        onSelectTopic={vi.fn()}
        skillProgress={{ topicMastery: { food: 40 } }}
        decks={[]}
        onLaunchGame={vi.fn()}
        onOpenFlashcards={vi.fn()}
      />
    );

    expect(prefetchVietnamese).toHaveBeenCalledWith(
      foodTopic.keyPhrases.slice(0, 3).map((p) => p.vi),
      { voice: "random" }
    );
  });
});
