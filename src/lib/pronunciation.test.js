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
  VIETNAMESE_VOICES,
  VOICE_CHANGE_EVENT,
  VOICE_STORAGE_KEY,
  clearTtsCache,
  getSelectedVoice,
  getVietnameseVoices,
  isSpeechRecognitionSupported,
  setSelectedVoice,
  speakVietnamese,
  startVietnameseListening,
  stopSpeaking,
} from "./speech.js";
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
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
    delete window.speechSynthesis;
    delete window.SpeechSynthesisUtterance;
  });

  it("exposes Vietnamese neural voice metadata, persists voice selection, and dispatches voice-change events", () => {
    expect(VIETNAMESE_VOICES).toEqual([
      {
        id: "hoaimy",
        label: "Hoài My",
        shortLabel: "Giọng nữ · Hoài My",
        gender: "female",
        edgeName: "vi-VN-HoaiMyNeural",
      },
      {
        id: "namminh",
        label: "Nam Minh",
        shortLabel: "Giọng nam · Nam Minh",
        gender: "male",
        edgeName: "vi-VN-NamMinhNeural",
      },
    ]);

    expect(getSelectedVoice()).toBe("hoaimy");

    const listener = vi.fn();
    window.addEventListener(VOICE_CHANGE_EVENT, listener);

    expect(setSelectedVoice("namminh")).toBe("namminh");
    expect(window.localStorage.getItem(VOICE_STORAGE_KEY)).toBe("namminh");
    expect(getSelectedVoice()).toBe("namminh");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ voice: "namminh" });

    // Unknown voice safely normalizes to default 'hoaimy'
    expect(setSelectedVoice("unknown-voice")).toBe("hoaimy");
    expect(getSelectedVoice()).toBe("hoaimy");

    window.removeEventListener(VOICE_CHANGE_EVENT, listener);
  });

  it("handles missing Web Speech APIs safely without throwing", async () => {
    expect(getVietnameseVoices()).toEqual([]);
    expect(isSpeechRecognitionSupported()).toBe(false);
    expect(() => stopSpeaking()).not.toThrow();

    const empty = await speakVietnamese("   ");
    expect(empty.source).toBe("none");
  });

  it("caches /api/tts audio blob URLs per voice and applies playbackRate", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "audio/mpeg" },
      blob: async () => new Blob(["fake-mp3"], { type: "audio/mpeg" }),
    });
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

    const first = await speakVietnamese("Xin chào", { rate: 0.9 });
    const second = await speakVietnamese("Xin chào", { rate: 1.15 });
    const thirdMale = await speakVietnamese("Xin chào", { rate: 1, voice: "namminh" });

    expect(first).toEqual({ source: "api" });
    expect(second).toEqual({ source: "api" });
    expect(thirdMale).toEqual({ source: "api" });
    expect(fetchMock).toHaveBeenCalledTimes(2); // hoaimy cached on 2nd call; namminh fetches fresh audio
    expect(fetchMock.mock.calls[0][0]).toContain("voice=hoaimy");
    expect(fetchMock.mock.calls[1][0]).toContain("voice=namminh");
    expect(playedRates).toEqual([0.9, 1.15, 1]);
    expect(playedSrcs[0]).toBe(playedSrcs[1]);
    expect(playedSrcs[2]).not.toBe(playedSrcs[0]);
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

    const result = await speakVietnamese("Cảm ơn bạn rất nhiều", { rate: 0.85 });
    expect(result).toEqual({ source: "webspeech" });
    expect(spokenUtterance.lang).toBe("vi-VN");
    expect(spokenUtterance.voice?.name).toBe("Microsoft HoaiMy");
    expect(spokenUtterance.rate).toBe(0.85);
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

  it("useVietnameseSpeech hook exposes expected state and controls including voice sync", () => {
    const { result, unmount } = renderHook(() => useVietnameseSpeech({ defaultRate: 0.9 }));
    expect(result.current.rate).toBe(0.9);
    expect(result.current.voice).toBe("hoaimy");
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
      result.current.setVoice("namminh");
    });
    expect(result.current.voice).toBe("namminh");
    expect(getSelectedVoice()).toBe("namminh");

    // External voice change event syncs mounted hooks automatically
    act(() => {
      setSelectedVoice("hoaimy");
    });
    expect(result.current.voice).toBe("hoaimy");

    act(() => {
      result.current.resetTranscript();
    });
    expect(result.current.finalTranscript).toBe("");
    unmount();
  });

  it("Navbar voice switcher toggles between Hoài My and Nam Minh and stays synced with voice-change events", () => {
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

    const voiceBtn = screen.getByRole("button", { name: /Đổi giọng đọc tiếng Việt/i });
    expect(voiceBtn.textContent).toContain("Hoài My");

    fireEvent.click(voiceBtn);
    expect(voiceBtn.textContent).toContain("Nam Minh");
    expect(getSelectedVoice()).toBe("namminh");

    act(() => {
      setSelectedVoice("hoaimy");
    });
    expect(voiceBtn.textContent).toContain("Hoài My");
  });
});
