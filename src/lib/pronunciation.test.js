import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { Navbar } from "../components/layout/Navbar.jsx";
import {
  TONE_ORDER,
  VIETNAMESE_TONES,
  extractVietnameseTone,
  matchDialogueIntent,
  normalizeVietnameseText,
  scoreVietnamesePronunciation,
  stripAllDiacritics,
  stripVietnameseTones,
} from "./pronunciation.js";
import {
  DEFAULT_VOICE_ID,
  RANDOM_VOICE_ID,
  RANDOM_VOICE_OPTION,
  TTS_BROWSER_CACHE_NAME,
  VIETNAMESE_VOICES,
  VOICE_CHANGE_EVENT,
  VOICE_OPTIONS,
  VOICE_STORAGE_KEY,
  clearTtsCache,
  getSelectedVoice,
  getVietnameseVoices,
  getVoiceMeta,
  isCachedInMemory,
  isSpeechRecognitionSupported,
  pickRandomVoiceForText,
  prefetchVietnamese,
  resolveEffectiveVoice,
  setSelectedVoice,
  speakVietnamese,
  startVietnameseListening,
  stopSpeaking,
} from "./speech.js";
import { pickRandomVoiceForText as apiPickRandomVoiceForText } from "../../api/tts.js";
import { LISTENING_EXERCISES, PRONUNCIATION_SENTENCES, TOPICS } from "../data/index.js";
import { useVietnameseSpeech } from "../hooks/useVietnameseSpeech.js";

describe("VIETNAMESE_TONES & extractVietnameseTone", () => {
  it("exposes complete metadata for all 6 Vietnamese tones", () => {
    expect(TONE_ORDER).toEqual(["ngang", "huyen", "sac", "hoi", "nga", "nang"]);
    for (const tone of TONE_ORDER) {
      const meta = VIETNAMESE_TONES[tone];
      expect(meta).toBeDefined();
      expect(meta.id).toBe(tone);
      expect(meta.nameVi.length).toBeGreaterThan(3);
      expect(meta.example.length).toBeGreaterThan(1);
      expect(meta.tipVi.length).toBeGreaterThan(10);
      expect(extractVietnameseTone(meta.example)).toBe(tone);
    }
  });

  it("identifies all 6 tones accurately on plain and modified Vietnamese vowels (ă, â, ê, ô, ơ, ư, y)", () => {
    const cases = [
      // Plain vowel a
      ["ma", "ngang"],
      ["mà", "huyen"],
      ["má", "sac"],
      ["mả", "hoi"],
      ["mã", "nga"],
      ["mạ", "nang"],
      // ă
      ["ăn", "ngang"],
      ["bằng", "huyen"],
      ["nắng", "sac"],
      ["thẳng", "hoi"],
      ["sẵn", "nga"],
      ["nặng", "nang"],
      // â
      ["ân", "ngang"],
      ["cần", "huyen"],
      ["rất", "sac"],
      ["cẩn", "hoi"],
      ["vẫn", "nga"],
      ["bận", "nang"],
      // ê
      ["tên", "ngang"],
      ["mềm", "huyen"],
      ["đến", "sac"],
      ["kể", "hoi"],
      ["dễ", "nga"],
      ["bệnh", "nang"],
      // ô
      ["tôi", "ngang"],
      ["ngồi", "huyen"],
      ["tốt", "sac"],
      ["phở", "hoi"], // ơ + hỏi
      ["mỗi", "nga"],
      ["vội", "nang"],
      // ơ & ư & diphthongs
      ["mơ", "ngang"],
      ["người", "huyen"],
      ["mới", "sac"],
      ["mở", "hoi"],
      ["bữa", "nga"],
      ["tự", "nang"],
      // y
      ["hy", "ngang"],
      ["kỳ", "huyen"],
      ["quý", "sac"],
      ["nghỉ", "hoi"],
      ["nghĩ", "nga"],
      ["kỵ", "nang"],
    ];

    for (const [syllable, expectedTone] of cases) {
      expect(extractVietnameseTone(syllable), `tone for "${syllable}"`).toBe(expectedTone);
    }
  });

  it("handles NFD decomposed Vietnamese text identically to NFC", () => {
    expect(extractVietnameseTone("người".normalize("NFD"))).toBe("huyen");
    expect(extractVietnameseTone("nắng".normalize("NFD"))).toBe("sac");
    expect(extractVietnameseTone("nặng".normalize("NFD"))).toBe("nang");
  });
});

describe("stripVietnameseTones, stripAllDiacritics & normalizeVietnameseText", () => {
  it("stripVietnameseTones removes only tone marks and preserves ă, â, ê, ô, ơ, ư, đ", () => {
    expect(stripVietnameseTones("đường phố Hà Nội")).toBe("đương phô Ha Nôi");
    expect(stripVietnameseTones("bữa ăn rất đậm đà")).toBe("bưa ăn rât đâm đa");
    expect(stripVietnameseTones("mới mời nắng nặng")).toBe("mơi mơi năng năng");
  });

  it("stripAllDiacritics strips all diacritics and converts đ/Đ to d/D", () => {
    expect(stripAllDiacritics("Đường phố Hà Nội")).toBe("Duong pho Ha Noi");
    expect(stripAllDiacritics("bữa ăn rất đậm đà")).toBe("bua an rat dam da");
  });

  it("normalizeVietnameseText converts to NFC, lowercases, strips punctuation, and collapses whitespace", () => {
    const nfdInput = "  Xin chào, bạn KHỎE không?!  ".normalize("NFD");
    expect(normalizeVietnameseText(nfdInput)).toBe("xin chào bạn khỏe không");
  });
});

describe("scoreVietnamesePronunciation", () => {
  it("scores an exact Vietnamese sentence as 100 / excellent", () => {
    const res = scoreVietnamesePronunciation(
      "Cuối tuần tôi thường đi uống cà phê với bạn.",
      "cuối tuần tôi thường đi uống cà phê với bạn"
    );
    expect(res.score).toBe(100);
    expect(res.wordAccuracy).toBe(100);
    expect(res.toneAccuracy).toBe(100);
    expect(res.rating).toBe("excellent");
    expect(res.wordDiffs.every((d) => d.status === "exact")).toBe(true);
  });

  it("treats old and new Vietnamese tone placement as exact matches (hòa/hoà, khỏe/khoẻ)", () => {
    const res = scoreVietnamesePronunciation("Hôm nay tôi rất khỏe và hòa đồng", "hôm nay tôi rất khoẻ và hoà đồng");
    expect(res.score).toBe(100);
    expect(res.rating).toBe("excellent");
    expect(res.wordDiffs.every((d) => d.status === "exact")).toBe(true);
  });

  it("explicitly detects minimal-pair tone mismatches with expected and spoken tones", () => {
    const pairs = [
      ["ma", "má", "ngang", "sac"],
      ["mới", "mời", "sac", "huyen"],
      ["nắng", "nặng", "sac", "nang"],
      ["nghĩ", "nghỉ", "nga", "hoi"],
    ];

    for (const [expected, spoken, expTone, spkTone] of pairs) {
      const res = scoreVietnamesePronunciation(expected, spoken);
      expect(res.toneAccuracy).toBe(0);
      expect(res.wordDiffs).toHaveLength(1);
      expect(res.wordDiffs[0]).toMatchObject({
        expected,
        spoken,
        status: "tone-mismatch",
        expectedTone: expTone,
        spokenTone: spkTone,
      });
      expect(res.feedbackVi).toContain("thanh điệu");
    }
  });

  it("distinguishes close vowel/consonant mismatches (e.g. bánh vs bệnh, cơm vs cảm)", () => {
    const res = scoreVietnamesePronunciation("bánh", "bệnh");
    expect(res.wordDiffs[0].status).toBe("close");
    expect(res.score).toBeGreaterThan(0);
    expect(res.score).toBeLessThan(80);
  });

  it("aligns smartly when learner inserts an extra filler word at the beginning or middle", () => {
    const res = scoreVietnamesePronunciation(
      "tôi thích uống cà phê sữa đá",
      "ờ tôi thích à uống cà phê sữa đá"
    );
    expect(res.wordDiffs).toHaveLength(7);
    expect(res.wordDiffs.every((d) => d.status === "exact")).toBe(true);
    expect(res.toneAccuracy).toBe(100);
    expect(res.score).toBe(100);
  });

  it("aligns smartly when learner omits words in the middle without shifting later matches", () => {
    const res = scoreVietnamesePronunciation(
      "hôm nay trời rất đẹp",
      "hôm nay đẹp"
    );
    expect(res.wordDiffs.map((d) => d.status)).toEqual([
      "exact",
      "exact",
      "missed",
      "missed",
      "exact",
    ]);
    expect(res.wordDiffs[2].spoken).toBeNull();
    expect(res.wordDiffs[4].spoken).toBe("đẹp");
    expect(res.score).toBe(60);
    expect(res.rating).toBe("fair");
  });

  it("handles empty spoken or expected inputs gracefully", () => {
    const noSpeech = scoreVietnamesePronunciation("xin chào", "   ");
    expect(noSpeech.score).toBe(0);
    expect(noSpeech.rating).toBe("retry");
    expect(noSpeech.wordDiffs).toHaveLength(2);
    expect(noSpeech.wordDiffs.every((d) => d.status === "missed")).toBe(true);

    const noExpected = scoreVietnamesePronunciation("", "xin chào");
    expect(noExpected.score).toBe(0);
    expect(noExpected.wordDiffs).toEqual([]);
  });
});

describe("matchDialogueIntent", () => {
  const options = [
    {
      id: "opt-coffee",
      textVi: "Cho tôi một ly cà phê sữa đá ít ngọt nhé",
      keywords: ["cà phê", "sữa đá", "ít ngọt"],
    },
    {
      id: "opt-tea",
      textVi: "Tôi muốn gọi một ấm trà sen nóng",
      keywords: ["trà sen", "nóng"],
    },
    {
      id: "opt-bill",
      textVi: "Em ơi cho anh thanh toán với ạ",
      keywords: ["thanh toán", "tính tiền"],
    },
  ];

  it("selects the matching branch for a natural spoken utterance", () => {
    const match = matchDialogueIntent("Cho tôi một ly cà phê sữa đá ít ngọt", options);
    expect(match.bestOptionId).toBe("opt-coffee");
    expect(match.bestScore).toBeGreaterThanOrEqual(85);
    expect(match.evaluation).not.toBeNull();
  });

  it("selects the right branch via keywords even when paraphrased or with minor tone slips", () => {
    const match = matchDialogueIntent("Mình uống tra sen nong nha", options);
    expect(match.bestOptionId).toBe("opt-tea");
    expect(match.bestScore).toBeGreaterThanOrEqual(55);
  });

  it("returns null bestOptionId when spoken input is empty", () => {
    const match = matchDialogueIntent("", options);
    expect(match).toEqual({
      bestOptionId: null,
      bestScore: 0,
      evaluation: null,
    });
  });
});

describe("speech.js & useVietnameseSpeech integration checks", () => {
  afterEach(() => {
    stopSpeaking();
    clearTtsCache();
    window.localStorage.removeItem(VOICE_STORAGE_KEY);
    vi.restoreAllMocks();
    delete window.caches;
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
    delete window.speechSynthesis;
    delete window.SpeechSynthesisUtterance;
  });

  it("defaults to random mode across 5 Northern voices, migrates legacy hoaimy/namminh IDs, and dispatches voice-change events", () => {
    expect(RANDOM_VOICE_ID).toBe("random");
    expect(DEFAULT_VOICE_ID).toBe("random");
    expect(RANDOM_VOICE_OPTION).toEqual({
      id: "random",
      label: "Ngẫu nhiên",
      shortLabel: "Xoay vòng 5 giọng Bắc",
      gender: "mixed",
      region: "Bắc",
      style: "Tự động chọn trong 5 giọng Miền Bắc",
    });
    expect(VIETNAMESE_VOICES).toEqual([
      {
        id: "ngochuyen",
        label: "Ngọc Huyền",
        shortLabel: "Nữ · Bắc · Tự nhiên",
        gender: "female",
        region: "Bắc",
        style: "Giọng đọc tự nhiên",
        hfVoice: "Ngọc Huyền",
        fallbackEdgeVoice: "vi-VN-HoaiMyNeural",
      },
      {
        id: "trucly",
        label: "Trúc Ly",
        shortLabel: "Nữ · Bắc · Tự nhiên",
        gender: "female",
        region: "Bắc",
        style: "Phong cách tự nhiên",
        hfVoice: "Trúc Ly",
        fallbackEdgeVoice: "vi-VN-HoaiMyNeural",
      },
      {
        id: "maianh",
        label: "Mai Anh",
        shortLabel: "Nữ · Bắc · Tin tức rõ chữ",
        gender: "female",
        region: "Bắc",
        style: "Phong cách tin tức rõ chữ",
        hfVoice: "Mai Anh",
        fallbackEdgeVoice: "vi-VN-HoaiMyNeural",
      },
      {
        id: "haidang",
        label: "Hải Đăng",
        shortLabel: "Nam · Bắc · Tự nhiên",
        gender: "male",
        region: "Bắc",
        style: "Phong cách tự nhiên",
        hfVoice: "Hải Đăng",
        fallbackEdgeVoice: "vi-VN-NamMinhNeural",
      },
      {
        id: "thienminh",
        label: "Thiện Minh",
        shortLabel: "Nam · Bắc · Kể chuyện",
        gender: "male",
        region: "Bắc",
        style: "Phong cách kể chuyện",
        hfVoice: "Thiện Minh",
        fallbackEdgeVoice: "vi-VN-NamMinhNeural",
      },
    ]);
    expect(VOICE_OPTIONS).toEqual([RANDOM_VOICE_OPTION, ...VIETNAMESE_VOICES]);

    // Default voice is 'random'
    expect(getSelectedVoice()).toBe("random");
    expect(getVoiceMeta()).toEqual(RANDOM_VOICE_OPTION);
    expect(getVoiceMeta("random")).toEqual(RANDOM_VOICE_OPTION);
    expect(getVoiceMeta("thienminh")).toMatchObject({
      id: "thienminh",
      hfVoice: "Thiện Minh",
      gender: "male",
      fallbackEdgeVoice: "vi-VN-NamMinhNeural",
    });

    // Legacy localStorage migration
    window.localStorage.setItem(VOICE_STORAGE_KEY, "namminh");
    expect(getSelectedVoice()).toBe("haidang");
    expect(window.localStorage.getItem(VOICE_STORAGE_KEY)).toBe("haidang");

    window.localStorage.setItem(VOICE_STORAGE_KEY, "hoaimy");
    expect(getSelectedVoice()).toBe("ngochuyen");
    expect(window.localStorage.getItem(VOICE_STORAGE_KEY)).toBe("ngochuyen");

    const listener = vi.fn();
    window.addEventListener(VOICE_CHANGE_EVENT, listener);

    expect(setSelectedVoice("haidang")).toBe("haidang");
    expect(window.localStorage.getItem(VOICE_STORAGE_KEY)).toBe("haidang");
    expect(getSelectedVoice()).toBe("haidang");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ voice: "haidang" });

    // Full Vietnamese name, 'Ngẫu nhiên' & legacy alias via setSelectedVoice
    expect(setSelectedVoice("Thiện Minh")).toBe("thienminh");
    expect(setSelectedVoice("Ngẫu nhiên")).toBe("random");
    expect(getSelectedVoice()).toBe("random");
    expect(setSelectedVoice("hoaimy")).toBe("ngochuyen");
    expect(setSelectedVoice("namminh")).toBe("haidang");

    // Unknown voice safely normalizes to default 'random'
    expect(setSelectedVoice("unknown-voice")).toBe("random");
    expect(getSelectedVoice()).toBe("random");

    window.removeEventListener(VOICE_CHANGE_EVENT, listener);
  });

  it("pickRandomVoiceForText distributes deterministically across all 5 Northern voices and matches api/tts.js", () => {
    const realisticPhrases = [
      "Xin chào Hà Nội",
      "Cảm ơn bạn rất nhiều",
      "Tôi thích ăn phở bò tái chín",
      "Hôm nay thời tiết se lạnh và có nắng nhẹ",
      "Cuối tuần tôi thường đi uống cà phê sữa đá với bạn bè",
      "Bún chả Hà Nội có nước chấm rất đậm đà",
      "Em ơi cho anh thanh toán với ạ",
      "Bạn có hay đi dạo quanh hồ Hoàn Kiếm không",
      "Tôi đang luyện phát âm sáu thanh điệu tiếng Việt",
      "Sáng nay tôi thức dậy sớm và tập thể dục",
      "Món nem rán này giòn rụm và thơm phức",
      "Theo tôi, học ngoại ngữ cần kiên trì mỗi ngày",
      "Xin lỗi, bạn có thể nói chậm hơn một chút được không",
      "Chúc bạn một ngày làm việc thật hiệu quả",
      "Hẹn gặp lại bạn vào tối thứ bảy nhé",
      ...TOPICS.flatMap((t) => (t.keyPhrases || []).map((p) => p.vi)),
      ...LISTENING_EXERCISES.map((e) => e.audioTextVi),
      ...PRONUNCIATION_SENTENCES.map((s) => s.textVi),
    ].filter(Boolean);

    const counts = new Map();
    const allowedIds = new Set(VIETNAMESE_VOICES.map((v) => v.id));

    for (const phrase of realisticPhrases) {
      const picked1 = pickRandomVoiceForText(phrase);
      const picked2 = pickRandomVoiceForText(`  ${phrase.replace(/ /g, "   ")}  `.normalize("NFD"));
      const apiPicked = apiPickRandomVoiceForText(phrase);

      expect(allowedIds.has(picked1)).toBe(true);
      expect(picked1).toBe(picked2);
      expect(picked1).toBe(apiPicked);
      expect(resolveEffectiveVoice("random", phrase)).toBe(picked1);
      expect(resolveEffectiveVoice("maianh", phrase)).toBe("maianh");
      counts.set(picked1, (counts.get(picked1) || 0) + 1);
    }

    // All 5 Northern voices must appear across realistic study phrases
    expect(new Set(counts.keys())).toEqual(allowedIds);
    for (const id of allowedIds) {
      expect(counts.get(id)).toBeGreaterThanOrEqual(5);
    }
  });

  it("handles missing Web Speech APIs safely without throwing", async () => {
    expect(getVietnameseVoices()).toEqual([]);
    expect(isSpeechRecognitionSupported()).toBe(false);
    expect(() => stopSpeaking()).not.toThrow();

    const empty = await speakVietnamese("   ");
    expect(empty.source).toBe("none");
  });

  it("caches /api/tts audio in memory & Browser Cache API (speed-independent URL) and applies playbackRate", async () => {
    const cacheStore = new Map();
    const mockCacheBucket = {
      match: vi.fn(async (key) => cacheStore.get(key) || undefined),
      put: vi.fn(async (key, resp) => {
        cacheStore.set(key, resp);
      }),
    };
    window.caches = {
      open: vi.fn(async (name) => {
        expect(name).toBe(TTS_BROWSER_CACHE_NAME);
        return mockCacheBucket;
      }),
    };

    const makeAudioResponse = (payload = "RIFF-fake-wav") => {
      const resp = {
        ok: true,
        headers: { get: () => "audio/wav" },
        blob: async () => new Blob([payload], { type: "audio/wav" }),
        clone: () => makeAudioResponse(payload),
      };
      return resp;
    };

    const fetchMock = vi.fn().mockImplementation(async () => makeAudioResponse());
    vi.stubGlobal("fetch", fetchMock);
    let blobCounter = 0;
    vi.spyOn(URL, "createObjectURL").mockImplementation(() => `blob:mock-tts-${++blobCounter}`);
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    const playedRates = [];
    const playedSrcs = [];
    class MockAudio {
      constructor(src) {
        this.src = src;
        this.playbackRate = 1;
        this.preservesPitch = false;
        this.currentTime = 0;
      }
      play() {
        playedRates.push(this.playbackRate);
        playedSrcs.push(this.src);
        queueMicrotask(() => this.onended?.());
        return Promise.resolve();
      }
      pause() {}
    }
    vi.stubGlobal("Audio", MockAudio);

    const randomVoiceForHello = pickRandomVoiceForText("Xin chào");
    const alternateVoice = randomVoiceForHello === "haidang" ? "ngochuyen" : "haidang";

    expect(isCachedInMemory("Xin chào")).toBe(false);
    expect(isCachedInMemory("Xin chào", "random")).toBe(false);
    expect(isCachedInMemory("Xin chào", randomVoiceForHello)).toBe(false);

    const first = await speakVietnamese("Xin chào", { rate: 0.9 });
    const second = await speakVietnamese("Xin chào", { rate: 1.15 });
    const thirdExplicitSame = await speakVietnamese("Xin chào", {
      rate: 1,
      voice: randomVoiceForHello,
    });
    const fourthAlternate = await speakVietnamese("Xin chào", {
      rate: 1,
      voice: alternateVoice,
    });

    expect(first).toEqual({ source: "api" });
    expect(second).toEqual({ source: "api" });
    expect(thirdExplicitSame).toEqual({ source: "api" });
    expect(fourthAlternate).toEqual({ source: "api" });
    expect(isCachedInMemory("Xin chào")).toBe(true);
    expect(isCachedInMemory("Xin chào", "random")).toBe(true);
    expect(isCachedInMemory("Xin chào", randomVoiceForHello)).toBe(true);
    expect(isCachedInMemory("Xin chào", alternateVoice)).toBe(true);
    // Random mode & explicit resolved Northern voice share the EXACT same cache entry (1 fetch);
    // alternateVoice fetches fresh audio (total = 2)
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toContain(`voice=${randomVoiceForHello}`);
    expect(fetchMock.mock.calls[0][0]).not.toContain("voice=random");
    expect(fetchMock.mock.calls[0][0]).not.toContain("speed=");
    expect(fetchMock.mock.calls[1][0]).toContain(`voice=${alternateVoice}`);
    expect(fetchMock.mock.calls[1][0]).not.toContain("speed=");
    expect(playedRates).toEqual([0.9, 1.15, 1, 1]);
    expect(playedSrcs[0]).toBe(playedSrcs[1]);
    expect(playedSrcs[0]).toBe(playedSrcs[2]);
    expect(playedSrcs[3]).not.toBe(playedSrcs[0]);

    // Clear in-memory cache -> next speak hits persistent Browser Cache API with zero extra network fetches!
    clearTtsCache();
    expect(isCachedInMemory("Xin chào", "random")).toBe(false);
    const fromBrowserCache = await speakVietnamese("Xin chào", { rate: 0.75 });
    expect(fromBrowserCache).toEqual({ source: "api" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(isCachedInMemory("Xin chào", "random")).toBe(true);
    expect(isCachedInMemory("Xin chào", randomVoiceForHello)).toBe(true);
  });

  it("deduplicates in-flight fetches between prefetchVietnamese and speakVietnamese in default random mode and respects concurrency limit", async () => {
    const deferredByUrl = new Map();
    const fetchMock = vi.fn((url) => {
      let resolveFetch;
      const promise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      deferredByUrl.set(url, { resolve: resolveFetch });
      return promise;
    });
    vi.stubGlobal("fetch", fetchMock);

    let blobCounter = 0;
    vi.spyOn(URL, "createObjectURL").mockImplementation(() => `blob:prefetch-${++blobCounter}`);
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    class MockAudio {
      constructor(src) {
        this.src = src;
        this.playbackRate = 1;
        this.currentTime = 0;
      }
      play() {
        queueMicrotask(() => this.onended?.());
        return Promise.resolve();
      }
      pause() {}
    }
    vi.stubGlobal("Audio", MockAudio);

    const expectedVoice1 = pickRandomVoiceForText("Xin chào Hà Nội");
    const expectedVoice3 = pickRandomVoiceForText("Tạm biệt nhé");

    // Queue 3 unique phrases (plus duplicate + empty) under default 'random' mode -> maxConcurrent = 2 starts first 2 immediately
    prefetchVietnamese(["Xin chào Hà Nội", "   ", "Xin chào Hà Nội", "Cảm ơn bạn", "Tạm biệt nhé"]);
    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    const firstUrl = fetchMock.mock.calls[0][0];
    const secondUrl = fetchMock.mock.calls[1][0];
    expect(firstUrl).toContain(`voice=${expectedVoice1}`);
    expect(firstUrl).not.toContain("voice=random");

    // Clicking Speak on an already in-flight prefetched phrase awaits the SAME Promise (1 fetch instead of 2!)
    const speakPromise = speakVietnamese("Xin chào Hà Nội");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Resolve first in-flight fetch -> both prefetch and speakVietnamese share the cached blob
    deferredByUrl.get(firstUrl).resolve({
      ok: true,
      headers: { get: () => "audio/wav" },
      blob: async () => new Blob(["RIFF-wav-1"], { type: "audio/wav" }),
    });

    const speakRes = await speakPromise;
    expect(speakRes).toEqual({ source: "api" });
    expect(isCachedInMemory("Xin chào Hà Nội")).toBe(true);
    expect(isCachedInMemory("Xin chào Hà Nội", expectedVoice1)).toBe(true);

    // Resolve second fetch -> 3rd queued item starts and completes cleanly
    deferredByUrl.get(secondUrl).resolve({
      ok: true,
      headers: { get: () => "audio/wav" },
      blob: async () => new Blob(["RIFF-wav-2"], { type: "audio/wav" }),
    });

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
    const thirdUrl = fetchMock.mock.calls[2][0];
    expect(thirdUrl).toContain(`voice=${expectedVoice3}`);
    deferredByUrl.get(thirdUrl).resolve({
      ok: true,
      headers: { get: () => "audio/wav" },
      blob: async () => new Blob(["RIFF-wav-3"], { type: "audio/wav" }),
    });

    await vi.waitFor(() => {
      expect(isCachedInMemory("Tạm biệt nhé")).toBe(true);
      expect(isCachedInMemory("Tạm biệt nhé", expectedVoice3)).toBe(true);
    });

    // Re-prefetching & speaking an already-cached phrase triggers zero extra network requests
    prefetchVietnamese("Xin chào Hà Nội");
    await speakVietnamese("Tạm biệt nhé");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("falls back automatically to Web Speech vi-VN when /api/tts fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    let spokenUtterance = null;
    class MockUtterance {
      constructor(text) {
        this.text = text;
        this.lang = "";
        this.rate = 1;
        this.voice = null;
      }
    }
    window.SpeechSynthesisUtterance = MockUtterance;
    window.speechSynthesis = {
      getVoices: () => [
        { name: "English", lang: "en-US" },
        { name: "Microsoft HoaiMy", lang: "vi-VN" },
        { name: "Microsoft NamMinh", lang: "vi-VN" },
      ],
      cancel: vi.fn(),
      speak: vi.fn((utt) => {
        spokenUtterance = utt;
        queueMicrotask(() => {
          utt.onstart?.();
          utt.onend?.();
        });
      }),
    };

    const resolvedForThanks = getVoiceMeta(pickRandomVoiceForText("Cảm ơn bạn rất nhiều"));
    const result = await speakVietnamese("Cảm ơn bạn rất nhiều", { rate: 0.85 });
    expect(result).toEqual({ source: "webspeech" });
    expect(spokenUtterance.lang).toBe("vi-VN");
    expect(spokenUtterance.voice?.name).toBe(
      resolvedForThanks.gender === "male" ? "Microsoft NamMinh" : "Microsoft HoaiMy"
    );
    expect(spokenUtterance.rate).toBe(0.85);

    const femaleResult = await speakVietnamese("Xin chào", { voice: "ngochuyen" });
    expect(femaleResult).toEqual({ source: "webspeech" });
    expect(spokenUtterance.voice?.name).toBe("Microsoft HoaiMy");

    const maleResult = await speakVietnamese("Xin chào", { voice: "haidang" });
    expect(maleResult).toEqual({ source: "webspeech" });
    expect(spokenUtterance.voice?.name).toBe("Microsoft NamMinh");
  });

  it("startVietnameseListening emits interim, final results, and Vietnamese error messages", () => {
    let instance = null;
    class MockRecognition {
      constructor() {
        this.lang = "";
        this.interimResults = false;
        this.continuous = false;
        instance = this;
      }
      start() {}
      stop() {
        this.onend?.();
      }
      abort() {
        this.onend?.();
      }
    }
    window.SpeechRecognition = MockRecognition;
    expect(isSpeechRecognitionSupported()).toBe(true);

    const onInterim = vi.fn();
    const onResult = vi.fn();
    const onEnd = vi.fn();

    const handle = startVietnameseListening({ onInterim, onResult, onEnd });
    expect(instance.lang).toBe("vi-VN");
    expect(instance.interimResults).toBe(true);

    instance.onresult({
      results: [{ isFinal: false, 0: { transcript: "xin chào", confidence: 0.9 }, length: 1 }],
    });
    expect(onInterim).toHaveBeenCalledWith("xin chào");

    // Stopping while only interim exists still delivers best transcript via onResult
    handle.stop();
    expect(onResult).toHaveBeenCalledWith("xin chào", expect.objectContaining({ isFinal: true }));
    expect(onEnd).toHaveBeenCalledTimes(1);

    // Error localization check
    const onError = vi.fn();
    startVietnameseListening({ onError });
    instance.onerror({ error: "not-allowed" });
    expect(onError).toHaveBeenCalledWith(expect.stringContaining("quyền sử dụng micro"), "not-allowed");
  });

  it("useVietnameseSpeech hook defaults to random mode and exposes voiceOptions, Northern voices, voiceMeta, prefetch, and voice sync", () => {
    const { result, unmount } = renderHook(() => useVietnameseSpeech({ defaultRate: 0.9 }));
    expect(result.current.rate).toBe(0.9);
    expect(result.current.voice).toBe("random");
    expect(result.current.voiceMeta).toEqual(RANDOM_VOICE_OPTION);
    expect(result.current.voices).toEqual(VIETNAMESE_VOICES);
    expect(result.current.voiceOptions).toEqual(VOICE_OPTIONS);
    expect(typeof result.current.prefetch).toBe("function");
    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.isListening).toBe(false);
    expect(result.current.sttSupported).toBe(false);
    expect(result.current.micLevel).toBe(0);
    expect(result.current.lastRecordingUrl).toBeNull();

    act(() => {
      result.current.setRate(1.15);
    });
    expect(result.current.rate).toBe(1.15);

    act(() => {
      result.current.setVoice("haidang");
    });
    expect(result.current.voice).toBe("haidang");
    expect(result.current.voiceMeta.label).toBe("Hải Đăng");
    expect(getSelectedVoice()).toBe("haidang");

    // External voice change event syncs mounted hooks automatically
    act(() => {
      setSelectedVoice("maianh");
    });
    expect(result.current.voice).toBe("maianh");
    expect(result.current.voiceMeta.label).toBe("Mai Anh");

    act(() => {
      setSelectedVoice("random");
    });
    expect(result.current.voice).toBe("random");
    expect(result.current.voiceMeta).toEqual(RANDOM_VOICE_OPTION);

    act(() => {
      result.current.resetTranscript();
    });
    expect(result.current.finalTranscript).toBe("");
    unmount();
  });

  it("Navbar Northern voice picker defaults to Ngẫu nhiên, opens Random + all 5 voices, selects voice, and stays synced with voice-change events", () => {
    render(
      React.createElement(Navbar, {
        activeView: "dashboard",
        onNavigate: vi.fn(),
        skillProgress: { xp: 120, streakDays: 3 },
        user: null,
        userProfile: null,
        storageMode: "local",
        isSupabaseConfigured: false,
        onOpenAuth: vi.fn(),
      })
    );

    const triggerBtn = screen.getByTestId("navbar-voice-trigger");
    expect(triggerBtn.textContent).toContain("Ngẫu nhiên");
    expect(triggerBtn.querySelector("[data-testid='navbar-voice-icon-random']")).not.toBeNull();

    fireEvent.click(triggerBtn);
    const menu = screen.getByTestId("navbar-voice-menu");
    expect(menu.textContent).toContain("Giọng đọc Miền Bắc · VieNeu-TTS");
    expect(menu.textContent).toContain("Ngẫu nhiên");
    expect(menu.textContent).toContain("Tự động xoay vòng 5 giọng Bắc");
    for (const v of VIETNAMESE_VOICES) {
      expect(menu.textContent).toContain(v.label);
    }
    expect(menu.textContent).toContain("Nữ · Tin tức rõ chữ");

    const haiDangOption = screen.getByRole("option", { name: /Hải Đăng/i });
    fireEvent.click(haiDangOption);
    expect(triggerBtn.textContent).toContain("Hải Đăng");
    expect(triggerBtn.querySelector("[data-testid='navbar-voice-icon-voice']")).not.toBeNull();
    expect(getSelectedVoice()).toBe("haidang");
    expect(screen.queryByTestId("navbar-voice-menu")).toBeNull();

    act(() => {
      setSelectedVoice("trucly");
    });
    expect(triggerBtn.textContent).toContain("Trúc Ly");

    act(() => {
      setSelectedVoice("random");
    });
    expect(triggerBtn.textContent).toContain("Ngẫu nhiên");
    expect(triggerBtn.querySelector("[data-testid='navbar-voice-icon-random']")).not.toBeNull();
  });
});
