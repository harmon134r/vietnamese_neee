import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
  isLoadingAudio: false,
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
    isCachedInMemory: vi.fn(() => false),
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
import { SynonymAntonymChase } from "./SynonymAntonymChase";
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
  SYNONYM_ANTONYM_ITEMS,
  TONE_MINIMAL_PAIRS,
  TOPICS,
  getContentStats,
} from "../../data";

beforeEach(() => {
  vi.clearAllMocks();
  speechHookState.sttSupported = true;
  speechHookState.isListening = false;
  speechHookState.isSpeaking = false;
  speechHookState.isLoadingAudio = false;
  speechHookState.speakingText = "";
  speechHookState.finalTranscript = "";
  speechHookState.interimTranscript = "";
  speechHookState.speechError = null;
});

afterEach(() => {
  cleanup();
});

describe("GameHub", () => {
  it("renders all 5 game modes including SynonymAntonymChase and all 6 topic filters plus All", () => {
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
    expect(screen.getByTestId("game-mode-card-chase")).toBeInTheDocument();
    expect(
      screen.getByText(/Đuổi Bắt Đồng Nghĩa – Trái Nghĩa/i)
    ).toBeInTheDocument();

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

  it("deep-links cleanly into SynonymAntonymChase via 'chase' or GAME_TYPES.SYNONYM_ANTONYM_CHASE", () => {
    render(
      <GameHub
        activeTopicId="all"
        initialGame={GAME_TYPES.SYNONYM_ANTONYM_CHASE}
      />
    );
    expect(screen.getByTestId("synonym-antonym-chase")).toBeInTheDocument();
  });

  it("displays live dynamic exercise counts for All topics and updates when selecting a topic", () => {
    const stats = getContentStats();
    render(<GameHub activeTopicId="all" />);

    expect(screen.getByTestId("game-mode-stat-listening")).toHaveTextContent(
      `${stats.listeningExercises} bài nghe`
    );
    expect(screen.getByTestId("game-mode-stat-pronunciation")).toHaveTextContent(
      `${stats.minimalPairs} cặp từ · ${stats.pronunciationSentences} câu đọc`
    );
    expect(screen.getByTestId("game-mode-stat-dialogue")).toHaveTextContent(
      `${stats.dialogueScenarios} tình huống`
    );
    expect(screen.getByTestId("game-mode-stat-reading")).toHaveTextContent(
      `${stats.readingPassages} bài đọc · ${stats.sentenceBuilders} câu ghép`
    );
    expect(screen.getByTestId("game-mode-stat-chase")).toHaveTextContent(
      `${stats.synonymAntonymItems} cặp từ`
    );

    fireEvent.click(screen.getByTestId("topic-pill-food"));
    const foodStats = stats.byTopic.food;
    expect(screen.getByTestId("game-mode-stat-listening")).toHaveTextContent(
      `${foodStats.listeningExercises} bài nghe`
    );
    expect(screen.getByTestId("game-mode-stat-pronunciation")).toHaveTextContent(
      `${foodStats.minimalPairs} cặp từ · ${foodStats.pronunciationSentences} câu đọc`
    );
    expect(screen.getByTestId("game-mode-stat-dialogue")).toHaveTextContent(
      `${foodStats.dialogueScenarios} tình huống`
    );
    expect(screen.getByTestId("game-mode-stat-reading")).toHaveTextContent(
      `${foodStats.readingPassages} bài đọc · ${foodStats.sentenceBuilders} câu ghép`
    );
    expect(screen.getByTestId("game-mode-stat-chase")).toHaveTextContent(
      `${foodStats.synonymAntonymItems} cặp từ`
    );
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

  it("shows Đang tải... while audio is loading, switches to Dừng when playing, and prefetches immediately on voice-change", () => {
    const selfExercises = LISTENING_EXERCISES.filter((e) => e.topicId === "self");

    speechHookState.isSpeaking = true;
    speechHookState.isLoadingAudio = true;

    const { rerender } = render(<ListeningGame activeTopicId="self" />);
    const playBtn = screen.getByTestId("listening-play-btn");
    expect(playBtn).toHaveTextContent("Đang tải...");
    expect(playBtn).toHaveAttribute("aria-busy", "true");

    // Clicking while loading cancels immediately via stopSpeak
    mockStopSpeak.mockClear();
    fireEvent.click(playBtn);
    expect(mockStopSpeak).toHaveBeenCalledTimes(1);

    // Once audio starts playing, switches cleanly to Dừng
    speechHookState.isLoadingAudio = false;
    rerender(<ListeningGame activeTopicId="self" />);
    expect(screen.getByTestId("listening-play-btn")).toHaveTextContent("Dừng");
    expect(screen.getByTestId("listening-play-btn")).toHaveAttribute("aria-busy", "false");

    // Switching voice in Navbar triggers immediate prefetch for the newly selected voice
    prefetchVietnamese.mockClear();
    window.dispatchEvent(
      new CustomEvent("vietflow:voice-change", { detail: { voice: "maianh" } })
    );
    expect(prefetchVietnamese).toHaveBeenCalledWith(
      selfExercises.slice(0, 3).map((e) => e.audioTextVi),
      { voice: "maianh" }
    );
  });

  it("deals up to 8 balanced exercises when practicing all topics and avoids repeats on the next round", () => {
    render(<ListeningGame activeTopicId="all" />);
    const expectedLen = Math.min(8, LISTENING_EXERCISES.length);
    expect(screen.getByText(`Câu 1 / ${expectedLen}`)).toBeInTheDocument();

    const round1Titles = [];
    for (let i = 0; i < expectedLen; i += 1) {
      const title = screen.getByRole("heading", { level: 3 }).textContent;
      round1Titles.push(title);
      fireEvent.click(screen.getByTestId("listening-option-a"));
      fireEvent.click(screen.getByTestId("listening-next-btn"));
    }

    expect(screen.getByTestId("listening-summary")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Luyện vòng mới/i }));
    expect(screen.getByText(`Câu 1 / ${expectedLen}`)).toBeInTheDocument();

    if (LISTENING_EXERCISES.length >= expectedLen * 2) {
      const round2FirstTitle = screen.getByRole("heading", { level: 3 }).textContent;
      expect(round1Titles).not.toContain(round2FirstTitle);
    }
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

  it("displays dynamic tab counts and jumps to a different random exercise in both sub-modes", () => {
    render(<PronunciationLab activeTopicId="all" />);

    expect(screen.getByTestId("pronunciation-tab-pairs")).toHaveTextContent(
      `6 thanh điệu & cặp từ (${TONE_MINIMAL_PAIRS.length})`
    );
    expect(screen.getByTestId("pronunciation-tab-shadowing")).toHaveTextContent(
      `Luyện đọc câu (${PRONUNCIATION_SENTENCES.length})`
    );

    expect(
      screen.getByText(`Cặp 1 / ${TONE_MINIMAL_PAIRS.length}`)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("pronunciation-pair-random"));
    expect(
      screen.queryByText(`Cặp 1 / ${TONE_MINIMAL_PAIRS.length}`)
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("pronunciation-tab-shadowing"));
    expect(
      screen.getByText(`Câu 1 / ${PRONUNCIATION_SENTENCES.length}`)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("pronunciation-sentence-random"));
    expect(
      screen.queryByText(`Câu 1 / ${PRONUNCIATION_SENTENCES.length}`)
    ).not.toBeInTheDocument();
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

  it("shows dynamic scenario count, Xem cả N tình huống toggle, and inline topic filter", () => {
    const foodScenarios = DIALOGUE_SCENARIOS.filter((s) => s.topicId === "food");
    const selfScenarios = DIALOGUE_SCENARIOS.filter((s) => s.topicId === "self");

    render(<DialogueRoleplay activeTopicId="food" />);

    expect(screen.getByTestId("dialogue-scenario-count")).toHaveTextContent(
      `${foodScenarios.length} tình huống`
    );
    const toggleBtn = screen.getByTestId("dialogue-toggle-all-btn");
    expect(toggleBtn).toHaveTextContent(
      `Xem cả ${DIALOGUE_SCENARIOS.length} tình huống`
    );

    fireEvent.click(toggleBtn);
    expect(screen.getByTestId("dialogue-scenario-count")).toHaveTextContent(
      `${DIALOGUE_SCENARIOS.length} tình huống`
    );
    expect(toggleBtn).toHaveTextContent("Chỉ xem chủ đề đang chọn");

    if (DIALOGUE_SCENARIOS.length > 6) {
      expect(screen.getByTestId("dialogue-topic-filter")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("dialogue-filter-self"));
      expect(screen.getByTestId("dialogue-scenario-count")).toHaveTextContent(
        `${selfScenarios.length} tình huống`
      );
      for (const sc of selfScenarios) {
        expect(
          screen.getByTestId(`dialogue-scenario-${sc.id}`)
        ).toBeInTheDocument();
      }
    }
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

  it("shows dynamic tab counts, distinct passage tabs, Bài tiếp navigation, inline topic filter, and 8-item all-topic builder round", () => {
    render(<ReadingVocabGame activeTopicId="all" />);

    expect(screen.getByTestId("reading-tab-passage")).toHaveTextContent(
      `Đọc hiểu (${READING_PASSAGES.length})`
    );
    expect(screen.getByTestId("reading-tab-builder")).toHaveTextContent(
      `Ghép câu (${SENTENCE_BUILDERS.length})`
    );
    expect(screen.getByTestId("reading-passage-counter")).toHaveTextContent(
      `Bài 1 / ${READING_PASSAGES.length}`
    );

    const tabsContainer = screen.getByTestId("reading-passage-tabs");
    const tabButtons = within(tabsContainer).getAllByRole("tab");
    expect(tabButtons.length).toBe(READING_PASSAGES.length);
    const distinctLabels = new Set(tabButtons.map((btn) => btn.textContent.trim()));
    expect(distinctLabels.size).toBe(READING_PASSAGES.length);
    expect(tabButtons[0]).toHaveAttribute("title", READING_PASSAGES[0].titleVi);

    fireEvent.click(screen.getByTestId("reading-passage-next"));
    expect(screen.getByTestId("reading-passage-counter")).toHaveTextContent(
      `Bài 2 / ${READING_PASSAGES.length}`
    );
    expect(
      screen.getByRole("heading", { name: READING_PASSAGES[1].titleVi })
    ).toBeInTheDocument();

    if (READING_PASSAGES.length > 6) {
      expect(screen.getByTestId("reading-topic-filter")).toBeInTheDocument();
      const foodPassages = READING_PASSAGES.filter((p) => p.topicId === "food");
      fireEvent.click(screen.getByTestId("reading-filter-food"));
      expect(screen.getByTestId("reading-passage-counter")).toHaveTextContent(
        `Bài 1 / ${foodPassages.length}`
      );
      expect(
        screen.getByRole("heading", { name: foodPassages[0].titleVi })
      ).toBeInTheDocument();
    }

    fireEvent.click(screen.getByTestId("reading-tab-builder"));
    const expectedBuilderRound = Math.min(8, SENTENCE_BUILDERS.length);
    expect(
      screen.getByText(`Câu 1 / ${expectedBuilderRound}`)
    ).toBeInTheDocument();
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

    const foodStats = getContentStats().byTopic.food;
    expect(
      screen.getByText(
        `${foodStats.listeningExercises} bài nghe hội thoại theo ngữ cảnh`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `${foodStats.minimalPairs} cặp từ · ${foodStats.pronunciationSentences} câu đọc mẫu`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `${foodStats.dialogueScenarios} tình huống · 4 lượt hỏi đáp`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `${foodStats.readingPassages} bài đọc · ${foodStats.sentenceBuilders} câu ghép`
      )
    ).toBeInTheDocument();
  });
});

describe("SynonymAntonymChase", () => {
  afterEach(() => {
    vi.useRealTimers();
    window.localStorage?.clear?.();
  });

  it("renders Chơi/BXH tabs, pre-game mode selector, all 4 scenes, all 3 chill tracks, and BXH empty state", async () => {
    window.localStorage?.clear?.();
    render(<SynonymAntonymChase activeTopicId="all" />);

    expect(screen.getByTestId("chase-tab-play")).toBeInTheDocument();
    expect(screen.getByTestId("chase-tab-leaderboard")).toBeInTheDocument();

    const setup = screen.getByTestId("chase-setup-overlay");
    expect(within(setup).getByText("Đồng nghĩa")).toBeInTheDocument();
    expect(within(setup).getByText("Trái nghĩa")).toBeInTheDocument();
    expect(within(setup).getByText("Hỗn hợp")).toBeInTheDocument();
    expect(within(setup).getByText("Sân vườn mùa thu")).toBeInTheDocument();
    expect(within(setup).getByText("Trong nhà ấm cúng")).toBeInTheDocument();
    expect(within(setup).getByText("Bãi biển hoàng hôn")).toBeInTheDocument();
    expect(within(setup).getByText("Phố cổ chiều thu")).toBeInTheDocument();

    // All 3 chilling background tracks render in Pre-Game Setup and persist selection
    const trackPicker = within(setup).getByTestId("chase-track-picker");
    expect(within(trackPicker).getByText("Chiều Thu Lo-Fi")).toBeInTheDocument();
    expect(within(trackPicker).getByText("Gió Biển Hoàng Hôn")).toBeInTheDocument();
    expect(within(trackPicker).getByText("Trà Đêm Phố Cổ")).toBeInTheDocument();

    expect(screen.getByTestId("chase-track-lofi-garden")).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByTestId("chase-track-ocean-breeze"));
    expect(screen.getByTestId("chase-track-ocean-breeze")).toHaveAttribute("aria-checked", "true");
    expect(window.localStorage.getItem("vietflow_chase_track")).toBe("ocean-breeze");

    fireEvent.click(screen.getByTestId("chase-tab-leaderboard"));
    expect(await screen.findByTestId("chase-leaderboard")).toBeInTheDocument();
    expect(await screen.findByTestId("chase-bxh-empty")).toBeInTheDocument();
  });

  it("keeps hurdle parked during question, plays vault-clear & shatter-crash action sequences before next question, and switches tracks live in HUD", () => {
    vi.useFakeTimers();
    window.localStorage?.clear?.();
    render(<SynonymAntonymChase activeTopicId="all" />);

    // Pick Trà Đêm Phố Cổ in setup, select Trái nghĩa, and start
    fireEvent.click(screen.getByTestId("chase-track-night-tea"));
    fireEvent.click(screen.getByTestId("chase-mode-antonym"));
    fireEvent.click(screen.getByTestId("chase-start-btn"));

    // Live HUD displays the chosen track and cycles cleanly through all 3 tracks
    const hudTrackBtn = screen.getByTestId("chase-hud-track");
    expect(hudTrackBtn).toHaveTextContent("Trà Đêm Phố Cổ");
    fireEvent.click(hudTrackBtn);
    expect(hudTrackBtn).toHaveTextContent("Chiều Thu Lo-Fi");
    expect(screen.getByTestId("chase-track-toast")).toHaveTextContent("Chiều Thu Lo-Fi");
    fireEvent.click(hudTrackBtn);
    expect(hudTrackBtn).toHaveTextContent("Gió Biển Hoàng Hôn");
    expect(window.localStorage.getItem("vietflow_chase_track")).toBe("ocean-breeze");

    expect(screen.getByTestId("chase-lanes")).toBeInTheDocument();
    expect(screen.getByTestId("chase-lane-top")).toHaveTextContent("NHẢY");
    expect(screen.getByTestId("chase-lane-bottom")).toHaveTextContent("CHẠY THẲNG");
    expect(screen.getByTestId("chase-prompt-pill")).toHaveTextContent(
      "CHỌN TỪ TRÁI NGHĨA VỚI:"
    );
    expect(screen.getByTestId("chase-score-pill")).toHaveTextContent("Điểm: 0");

    // During active question phase, hurdle stays stationary/parked out of Dog & Cat's frame
    expect(screen.getByTestId("chase-hurdle")).toHaveAttribute(
      "data-hurdle-state",
      "parked"
    );

    // Question 1: choose the CORRECT answer -> enters clearing (vault over hurdle) action sequence
    const q1Prompt = screen.getByTestId("chase-prompt-word").textContent;
    const q1Item = SYNONYM_ANTONYM_ITEMS.find(
      (item) => item.mode === "antonym" && item.promptWord === q1Prompt
    );
    expect(q1Item).toBeDefined();

    const topBtn = screen.getByTestId("chase-lane-top");
    const bottomBtn = screen.getByTestId("chase-lane-bottom");
    const q1CorrectLane = topBtn.textContent.includes(q1Item.correctAnswer)
      ? "top"
      : "bottom";

    fireEvent.click(q1CorrectLane === "top" ? topBtn : bottomBtn);
    expect(screen.getByTestId("chase-score-pill")).toHaveTextContent("Điểm: 10");
    expect(screen.getByTestId("chase-feedback")).toBeInTheDocument();
    expect(screen.getByTestId("chase-hurdle")).toHaveAttribute(
      "data-hurdle-state",
      "clearing"
    );
    expect(screen.getByTestId("chase-lanes")).toHaveClass("vf-chase-lanes--hidden");

    // Mid-sequence (700ms < 1350ms): still watching the jump action, NOT yet advanced to Question 2
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getByTestId("chase-feedback")).toBeInTheDocument();
    expect(screen.getByTestId("chase-hurdle")).toHaveAttribute(
      "data-hurdle-state",
      "clearing"
    );
    expect(screen.getByTestId("chase-prompt-word")).toHaveTextContent(q1Prompt);

    // After the 1350ms jump action finishes -> advances cleanly to Question 2 with parked hurdle
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.queryByTestId("chase-feedback")).not.toBeInTheDocument();
    expect(screen.getByTestId("chase-hurdle")).toHaveAttribute(
      "data-hurdle-state",
      "parked"
    );

    // Question 2: choose the WRONG answer -> enters broken (hurdle shatter!) action sequence
    const q2Prompt = screen.getByTestId("chase-prompt-word").textContent;
    const q2Item = SYNONYM_ANTONYM_ITEMS.find(
      (item) => item.mode === "antonym" && item.promptWord === q2Prompt
    );
    expect(q2Item).toBeDefined();

    const q2TopBtn = screen.getByTestId("chase-lane-top");
    const q2WrongKey = q2TopBtn.textContent.includes(q2Item.correctAnswer)
      ? "ArrowDown"
      : "ArrowUp";

    fireEvent.keyDown(window, { key: q2WrongKey, code: q2WrongKey });
    expect(screen.getByTestId("chase-feedback")).toBeInTheDocument();
    expect(screen.getByTestId("chase-hearts-pill")).toHaveAttribute(
      "aria-label",
      "Còn 2 trên 3 tim"
    );
    const brokenHurdle = screen.getByTestId("chase-hurdle");
    expect(brokenHurdle).toHaveAttribute("data-hurdle-state", "broken");
    expect(brokenHurdle.querySelector(".vf-hurdle-plank-top")).toBeInTheDocument();
    expect(brokenHurdle.querySelector(".vf-hurdle-plank-mid")).toBeInTheDocument();
    expect(brokenHurdle.querySelector(".vf-hurdle-post-left")).toBeInTheDocument();
    expect(brokenHurdle.querySelector(".vf-hurdle-post-right")).toBeInTheDocument();
    expect(brokenHurdle.querySelectorAll(".vf-hurdle-splinter").length).toBe(3);

    // Mid-shatter (1000ms < 2050ms): still showing shatter & explanation, NOT yet advanced
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId("chase-feedback")).toBeInTheDocument();
    expect(screen.getByTestId("chase-hurdle")).toHaveAttribute(
      "data-hurdle-state",
      "broken"
    );
    expect(screen.getByTestId("chase-prompt-word")).toHaveTextContent(q2Prompt);

    // After the 2050ms shatter sequence finishes -> advances cleanly to Question 3
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.queryByTestId("chase-feedback")).not.toBeInTheDocument();
    expect(screen.getByTestId("chase-hurdle")).toHaveAttribute(
      "data-hurdle-state",
      "parked"
    );

    // Question 3: verify keyboard ArrowUp / ArrowDown also scores correctly
    const q3Prompt = screen.getByTestId("chase-prompt-word").textContent;
    const q3Item = SYNONYM_ANTONYM_ITEMS.find(
      (item) => item.mode === "antonym" && item.promptWord === q3Prompt
    );
    expect(q3Item).toBeDefined();

    const q3TopBtn = screen.getByTestId("chase-lane-top");
    const q3CorrectKey = q3TopBtn.textContent.includes(q3Item.correctAnswer)
      ? "ArrowUp"
      : "ArrowDown";

    fireEvent.keyDown(window, { key: q3CorrectKey, code: q3CorrectKey });
    expect(screen.getByTestId("chase-score-pill")).toHaveTextContent("Điểm: 20");
    expect(screen.getByTestId("chase-hurdle")).toHaveAttribute(
      "data-hurdle-state",
      "clearing"
    );
  });
});

describe("Real-Time Step Auto-Sync & Partial Session Save", () => {
  afterEach(() => {
    window.localStorage?.clear?.();
  });

  it("syncs ListeningGame immediately after a single answer and saves partial session on mid-round unmount", () => {
    const onAutoSyncStep = vi.fn();
    const onSavePartialSession = vi.fn();
    const onCompleteSession = vi.fn();
    const selfExercises = LISTENING_EXERCISES.filter((e) => e.topicId === "self");

    const { unmount } = render(
      <ListeningGame
        activeTopicId="self"
        onAutoSyncStep={onAutoSyncStep}
        onSavePartialSession={onSavePartialSession}
        onCompleteSession={onCompleteSession}
      />
    );

    const firstEx = selfExercises[0];
    fireEvent.click(screen.getByTestId(`listening-option-${firstEx.correctOptionId}`));

    expect(onAutoSyncStep).toHaveBeenCalledTimes(1);
    expect(onAutoSyncStep).toHaveBeenCalledWith(
      expect.objectContaining({
        skillTags: ["listening", "reading"],
        accuracy: 100,
        topicId: "self",
      })
    );
    expect(onCompleteSession).not.toHaveBeenCalled();

    unmount();
    expect(onSavePartialSession).toHaveBeenCalledTimes(1);
    expect(onSavePartialSession).toHaveBeenCalledWith(
      expect.objectContaining({
        gameType: GAME_TYPES.LISTEN_MATCH,
        topicId: "self",
        stepSynced: true,
        score: 1,
        accuracy: 100,
      })
    );
  });

  it("syncs ReadingVocabGame MCQ and SynonymAntonymChase answers immediately on each step", () => {
    const onAutoSyncStepReading = vi.fn();
    const selfPassage = READING_PASSAGES.find((p) => p.topicId === "self");

    const { unmount: unmountReading } = render(
      <ReadingVocabGame
        activeTopicId="self"
        onAutoSyncStep={onAutoSyncStepReading}
      />
    );
    fireEvent.click(
      screen.getByTestId(`reading-q-0-opt-${selfPassage.questions[0].correctIndex}`)
    );
    expect(onAutoSyncStepReading).toHaveBeenCalledTimes(1);
    expect(onAutoSyncStepReading).toHaveBeenCalledWith(
      expect.objectContaining({
        skillTags: ["reading", "listening"],
        accuracy: 100,
        topicId: "self",
      })
    );
    unmountReading();

    const onAutoSyncStepChase = vi.fn();
    const onSavePartialChase = vi.fn();
    const { unmount: unmountChase } = render(
      <SynonymAntonymChase
        activeTopicId="all"
        onAutoSyncStep={onAutoSyncStepChase}
        onSavePartialSession={onSavePartialChase}
      />
    );
    fireEvent.click(screen.getByTestId("chase-start-btn"));
    fireEvent.click(screen.getByTestId("chase-lane-top"));

    expect(onAutoSyncStepChase).toHaveBeenCalledTimes(1);
    expect(onAutoSyncStepChase).toHaveBeenCalledWith(
      expect.objectContaining({
        skillTags: ["reading", "listening"],
      })
    );

    unmountChase();
    expect(onSavePartialChase).toHaveBeenCalledTimes(1);
    expect(onSavePartialChase).toHaveBeenCalledWith(
      expect.objectContaining({
        gameType: GAME_TYPES.SYNONYM_ANTONYM_CHASE,
        stepSynced: true,
      })
    );
  });
});

describe("4-Skill Curriculum Data Integrity & Coverage", () => {
  const validTopicIds = new Set(TOPICS.map((t) => t.id));
  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  it("meets expanded 4-skill exercise coverage targets across all 6 topics", () => {
    expect(TOPICS.length).toBe(6);
    expect(LISTENING_EXERCISES.length).toBeGreaterThanOrEqual(42);
    expect(READING_PASSAGES.length).toBeGreaterThanOrEqual(18);
    expect(SENTENCE_BUILDERS.length).toBeGreaterThanOrEqual(42);
    expect(TONE_MINIMAL_PAIRS.length).toBeGreaterThanOrEqual(30);
    expect(PRONUNCIATION_SENTENCES.length).toBeGreaterThanOrEqual(42);
    expect(DIALOGUE_SCENARIOS.length).toBeGreaterThanOrEqual(18);

    const stats = getContentStats();
    for (const topic of TOPICS) {
      const ts = stats.byTopic[topic.id];
      expect(ts.listeningExercises).toBeGreaterThanOrEqual(7);
      expect(ts.readingPassages).toBeGreaterThanOrEqual(3);
      expect(ts.sentenceBuilders).toBeGreaterThanOrEqual(7);
      expect(ts.minimalPairs).toBeGreaterThanOrEqual(5);
      expect(ts.pronunciationSentences).toBeGreaterThanOrEqual(7);
      expect(ts.dialogueScenarios).toBeGreaterThanOrEqual(3);
    }
  });

  it("ensures unique IDs and valid topicIds across all 6 curriculum datasets", () => {
    const datasets = [
      ["LISTENING_EXERCISES", LISTENING_EXERCISES],
      ["READING_PASSAGES", READING_PASSAGES],
      ["SENTENCE_BUILDERS", SENTENCE_BUILDERS],
      ["TONE_MINIMAL_PAIRS", TONE_MINIMAL_PAIRS],
      ["PRONUNCIATION_SENTENCES", PRONUNCIATION_SENTENCES],
      ["DIALOGUE_SCENARIOS", DIALOGUE_SCENARIOS],
    ];

    for (const [, items] of datasets) {
      const seenIds = new Set();
      for (const item of items) {
        expect(typeof item.id).toBe("string");
        expect(item.id.length).toBeGreaterThan(0);
        expect(seenIds.has(item.id)).toBe(false);
        seenIds.add(item.id);
        expect(validTopicIds.has(item.topicId)).toBe(true);
      }
    }
  });

  it("validates listening exercises have valid options and correctOptionId", () => {
    for (const ex of LISTENING_EXERCISES) {
      expect(ex.audioTextVi?.trim().length).toBeGreaterThan(0);
      expect(ex.questionVi?.trim().length).toBeGreaterThan(0);
      expect(Array.isArray(ex.options)).toBe(true);
      expect(ex.options.length).toBeGreaterThanOrEqual(3);
      const optionIds = ex.options.map((opt) => opt.id);
      expect(new Set(optionIds).size).toBe(optionIds.length);
      expect(optionIds).toContain(ex.correctOptionId);
    }
  });

  it("validates reading passages have valid correctIndex and verbatim glossary matches", () => {
    const seenQuestionIds = new Set();
    for (const passage of READING_PASSAGES) {
      expect(passage.titleVi?.trim().length).toBeGreaterThan(0);
      expect(Array.isArray(passage.paragraphs)).toBe(true);
      expect(passage.paragraphs.length).toBeGreaterThan(0);

      const fullBody = passage.paragraphs.join(" ");
      const glossaryEntries = Object.entries(passage.glossary || {});
      expect(glossaryEntries.length).toBeGreaterThan(0);
      for (const [term, entry] of glossaryEntries) {
        expect(entry?.definitionVi?.trim().length).toBeGreaterThan(0);
        const wholeWordRegex = new RegExp(
          `(?<![\\p{L}\\p{M}])${escapeRegExp(term)}(?![\\p{L}\\p{M}])`,
          "iu"
        );
        expect(wholeWordRegex.test(fullBody)).toBe(true);
      }

      expect(Array.isArray(passage.questions)).toBe(true);
      expect(passage.questions.length).toBeGreaterThan(0);
      for (const q of passage.questions) {
        expect(seenQuestionIds.has(q.id)).toBe(false);
        seenQuestionIds.add(q.id);
        expect(Array.isArray(q.options)).toBe(true);
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(Number.isInteger(q.correctIndex)).toBe(true);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
      }
    }
  });

  it("validates every sentence builder satisfies chunks.join(' ') === targetSentenceVi", () => {
    for (const item of SENTENCE_BUILDERS) {
      expect(Array.isArray(item.chunks)).toBe(true);
      expect(item.chunks.length).toBeGreaterThanOrEqual(3);
      expect(item.chunks.join(" ")).toBe(item.targetSentenceVi);
    }
  });

  it("validates pronunciation minimal pairs and shadowing sentences", () => {
    for (const set of TONE_MINIMAL_PAIRS) {
      expect(["tone", "vowel"]).toContain(set.contrastType);
      expect(Array.isArray(set.items)).toBe(true);
      expect(set.items.length).toBeGreaterThanOrEqual(2);
      for (const item of set.items) {
        expect(item.vi?.trim().length).toBeGreaterThan(0);
        expect(item.tone?.trim().length).toBeGreaterThan(0);
        expect(item.meaningVi?.trim().length).toBeGreaterThan(0);
        expect(item.exampleVi?.trim().length).toBeGreaterThan(0);
      }
    }

    for (const sentence of PRONUNCIATION_SENTENCES) {
      expect(sentence.textVi?.trim().length).toBeGreaterThan(0);
      expect(Array.isArray(sentence.difficultWords)).toBe(true);
      const lowerText = sentence.textVi.toLowerCase();
      for (const word of sentence.difficultWords) {
        expect(lowerText).toContain(word.toLowerCase());
      }
    }
  });

  it("validates every dialogue scenario has an intact 4-turn nextTurnId chain", () => {
    const seenTurnIds = new Set();
    const seenResponseIds = new Set();

    for (const scenario of DIALOGUE_SCENARIOS) {
      expect(Array.isArray(scenario.turns)).toBe(true);
      expect(scenario.turns.length).toBe(4);
      expect(scenario.openingLineVi).toBe(scenario.turns[0].npcTextVi);

      const turnMap = new Map();
      for (const turn of scenario.turns) {
        expect(seenTurnIds.has(turn.id)).toBe(false);
        seenTurnIds.add(turn.id);
        turnMap.set(turn.id, turn);
      }

      scenario.turns.forEach((turn, idx) => {
        expect(Array.isArray(turn.expectedResponses)).toBe(true);
        expect(turn.expectedResponses.length).toBeGreaterThanOrEqual(2);
        const expectedNextTurnId =
          idx < scenario.turns.length - 1 ? scenario.turns[idx + 1].id : null;

        for (const resp of turn.expectedResponses) {
          expect(seenResponseIds.has(resp.id)).toBe(false);
          seenResponseIds.add(resp.id);
          if (expectedNextTurnId === null) {
            expect(resp.nextTurnId).toBeNull();
          } else {
            expect(turnMap.has(resp.nextTurnId)).toBe(true);
            expect(resp.nextTurnId).toBe(expectedNextTurnId);
          }
        }
      });
    }
  });
});
