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
import { CHILL_TRACKS, DEFAULT_TRACK_ID, createChillAudioEngine } from "./chillMusic.js";

function createMockAudioContext() {
  const ramps = [];
  const freqEvents = [];
  const createdOscillators = [];
  const createdGains = [];
  const createdFilters = [];
  const createdBufferSources = [];
  const instances = [];

  function makeParam(initial = 0, label = "param") {
    const param = {
      value: initial,
      setValueAtTime: vi.fn((val, time) => {
        param.value = val;
        if (label === "frequency") {
          freqEvents.push({ type: "set", param, val, time });
        }
      }),
      linearRampToValueAtTime: vi.fn((val, endTime) => {
        ramps.push({ param, val, endTime });
        param.value = val;
        if (label === "frequency") {
          freqEvents.push({ type: "ramp", param, val, time: endTime });
        }
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
      instances.push(this);
    }

    createGain() {
      const node = {
        gain: makeParam(1, "gain"),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
      createdGains.push(node);
      return node;
    }

    createBiquadFilter() {
      const node = {
        type: "lowpass",
        frequency: makeParam(350, "filterFreq"),
        Q: makeParam(1, "Q"),
        connect: vi.fn(),
      };
      createdFilters.push(node);
      return node;
    }

    createOscillator() {
      const node = {
        type: "sine",
        frequency: makeParam(440, "frequency"),
        detune: makeParam(0, "detune"),
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
      const node = {
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
      createdBufferSources.push(node);
      return node;
    }
  }

  return {
    MockAudioContext,
    instances,
    ramps,
    freqEvents,
    createdOscillators,
    createdGains,
    createdFilters,
    createdBufferSources,
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
    expect(engine.getTrack()).toBe(DEFAULT_TRACK_ID);

    expect(() => {
      engine.setTrack("ocean-breeze");
      expect(engine.getTrack()).toBe("ocean-breeze");
      engine.setTrack("night-tea");
      expect(engine.getTrack()).toBe("night-tea");
      engine.setTrack("non-existent-track");
      expect(engine.getTrack()).toBe(DEFAULT_TRACK_ID);

      engine.startMusic();
      engine.duck(true);
      engine.duck(false);
      engine.playJumpSfx();
      engine.playVaultSfx();
      engine.playCrashSfx();
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
      engine.setTrack("ocean-breeze");
      engine.playJumpSfx();
      engine.playVaultSfx();
      engine.playCrashSfx();
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
    engine.playVaultSfx();
    engine.playCrashSfx();
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
    engine.playVaultSfx();
    engine.playCrashSfx();
    expect(mock.createdOscillators.length).toBe(countWhileMuted);

    engine.stopMusic();
    engine.dispose();

    // Advancing timers after dispose should not schedule further oscillators
    const countAfterDispose = mock.createdOscillators.length;
    vi.advanceTimersByTime(1000);
    expect(mock.createdOscillators.length).toBe(countAfterDispose);
  });

  it("exports CHILL_TRACKS (3 frozen tracks) and DEFAULT_TRACK_ID matching the exact contract", () => {
    expect(DEFAULT_TRACK_ID).toBe("lofi-garden");
    expect(Object.isFrozen(CHILL_TRACKS)).toBe(true);
    expect(CHILL_TRACKS).toHaveLength(3);

    expect(CHILL_TRACKS).toEqual([
      {
        id: "lofi-garden",
        labelVi: "Chiều Thu Lo-Fi",
        subtitleVi: "Rhodes & Kalimba · 74 BPM",
        bpm: 74,
      },
      {
        id: "ocean-breeze",
        labelVi: "Gió Biển Hoàng Hôn",
        subtitleVi: "Guitar mộc & Sóng dịu · 68 BPM",
        bpm: 68,
      },
      {
        id: "night-tea",
        labelVi: "Trà Đêm Phố Cổ",
        subtitleVi: "Ngũ cung & Sáo êm · 64 BPM",
        bpm: 64,
      },
    ]);

    for (const track of CHILL_TRACKS) {
      expect(Object.isFrozen(track)).toBe(true);
      expect(track.labelVi).toBe(track.labelVi.normalize("NFC"));
      expect(track.subtitleVi).toBe(track.subtitleVi.normalize("NFC"));
    }
  });

  it("supports initialTrackId, getTrack(), setTrack() validation and invalid fallback", () => {
    vi.useFakeTimers();
    const mock = createMockAudioContext();
    globalThis.AudioContext = mock.MockAudioContext;

    const defaultEngine = createChillAudioEngine();
    expect(defaultEngine.getTrack()).toBe("lofi-garden");

    const oceanEngine = createChillAudioEngine("ocean-breeze");
    expect(oceanEngine.getTrack()).toBe("ocean-breeze");

    const nightEngine = createChillAudioEngine("night-tea");
    expect(nightEngine.getTrack()).toBe("night-tea");

    const invalidInitEngine = createChillAudioEngine("not-a-valid-song");
    expect(invalidInitEngine.getTrack()).toBe(DEFAULT_TRACK_ID);

    const nullInitEngine = createChillAudioEngine(null);
    expect(nullInitEngine.getTrack()).toBe(DEFAULT_TRACK_ID);

    // Switching while stopped updates track without starting timers
    expect(defaultEngine.setTrack("ocean-breeze")).toBe("ocean-breeze");
    expect(defaultEngine.getTrack()).toBe("ocean-breeze");
    expect(vi.getTimerCount()).toBe(0);

    expect(defaultEngine.setTrack("night-tea")).toBe("night-tea");
    expect(defaultEngine.getTrack()).toBe("night-tea");

    // Invalid track id falls back safely to DEFAULT_TRACK_ID
    expect(defaultEngine.setTrack("bad-id")).toBe(DEFAULT_TRACK_ID);
    expect(defaultEngine.getTrack()).toBe(DEFAULT_TRACK_ID);
    expect(defaultEngine.setTrack(undefined)).toBe(DEFAULT_TRACK_ID);
    expect(defaultEngine.getTrack()).toBe(DEFAULT_TRACK_ID);

    defaultEngine.dispose();
    oceanEngine.dispose();
    nightEngine.dispose();
    invalidInitEngine.dispose();
    nullInitEngine.dispose();
  });

  it("switches tracks live without overlapping timers, clicks, or stale BPM", () => {
    vi.useFakeTimers();
    const mock = createMockAudioContext();
    globalThis.AudioContext = mock.MockAudioContext;

    const engine = createChillAudioEngine("lofi-garden");
    engine.startMusic();
    expect(vi.getTimerCount()).toBe(1);
    expect(mock.freqEvents.some((e) => Math.abs(e.val - 87.31) < 0.05)).toBe(true); // Fmaj7 bass

    // Setting the same track is an idempotent no-op (does not churn filters or timers)
    const filterCountBeforeNoop = mock.createdFilters.length;
    engine.setTrack("lofi-garden");
    expect(mock.createdFilters.length).toBe(filterCountBeforeNoop);
    expect(vi.getTimerCount()).toBe(1);

    // Live switch to ocean-breeze (68 BPM, Bbmaj7 bass 116.54 Hz, wave shimmer buffer)
    const audioCtx = mock.instances[0];
    audioCtx.currentTime = 2.0;
    const rampsBeforeOcean = mock.ramps.length;
    const bufSourcesBeforeOcean = mock.createdBufferSources.length;

    engine.setTrack("ocean-breeze");
    expect(engine.getTrack()).toBe("ocean-breeze");
    // Still strictly 1 active scheduler timer (zero overlap!)
    expect(vi.getTimerCount()).toBe(1);
    // Smooth crossfade ramps old track bus down and new track bus up
    const oceanSwitchRamps = mock.ramps.slice(rampsBeforeOcean);
    expect(oceanSwitchRamps.some((r) => r.val === 0.0001)).toBe(true);
    expect(oceanSwitchRamps.some((r) => r.val === 1)).toBe(true);
    // Ocean-breeze warm filter + Bbmaj7 bass (116.54 Hz) + airy wave/wood-rim buffer sources
    expect(mock.createdFilters.some((f) => f.type === "lowpass" && f.frequency.value === 1550)).toBe(true);
    expect(mock.freqEvents.some((e) => Math.abs(e.val - 116.54) < 0.05)).toBe(true);
    expect(mock.createdBufferSources.length).toBeGreaterThan(bufSourcesBeforeOcean);

    // Verify 68 BPM step scheduling cadence (eighth note = 60 / 68 / 2 ≈ 0.4412s)
    // Step 0 scheduled at 2.06s, Step 1 (rest) at 2.5012s, Step 2 (F4=349.23 Hz pluck) at 2.9424s
    audioCtx.currentTime = 2.75;
    const oscBeforeOceanTick = mock.createdOscillators.length;
    const freqCountBeforeOceanTick = mock.freqEvents.length;
    vi.advanceTimersByTime(150);
    expect(mock.createdOscillators.length).toBeGreaterThan(oscBeforeOceanTick);
    const oceanStep2Event = mock.freqEvents
      .slice(freqCountBeforeOceanTick)
      .find((e) => e.type === "set" && Math.abs(e.val - 349.23) < 0.05);
    expect(oceanStep2Event).toBeDefined();
    expect(oceanStep2Event.time).toBeCloseTo(2.06 + 2 * (60 / 68 / 2), 3);

    // Live switch to night-tea (64 BPM, D Major Pentatonic Dmaj9 bass 73.42 Hz, F#5 flute 739.99 Hz)
    audioCtx.currentTime = 4.0;
    const rampsBeforeNight = mock.ramps.length;
    engine.setTrack("night-tea");
    expect(engine.getTrack()).toBe("night-tea");
    expect(vi.getTimerCount()).toBe(1);

    const nightSwitchRamps = mock.ramps.slice(rampsBeforeNight);
    expect(nightSwitchRamps.some((r) => r.val === 0.0001)).toBe(true);
    expect(nightSwitchRamps.some((r) => r.val === 1)).toBe(true);
    // Night-tea warm filter + Dmaj9 bass (73.42 Hz) + D Major Pentatonic flute (739.99 Hz)
    expect(mock.createdFilters.some((f) => f.type === "lowpass" && f.frequency.value === 1800)).toBe(true);
    expect(mock.freqEvents.some((e) => Math.abs(e.val - 73.42) < 0.05)).toBe(true);
    expect(mock.freqEvents.some((e) => Math.abs(e.val - 739.99) < 0.1)).toBe(true);

    // Verify 64 BPM step scheduling cadence (eighth note = 60 / 64 / 2 = 0.46875s)
    // Step 2 (D5 = 587.33 Hz guzheng melody) should schedule at 4.06 + 2 * 0.46875 = 4.9975s
    const oscBeforeNightAdvance = mock.createdOscillators.length;
    const freqCountBeforeNightAdvance = mock.freqEvents.length;
    audioCtx.currentTime = 4.8;
    vi.advanceTimersByTime(150);
    expect(mock.createdOscillators.length).toBeGreaterThan(oscBeforeNightAdvance);
    const nightStep2Event = mock.freqEvents
      .slice(freqCountBeforeNightAdvance)
      .find((e) => e.type === "ramp" && Math.abs(e.val - 587.33) < 0.05);
    expect(nightStep2Event).toBeDefined();
    expect(nightStep2Event.time).toBeCloseTo(4.06 + 2 * (60 / 64 / 2) + 0.032, 3);

    engine.stopMusic();
    expect(vi.getTimerCount()).toBe(0);
    engine.dispose();
  });

  it("synthesizes joyful upward spring playVaultSfx() and respects mute/dispose", () => {
    const mock = createMockAudioContext();
    globalThis.AudioContext = mock.MockAudioContext;

    const engine = createChillAudioEngine();
    engine.playVaultSfx();

    // Springy upward sweep oscillators + 2 apex sparkle notes (each kalimba note has 2 oscs) = 6 oscillators
    expect(mock.createdOscillators.length).toBeGreaterThanOrEqual(4);
    expect(mock.freqEvents.some((e) => e.type === "set" && e.val === 260)).toBe(true);
    expect(mock.freqEvents.some((e) => e.type === "ramp" && e.val === 760)).toBe(true);
    expect(mock.freqEvents.some((e) => e.type === "ramp" && Math.abs(e.val - 1174.66) < 0.1)).toBe(true);

    // Muted engine suppresses playVaultSfx
    engine.setMuted(true);
    const oscCountMuted = mock.createdOscillators.length;
    engine.playVaultSfx();
    expect(mock.createdOscillators.length).toBe(oscCountMuted);

    // Disposed engine suppresses playVaultSfx
    engine.setMuted(false);
    engine.dispose();
    const oscCountDisposed = mock.createdOscillators.length;
    engine.playVaultSfx();
    expect(mock.createdOscillators.length).toBe(oscCountDisposed);
  });

  it("synthesizes crisp wooden shatter playCrashSfx() and respects mute/dispose", () => {
    const mock = createMockAudioContext();
    globalThis.AudioContext = mock.MockAudioContext;

    const engine = createChillAudioEngine();
    engine.playCrashSfx();

    // Filtered noise crack buffer source
    expect(mock.createdBufferSources.length).toBeGreaterThanOrEqual(1);
    expect(mock.createdFilters.some((f) => f.type === "bandpass")).toBe(true);
    // Warm lowpass filters for wood plank clatter & soft stumble thud (never harsh)
    expect(mock.createdFilters.some((f) => f.type === "lowpass" && f.frequency.value === 1250)).toBe(true);
    expect(mock.createdFilters.some((f) => f.type === "lowpass" && f.frequency.value === 360)).toBe(true);
    // Descending wood plank frequencies (520 -> 335, 410 -> 255, 305 -> 190) + soft thud (155 -> 68)
    expect(mock.freqEvents.some((e) => e.type === "set" && e.val === 520)).toBe(true);
    expect(mock.freqEvents.some((e) => e.type === "ramp" && e.val === 190)).toBe(true);
    expect(mock.freqEvents.some((e) => e.type === "ramp" && e.val === 68)).toBe(true);

    // Muted engine suppresses playCrashSfx
    engine.setMuted(true);
    const oscCountMuted = mock.createdOscillators.length;
    const bufCountMuted = mock.createdBufferSources.length;
    engine.playCrashSfx();
    expect(mock.createdOscillators.length).toBe(oscCountMuted);
    expect(mock.createdBufferSources.length).toBe(bufCountMuted);

    // Disposed engine suppresses playCrashSfx
    engine.setMuted(false);
    engine.dispose();
    const oscCountDisposed = mock.createdOscillators.length;
    engine.playCrashSfx();
    expect(mock.createdOscillators.length).toBe(oscCountDisposed);
  });
});
