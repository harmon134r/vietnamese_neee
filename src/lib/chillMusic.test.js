import { afterEach, describe, expect, it, vi } from "vitest";
import { GAME_TYPES, TOPIC_IDS } from "./contracts.js";
import {
  CHASE_MODES,
  CHASE_SCENES,
  SYNONYM_ANTONYM_ITEMS,
  getChaseItems,
} from "../data/synonymAntonym.js";
import {
  CHASE_MODES as INDEX_CHASE_MODES,
  CHASE_SCENES as INDEX_CHASE_SCENES,
  SYNONYM_ANTONYM_ITEMS as INDEX_ITEMS,
  getChaseItems as indexGetChaseItems,
  getContentStats,
} from "../data/index.js";
import { createChillAudioEngine } from "./chillMusic.js";

function createMockAudioContext() {
  const ramps = [];
  const createdOscillators = [];
  const createdGains = [];
  const createdFilters = [];

  function makeParam(initial = 0) {
    const param = {
      value: initial,
      setValueAtTime: vi.fn((val) => {
        param.value = val;
      }),
      linearRampToValueAtTime: vi.fn((val, endTime) => {
        ramps.push({ param, val, endTime });
        param.value = val;
      }),
      cancelScheduledValues: vi.fn(),
    };
    return param;
  }

  class MockAudioContext {
    constructor() {
      this.state = "suspended";
      this.currentTime = 1.0;
      this.sampleRate = 44100;
      this.destination = { id: "destination" };
      this.resume = vi.fn(() => {
        this.state = "running";
        return Promise.resolve();
      });
      this.close = vi.fn(() => {
        this.state = "closed";
        return Promise.resolve();
      });
    }

    createGain() {
      const node = {
        gain: makeParam(1),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
      createdGains.push(node);
      return node;
    }

    createBiquadFilter() {
      const node = {
        type: "lowpass",
        frequency: makeParam(350),
        Q: makeParam(1),
        connect: vi.fn(),
      };
      createdFilters.push(node);
      return node;
    }

    createOscillator() {
      const node = {
        type: "sine",
        frequency: makeParam(440),
        detune: makeParam(0),
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
      createdOscillators.push(node);
      return node;
    }

    createBuffer(_channels, length) {
      const data = new Float32Array(length);
      return {
        length,
        getChannelData: () => data,
      };
    }

    createBufferSource() {
      return {
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
    }
  }

  return {
    MockAudioContext,
    ramps,
    createdOscillators,
    createdGains,
    createdFilters,
  };
}

describe("GAME_TYPES contract & data/index exports", () => {
  it("registers SYNONYM_ANTONYM_CHASE without altering existing GAME_TYPES keys", () => {
    expect(GAME_TYPES.SYNONYM_ANTONYM_CHASE).toBe("synonym-antonym-chase");
    expect(GAME_TYPES.TONE_RADAR).toBe("tone_radar");
    expect(GAME_TYPES.LISTEN_MATCH).toBe("listen_match");
    expect(GAME_TYPES.DIALOGUE_BUILDER).toBe("dialogue_builder");
    expect(GAME_TYPES.READING_COMPREHENSION).toBe("reading_comprehension");
    expect(GAME_TYPES.SHADOW_SPEAK).toBe("shadow_speak");
    expect(GAME_TYPES.PRONUNCIATION_LAB).toBe("pronunciation_lab");
    expect(GAME_TYPES.FLASHCARD_REVIEW).toBe("flashcard_review");
  });

  it("re-exports synonymAntonym module from src/data/index.js and includes stats", () => {
    expect(INDEX_CHASE_MODES).toBe(CHASE_MODES);
    expect(INDEX_CHASE_SCENES).toBe(CHASE_SCENES);
    expect(INDEX_ITEMS).toBe(SYNONYM_ANTONYM_ITEMS);
    expect(indexGetChaseItems).toBe(getChaseItems);

    const stats = getContentStats();
    expect(stats.synonymAntonymItems).toBe(SYNONYM_ANTONYM_ITEMS.length);
    const topicTotal = TOPIC_IDS.reduce(
      (sum, topicId) => sum + stats.byTopic[topicId].synonymAntonymItems,
      0
    );
    expect(topicTotal).toBe(SYNONYM_ANTONYM_ITEMS.length);
  });
});

describe("SYNONYM_ANTONYM_ITEMS curriculum integrity", () => {
  it("exports all 3 chase modes and 4 illustrated scenes", () => {
    expect(CHASE_MODES.map((m) => m.id)).toEqual(["synonym", "antonym", "mixed"]);
    expect(CHASE_SCENES.map((s) => s.id)).toEqual(["garden", "home", "beach", "street"]);
    for (const scene of CHASE_SCENES) {
      expect(scene.image).toMatch(/^\/images\/chase\/scene-[a-z]+\.webp$/);
      expect(scene.groundColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(scene.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("contains at least 60 items (>= 30 synonyms, >= 30 antonyms) across all 6 topics", () => {
    expect(SYNONYM_ANTONYM_ITEMS.length).toBeGreaterThanOrEqual(60);

    const synonyms = SYNONYM_ANTONYM_ITEMS.filter((item) => item.mode === "synonym");
    const antonyms = SYNONYM_ANTONYM_ITEMS.filter((item) => item.mode === "antonym");
    expect(synonyms.length).toBeGreaterThanOrEqual(30);
    expect(antonyms.length).toBeGreaterThanOrEqual(30);

    for (const topicId of TOPIC_IDS) {
      const topicSynonyms = synonyms.filter((item) => item.topicId === topicId);
      const topicAntonyms = antonyms.filter((item) => item.topicId === topicId);
      expect(topicSynonyms.length).toBeGreaterThanOrEqual(5);
      expect(topicAntonyms.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("has unique IDs, valid shape, clean distractors, and strict NFC Unicode", () => {
    const ids = new Set();
    const promptWords = new Set();

    for (const item of SYNONYM_ANTONYM_ITEMS) {
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);

      expect(promptWords.has(item.promptWord.trim().toLowerCase())).toBe(false);
      promptWords.add(item.promptWord.trim().toLowerCase());

      expect(TOPIC_IDS).toContain(item.topicId);
      expect(["synonym", "antonym"]).toContain(item.mode);

      const textFields = [
        item.id,
        item.promptWord,
        item.pos,
        item.correctAnswer,
        item.explanationVi,
        item.exampleVi,
        ...item.distractors,
      ];

      for (const text of textFields) {
        expect(typeof text).toBe("string");
        expect(text.trim().length).toBeGreaterThan(0);
        expect(text).toBe(text.normalize("NFC"));
      }

      expect(item.distractors).toHaveLength(3);
      const normalizedDistractors = item.distractors.map((d) => d.trim().toLowerCase());
      const normalizedCorrect = item.correctAnswer.trim().toLowerCase();
      const normalizedPrompt = item.promptWord.trim().toLowerCase();

      expect(new Set(normalizedDistractors).size).toBe(3);
      expect(normalizedDistractors).not.toContain(normalizedCorrect);
      expect(normalizedDistractors).not.toContain(normalizedPrompt);
      expect(normalizedCorrect).not.toBe(normalizedPrompt);
    }
  });

  it("filters cleanly via getChaseItems by mode and topicId", () => {
    const defaultItems = getChaseItems();
    expect(defaultItems.length).toBeGreaterThanOrEqual(30);
    expect(defaultItems.every((x) => x.mode === "synonym")).toBe(true);

    const antonymItems = getChaseItems({ mode: "antonym" });
    expect(antonymItems.length).toBeGreaterThanOrEqual(30);
    expect(antonymItems.every((x) => x.mode === "antonym")).toBe(true);

    const mixedItems = getChaseItems({ mode: "mixed" });
    expect(mixedItems.length).toBe(SYNONYM_ANTONYM_ITEMS.length);

    for (const topicId of TOPIC_IDS) {
      const foodMixed = getChaseItems({ mode: "mixed", topicId });
      expect(foodMixed.length).toBeGreaterThanOrEqual(10);
      expect(foodMixed.every((x) => x.topicId === topicId)).toBe(true);

      const topicSyn = getChaseItems({ mode: "synonym", topicId });
      expect(topicSyn.length).toBeGreaterThanOrEqual(5);
      expect(topicSyn.every((x) => x.topicId === topicId && x.mode === "synonym")).toBe(true);

      const topicAnt = getChaseItems({ mode: "antonym", topicId });
      expect(topicAnt.length).toBeGreaterThanOrEqual(5);
      expect(topicAnt.every((x) => x.topicId === topicId && x.mode === "antonym")).toBe(true);
    }
  });
});

describe("createChillAudioEngine lifecycle", () => {
  const originalAudioContext = globalThis.AudioContext;
  const originalWebkitAudioContext = globalThis.webkitAudioContext;

  afterEach(() => {
    globalThis.AudioContext = originalAudioContext;
    globalThis.webkitAudioContext = originalWebkitAudioContext;
    vi.useRealTimers();
  });

  it("operates as a graceful no-op in jsdom when AudioContext is unavailable", () => {
    delete globalThis.AudioContext;
    delete globalThis.webkitAudioContext;

    const engine = createChillAudioEngine();
    expect(engine.isMuted()).toBe(false);

    expect(() => {
      engine.startMusic();
      engine.duck(true);
      engine.duck(false);
      engine.playJumpSfx();
      engine.playCorrectSfx(1);
      engine.playCorrectSfx(5);
      engine.playWrongSfx();
      engine.playSceneChangeSfx();
      engine.playVictorySfx();
      engine.setMuted(true);
      expect(engine.isMuted()).toBe(true);
      engine.setMuted(false);
      expect(engine.isMuted()).toBe(false);
      engine.stopMusic();
      engine.dispose();
      // Subsequent calls after dispose must remain safe no-ops
      engine.startMusic();
      engine.playJumpSfx();
      engine.dispose();
    }).not.toThrow();
  });

  it("synthesizes lo-fi audio, ducks smoothly for TTS, plays SFX, and cleans up on dispose", () => {
    vi.useFakeTimers();
    const mock = createMockAudioContext();
    globalThis.AudioContext = mock.MockAudioContext;

    const engine = createChillAudioEngine();

    engine.startMusic();
    // Rhodes lowpass filter configured near 1350 Hz
    expect(mock.createdFilters.some((f) => f.type === "lowpass" && f.frequency.value === 1350)).toBe(true);
    expect(mock.createdOscillators.length).toBeGreaterThan(0);

    // Advance timer to confirm scheduler loop runs cleanly
    vi.advanceTimersByTime(500);
    const oscCountAfterMusic = mock.createdOscillators.length;

    // Duck to ~22% for VieNeu-TTS and restore
    engine.duck(true);
    expect(mock.ramps.some((r) => Math.abs(r.val - 0.22) < 0.01)).toBe(true);
    engine.duck(false);
    expect(mock.ramps.some((r) => r.val === 1)).toBe(true);

    // Trigger all gameplay SFX
    engine.playJumpSfx();
    engine.playCorrectSfx(1);
    engine.playCorrectSfx(4);
    engine.playWrongSfx();
    engine.playSceneChangeSfx();
    engine.playVictorySfx();
    expect(mock.createdOscillators.length).toBeGreaterThan(oscCountAfterMusic);

    // Mute suppresses new SFX scheduling and ramps master gain to 0
    engine.setMuted(true);
    expect(engine.isMuted()).toBe(true);
    expect(mock.ramps.some((r) => r.val === 0)).toBe(true);
    const countWhileMuted = mock.createdOscillators.length;
    engine.playJumpSfx();
    expect(mock.createdOscillators.length).toBe(countWhileMuted);

    engine.stopMusic();
    engine.dispose();

    // Advancing timers after dispose should not schedule further oscillators
    const countAfterDispose = mock.createdOscillators.length;
    vi.advanceTimersByTime(1000);
    expect(mock.createdOscillators.length).toBe(countAfterDispose);
  });
});
