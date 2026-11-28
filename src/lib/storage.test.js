import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ttsHandler, {
  NORTHERN_VOICES,
  RANDOM_VOICE_ID,
  adaptiveMaxFrames,
  buildEdgeSsml,
  computeCachePath,
  fetchVieNeuAudio,
  generateSecMsGecV2,
  normalizeLang,
  normalizeSpeed,
  normalizeVoice,
  pickRandomVoiceForText,
  resolveEdgeVoice,
  resolveEffectiveVoice,
  resolveNorthernVoice,
  speedToEdgeRate,
  splitTextIntoChunks,
  toSafeHeaderValue,
} from "../../api/tts.js";
import { pickRandomVoiceForText as clientPickRandomVoiceForText } from "./speech.js";
import {
  NORTHERN_VOICE_IDS,
  computeTtsCachePath,
  normalizeTtsText,
  sha256Hex,
  sha256HexSync,
} from "./ttsText.js";
import {
  GAME_TYPES,
  MASTERY_LEVELS,
  SKILL_IDS,
  SKILL_META,
  TOPIC_IDS,
  TOPIC_META,
  USER_ROLES,
  createEmptySkillProgress,
  isValidSkillId,
  isValidTopicId,
  normalizeDeck,
  normalizeFlashcard,
  normalizeGameResult,
} from "./contracts.js";
import {
  getCurrentUser,
  getSession,
  isSupabaseConfigured,
  onAuthStateChange,
  supabase,
} from "./supabase.js";
import {
  addFlashcard,
  addFlashcardsBulk,
  clearLocalStorageData,
  createDeck,
  deleteDeck,
  deleteFlashcard,
  getStorageMode,
  loadAssignedDecksFromCloud,
  loadDecks,
  loadGameHistory,
  loadPreferences,
  loadSkillProgress,
  recordSkillGain,
  saveGameSession,
  savePreferences,
  saveSkillProgress,
  setFlashcardMastery,
  syncLocalToCloud,
  updateDeck,
  updateFlashcard,
} from "./storage.js";

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    },
    end(payload) {
      this.body = payload ?? null;
      return this;
    },
  };
}

describe("api/tts.js", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes language codes safely with Vietnamese default", () => {
    expect(normalizeLang(undefined)).toBe("vi");
    expect(normalizeLang("vi")).toBe("vi");
    expect(normalizeLang("vi-VN")).toBe("vi");
    expect(normalizeLang("VN")).toBe("vi");
    expect(normalizeLang("en-US")).toBe("en");
    expect(normalizeLang("invalid!lang")).toBe("vi");
  });

  it("maps playback speed hints to supported upstream ttsspeed and Edge SSML rate values", () => {
    expect(normalizeSpeed(undefined)).toBe(1);
    expect(normalizeSpeed("abc")).toBe(1);
    expect(normalizeSpeed("0.5")).toBe(0.24);
    expect(normalizeSpeed("0.75")).toBe(0.5);
    expect(normalizeSpeed("1")).toBe(1);
    expect(normalizeSpeed("1.2")).toBe(1);

    expect(speedToEdgeRate(undefined)).toBe("+0%");
    expect(speedToEdgeRate("abc")).toBe("+0%");
    expect(speedToEdgeRate("0.6")).toBe("-40%");
    expect(speedToEdgeRate("0.4")).toBe("-40%");
    expect(speedToEdgeRate("0.75")).toBe("-25%");
    expect(speedToEdgeRate("1")).toBe("+0%");
    expect(speedToEdgeRate("1.15")).toBe("+15%");
    expect(speedToEdgeRate("1.5")).toBe("+50%");
    expect(speedToEdgeRate("2.0")).toBe("+50%");
  });

  it("normalizes all 5 Northern Vietnamese voices + legacy hoaimy/namminh aliases, computes deterministic cache paths, and chooses adaptive max_new_frames", () => {
    expect(Object.keys(NORTHERN_VOICES)).toEqual([
      "ngochuyen",
      "trucly",
      "maianh",
      "haidang",
      "thienminh",
    ]);

    // Default & exact Northern IDs
    expect(normalizeVoice(undefined)).toBe("ngochuyen");
    expect(normalizeVoice("ngochuyen")).toBe("ngochuyen");
    expect(normalizeVoice("trucly")).toBe("trucly");
    expect(normalizeVoice("maianh")).toBe("maianh");
    expect(normalizeVoice("haidang")).toBe("haidang");
    expect(normalizeVoice("thienminh")).toBe("thienminh");

    // Full Vietnamese HF display names
    expect(normalizeVoice("Ngọc Huyền")).toBe("ngochuyen");
    expect(normalizeVoice("Trúc Ly")).toBe("trucly");
    expect(normalizeVoice("Mai Anh")).toBe("maianh");
    expect(normalizeVoice("Hải Đăng")).toBe("haidang");
    expect(normalizeVoice("Thiện Minh")).toBe("thienminh");

    // Legacy Edge aliases migrate cleanly
    expect(normalizeVoice("hoaimy")).toBe("ngochuyen");
    expect(normalizeVoice("vi-VN-HoaiMyNeural")).toBe("ngochuyen");
    expect(normalizeVoice("namminh")).toBe("haidang");
    expect(normalizeVoice("vi-VN-NamMinhNeural")).toBe("haidang");
    expect(normalizeVoice("unknown")).toBe("ngochuyen");

    // Northern metadata & Edge fallback gender mapping
    expect(resolveNorthernVoice("ngochuyen")).toMatchObject({
      id: "ngochuyen",
      hfVoice: "Ngọc Huyền",
      gender: "female",
      region: "Bắc",
      fallbackEdgeVoice: "vi-VN-HoaiMyNeural",
    });
    expect(resolveNorthernVoice("thienminh")).toMatchObject({
      id: "thienminh",
      hfVoice: "Thiện Minh",
      gender: "male",
      region: "Bắc",
      fallbackEdgeVoice: "vi-VN-NamMinhNeural",
    });

    expect(resolveEdgeVoice("vi", "maianh")).toEqual({
      id: "maianh",
      edgeName: "vi-VN-HoaiMyNeural",
      locale: "vi-VN",
    });
    expect(resolveEdgeVoice("vi", "haidang")).toEqual({
      id: "haidang",
      edgeName: "vi-VN-NamMinhNeural",
      locale: "vi-VN",
    });
    expect(resolveEdgeVoice("vi", "namminh")).toEqual({
      id: "haidang",
      edgeName: "vi-VN-NamMinhNeural",
      locale: "vi-VN",
    });

    // Deterministic SHA-256 cache path matching RLS regex
    const p1 = computeCachePath("  Xin   chào Hà Nội  ", "Ngọc Huyền");
    const p2 = computeCachePath("Xin chào Hà Nội", "ngochuyen");
    const p3 = computeCachePath("Xin chào Hà Nội", "haidang");
    expect(p1.cachePath).toBe(p2.cachePath);
    expect(p1.cachePath).not.toBe(p3.cachePath);
    expect(p1.cachePath).toMatch(/^v1\/ngochuyen\/[a-f0-9]{64}\.wav$/);
    expect(p3.cachePath).toMatch(/^v1\/haidang\/[a-f0-9]{64}\.wav$/);

    // Random voice mode resolves deterministically & matches client FNV-1a hash
    expect(RANDOM_VOICE_ID).toBe("random");
    expect(NORTHERN_VOICES.maianh.style).toBe("Phong cách tin tức rõ chữ");
    const randomVoiceForHello = pickRandomVoiceForText("Xin chào Hà Nội");
    expect(randomVoiceForHello).toBe(clientPickRandomVoiceForText("Xin chào Hà Nội"));
    expect(normalizeVoice("random", "Xin chào Hà Nội")).toBe(randomVoiceForHello);
    expect(resolveEffectiveVoice("random", "Xin chào Hà Nội")).toBe(randomVoiceForHello);
    expect(resolveNorthernVoice("random", "Xin chào Hà Nội").id).toBe(randomVoiceForHello);
    const pRandom = computeCachePath("  Xin   chào Hà Nội  ", "random");
    const pDirect = computeCachePath("Xin chào Hà Nội", randomVoiceForHello);
    expect(pRandom.cachePath).toBe(pDirect.cachePath);
    expect(pRandom.voice.id).toBe(randomVoiceForHello);

    // Adaptive max_new_frames thresholds
    expect(adaptiveMaxFrames("Xin chào")).toBe(100); // <= 25
    expect(adaptiveMaxFrames("a".repeat(25))).toBe(100);
    expect(adaptiveMaxFrames("a".repeat(26))).toBe(170); // <= 75
    expect(adaptiveMaxFrames("a".repeat(75))).toBe(170);
    expect(adaptiveMaxFrames("a".repeat(76))).toBe(250); // <= 140
    expect(adaptiveMaxFrames("a".repeat(140))).toBe(250);
    expect(adaptiveMaxFrames("a".repeat(141))).toBe(340); // > 140

    // Safe ASCII header sanitization & Edge helpers
    expect(toSafeHeaderValue("Ngọc Huyền")).toBe("Ngoc Huyen");
    expect(toSafeHeaderValue("Hải Đăng")).toBe("Hai Dang");
    expect(toSafeHeaderValue("Thiện Minh")).toBe("Thien Minh");

    const ssml = buildEdgeSsml('A & B < "C" > \'D\'', resolveEdgeVoice("vi", "haidang"), "-25%");
    expect(ssml).toContain('voice name="vi-VN-NamMinhNeural"');
    expect(ssml).toContain('rate="-25%"');
    expect(ssml).toContain("A &amp; B &lt; &quot;C&quot; &gt; &apos;D&apos;");

    const token = generateSecMsGecV2(1700000000000);
    expect(token).toMatch(/^[0-9A-F]{16}-[0-9A-F]{64}$/);
  });

  it("synthesizes WAV bytes through VieNeu-TTS Gradio SSE API with adaptive max_new_frames", async () => {
    const fakeWav = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00]).buffer;
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ event_id: "evt-123" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          'event: heartbeat\ndata: null\n\nevent: complete\ndata: [{"url":"https://nam194-vieneu-tts-v3-turbo.hf.space/gradio_api/file=/tmp/out.wav"},"RTF: 0.18"]\n\n',
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "audio/wav" },
        arrayBuffer: async () => fakeWav,
      });

    const audio = await fetchVieNeuAudio("Xin chào", "ngochuyen", { fetchImpl: mockFetch });
    expect(Buffer.isBuffer(audio)).toBe(true);
    expect(audio.byteLength).toBe(8);
    expect(mockFetch).toHaveBeenCalledTimes(3);

    const [callUrl, callInit] = mockFetch.mock.calls[0];
    expect(callUrl).toBe("https://nam194-vieneu-tts-v3-turbo.hf.space/gradio_api/call/synthesize");
    const parsedBody = JSON.parse(callInit.body);
    expect(parsedBody.data).toEqual([
      "Xin chào",
      "Ngọc Huyền",
      null,
      0.8,
      25,
      0.95,
      1.2,
      100,
      200,
      true,
    ]);
    expect(mockFetch.mock.calls[1][0]).toContain("/gradio_api/call/synthesize/evt-123");
    expect(mockFetch.mock.calls[2][0]).toContain("/tmp/out.wav");
  });

  it("splits long Vietnamese text cleanly into chunks <= 200 chars without dropping words", () => {
    expect(splitTextIntoChunks("   ")).toEqual([]);
    expect(splitTextIntoChunks("Xin chào Hà Nội")).toEqual(["Xin chào Hà Nội"]);

    const passage =
      "Sáng nay thời tiết ở Hà Nội mát mẻ và hơi se lạnh. Tôi thức dậy sớm lúc sáu giờ, pha một tách cà phê phin đậm đà rồi đọc tin tức buổi sáng. Đến trưa tôi hẹn đồng nghiệp đi ăn bún chả gần công ty, còn buổi tối tôi luyện nghe và nói tiếng Việt để cải thiện phản xạ tự nhiên.";
    const chunks = splitTextIntoChunks(passage, 200);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(200);
    }
    expect(chunks.join(" ")).toBe(passage);
  });

  it("returns 204 for OPTIONS, 405 for non-GET, and 400 for missing/overlength text", async () => {
    const resOptions = createMockRes();
    await ttsHandler({ method: "OPTIONS", query: {} }, resOptions);
    expect(resOptions.statusCode).toBe(204);

    const resPost = createMockRes();
    await ttsHandler({ method: "POST", query: { text: "Xin chào" } }, resPost);
    expect(resPost.statusCode).toBe(405);
    expect(resPost.headers["cache-control"]).toBe("no-store");
    expect(resPost.body.error).toMatch(/Method not allowed/i);

    const resEmpty = createMockRes();
    await ttsHandler({ method: "GET", query: { text: "   " } }, resEmpty);
    expect(resEmpty.statusCode).toBe(400);
    expect(resEmpty.headers["cache-control"]).toBe("no-store");
    expect(resEmpty.body.error).toMatch(/Missing required/i);

    const resTooLong = createMockRes();
    await ttsHandler({ method: "GET", query: { text: "a".repeat(1001) } }, resTooLong);
    expect(resTooLong.statusCode).toBe(400);
    expect(resTooLong.headers["cache-control"]).toBe("no-store");
    expect(resTooLong.body.maxLength).toBe(1000);
  });

  it("executes full 3-tier TTS waterfall: Supabase cache hit -> HF VieNeu-TTS miss + persist -> Edge fallback -> Google fallback -> 502/504", async () => {
    const fakeWav = Buffer.from("RIFF\x24\x00\x00\x00WAVEfmt ", "binary");
    const fakeEdgeMp3 = Buffer.from([0xff, 0xf3, 0x64, 0xc4, 0x00, 0x00]);
    const fakeGoogleMp3 = new Uint8Array([0x49, 0x44, 0x33, 0x03]).buffer;

    // Tier 1: Supabase Storage Cache HIT -> immutable audio/wav, zero HF/Edge calls
    const fetchCacheHit = vi.fn().mockResolvedValue(fakeWav);
    const fetchVieNeuSpy = vi.fn();
    const synthesizeEdgeSpy = vi.fn();
    const resCache = createMockRes();
    await ttsHandler(
      { method: "GET", query: { text: "Xin chào", lang: "vi", voice: "ngochuyen" } },
      resCache,
      {
        fetchCache: fetchCacheHit,
        fetchVieNeu: fetchVieNeuSpy,
        synthesizeEdge: synthesizeEdgeSpy,
      }
    );
    expect(resCache.statusCode).toBe(200);
    expect(resCache.headers["content-type"]).toBe("audio/wav");
    expect(resCache.headers["x-tts-provider"]).toBe("vieneu-cache");
    expect(resCache.headers["x-tts-voice"]).toBe("Ngoc Huyen");
    expect(resCache.headers["x-tts-voice-id"]).toBe("ngochuyen");
    expect(resCache.headers["cache-control"]).toBe("public, max-age=31536000, immutable");
    expect(fetchVieNeuSpy).not.toHaveBeenCalled();
    expect(synthesizeEdgeSpy).not.toHaveBeenCalled();

    // Direct API call with voice=random resolves deterministically to a concrete Northern voice & cache path
    const expectedRandomVoiceId = pickRandomVoiceForText("Phở bò Hà Nội");
    const expectedRandomMeta = NORTHERN_VOICES[expectedRandomVoiceId];
    const fetchCacheRandom = vi.fn().mockResolvedValue(fakeWav);
    const resRandom = createMockRes();
    await ttsHandler(
      { method: "GET", query: { text: "Phở bò Hà Nội", lang: "vi", voice: "random" } },
      resRandom,
      {
        fetchCache: fetchCacheRandom,
        fetchVieNeu: fetchVieNeuSpy,
        synthesizeEdge: synthesizeEdgeSpy,
      }
    );
    expect(resRandom.statusCode).toBe(200);
    expect(resRandom.headers["x-tts-provider"]).toBe("vieneu-cache");
    expect(resRandom.headers["x-tts-voice-id"]).toBe(expectedRandomVoiceId);
    expect(resRandom.headers["x-tts-voice"]).toBe(expectedRandomMeta.headerVoice);
    expect(fetchCacheRandom).toHaveBeenCalledWith(
      computeCachePath("Phở bò Hà Nội", expectedRandomVoiceId).cachePath
    );

    // Tier 2: Supabase Cache MISS -> HF VieNeu-TTS HIT -> persists to Supabase (swallows write errors cleanly)
    const fetchCacheMiss = vi.fn().mockResolvedValue(null);
    const fetchVieNeuOk = vi.fn().mockResolvedValue(fakeWav);
    const persistCacheFail = vi.fn().mockRejectedValue(new Error("409 conflict"));
    const resHf = createMockRes();
    await ttsHandler(
      { method: "GET", query: { text: "Hà Nội mùa thu", lang: "vi-VN", voice: "Hải Đăng" } },
      resHf,
      {
        fetchCache: fetchCacheMiss,
        fetchVieNeu: fetchVieNeuOk,
        persistCache: persistCacheFail,
        synthesizeEdge: synthesizeEdgeSpy,
      }
    );
    expect(resHf.statusCode).toBe(200);
    expect(resHf.headers["content-type"]).toBe("audio/wav");
    expect(resHf.headers["x-tts-provider"]).toBe("vieneu-hf");
    expect(resHf.headers["x-tts-voice"]).toBe("Hai Dang");
    expect(resHf.headers["x-tts-voice-id"]).toBe("haidang");
    expect(resHf.headers["cache-control"]).toContain("max-age=86400");
    expect(fetchVieNeuOk).toHaveBeenCalledWith(
      "Hà Nội mùa thu",
      expect.objectContaining({ id: "haidang", hfVoice: "Hải Đăng" })
    );
    expect(persistCacheFail).toHaveBeenCalledWith(
      expect.stringMatching(/^v1\/haidang\/[a-f0-9]{64}\.wav$/),
      fakeWav
    );
    expect(synthesizeEdgeSpy).not.toHaveBeenCalled();

    // Tier 3a: HF fails -> Edge Neural fallback with matching gender Northern voice
    const fetchVieNeuFail = vi.fn().mockRejectedValue(new Error("HF Space sleeping"));
    const synthesizeEdgeOk = vi.fn().mockResolvedValue(fakeEdgeMp3);

    const resEdgeFemale = createMockRes();
    await ttsHandler(
      { method: "GET", query: { text: "Xin chào", lang: "vi", voice: "maianh", speed: "0.75" } },
      resEdgeFemale,
      {
        fetchCache: fetchCacheMiss,
        fetchVieNeu: fetchVieNeuFail,
        synthesizeEdge: synthesizeEdgeOk,
      }
    );
    expect(resEdgeFemale.statusCode).toBe(200);
    expect(resEdgeFemale.headers["content-type"]).toBe("audio/mpeg");
    expect(resEdgeFemale.headers["x-tts-provider"]).toBe("edge-fallback");
    expect(resEdgeFemale.headers["x-tts-voice"]).toBe("vi-VN-HoaiMyNeural");
    expect(resEdgeFemale.headers["x-tts-voice-id"]).toBe("maianh");
    expect(synthesizeEdgeOk).toHaveBeenCalledWith(
      "Xin chào",
      expect.objectContaining({ edgeName: "vi-VN-HoaiMyNeural" }),
      "-25%",
      expect.any(Number)
    );

    const resEdgeMale = createMockRes();
    await ttsHandler(
      { method: "GET", query: { text: "Xin chào", lang: "vi", voice: "thienminh", speed: "1.15" } },
      resEdgeMale,
      {
        fetchCache: fetchCacheMiss,
        fetchVieNeu: fetchVieNeuFail,
        synthesizeEdge: synthesizeEdgeOk,
      }
    );
    expect(resEdgeMale.statusCode).toBe(200);
    expect(resEdgeMale.headers["x-tts-provider"]).toBe("edge-fallback");
    expect(resEdgeMale.headers["x-tts-voice"]).toBe("vi-VN-NamMinhNeural");
    expect(resEdgeMale.headers["x-tts-voice-id"]).toBe("thienminh");

    // Tier 3b: HF + Edge fail -> Google Translate TTS fallback
    const synthesizeEdgeFail = vi.fn().mockRejectedValue(new Error("Edge temporarily unavailable"));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "audio/mpeg" },
        arrayBuffer: async () => fakeGoogleMp3,
      })
    );

    const resGoogle = createMockRes();
    await ttsHandler(
      { method: "GET", query: { text: "Xin chào", lang: "vi-VN", voice: "trucly" } },
      resGoogle,
      {
        fetchCache: fetchCacheMiss,
        fetchVieNeu: fetchVieNeuFail,
        synthesizeEdge: synthesizeEdgeFail,
      }
    );
    expect(resGoogle.statusCode).toBe(200);
    expect(resGoogle.headers["content-type"]).toBe("audio/mpeg");
    expect(resGoogle.headers["x-tts-provider"]).toBe("google-fallback");
    expect(resGoogle.headers["x-tts-voice"]).toBe("google-vi");
    expect(resGoogle.headers["x-tts-voice-id"]).toBe("trucly");

    // All tiers fail -> 502 with no-store
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        headers: { get: () => "text/html" },
      })
    );
    const resFail = createMockRes();
    await ttsHandler({ method: "GET", query: { text: "Xin chào" } }, resFail, {
      fetchCache: fetchCacheMiss,
      fetchVieNeu: fetchVieNeuFail,
      synthesizeEdge: synthesizeEdgeFail,
    });
    expect(resFail.statusCode).toBe(502);
    expect(resFail.body.upstreamStatus).toBe(503);
    expect(resFail.headers["cache-control"]).toBe("no-store");

    // All tiers time out -> 504 with no-store
    const abortErr = new Error("Timeout");
    abortErr.name = "AbortError";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortErr));
    const resTimeout = createMockRes();
    await ttsHandler({ method: "GET", query: { text: "Xin chào" } }, resTimeout, {
      fetchCache: fetchCacheMiss,
      fetchVieNeu: vi.fn().mockRejectedValue(abortErr),
      synthesizeEdge: vi.fn().mockRejectedValue(abortErr),
    });
    expect(resTimeout.statusCode).toBe(504);
    expect(resTimeout.headers["cache-control"]).toBe("no-store");
  });

  it("matches computeTtsCachePath in src/lib/ttsText.js identically with api/tts.js computeCachePath across voices, NFC/NFD, and pure-JS SHA-256 fallback", async () => {
    const samples = [
      "Xin chào Hà Nội",
      "  Tôi thích ăn   phở bò tái chín!  ",
      "Chào mọi người, mình là Nam. Quê gốc mình ở Đà Nẵng.".normalize("NFD"),
      "Nước dùng bún bò Huế rất đậm đà.",
    ];

    for (const sample of samples) {
      for (const voiceId of [...NORTHERN_VOICE_IDS, "random"]) {
        const apiComputed = computeCachePath(sample, voiceId);
        const sharedPath = await computeTtsCachePath(voiceId, sample);
        expect(sharedPath).toBe(apiComputed.cachePath);

        const normalized = normalizeTtsText(sample);
        const expectedHex = sha256HexSync(`${apiComputed.voice.id}::${normalized}`);
        expect(expectedHex).toBe(apiComputed.hash);
        expect(await sha256Hex(`${apiComputed.voice.id}::${normalized}`)).toBe(apiComputed.hash);
      }
    }

    // Verify sha256Hex still matches when crypto.subtle is absent
    const originalCrypto = globalThis.crypto;
    vi.stubGlobal("crypto", {});
    try {
      const noSubtlePath = await computeTtsCachePath("maianh", "Xin chào Hà Nội");
      expect(noSubtlePath).toBe(computeCachePath("Xin chào Hà Nội", "maianh").cachePath);
    } finally {
      vi.stubGlobal("crypto", originalCrypto);
    }
  });
});

describe("src/lib/contracts.js", () => {
  it("defines all 6 topic IDs and 4 skill IDs with matching metadata", () => {
    expect(TOPIC_IDS).toEqual(["self", "food", "routine", "weather", "emotions", "opinions"]);
    expect(SKILL_IDS).toEqual(["listening", "speaking", "reading", "pronunciation"]);
    for (const topicId of TOPIC_IDS) {
      expect(isValidTopicId(topicId)).toBe(true);
      expect(TOPIC_META[topicId].titleVi.length).toBeGreaterThan(2);
    }
    for (const skillId of SKILL_IDS) {
      expect(isValidSkillId(skillId)).toBe(true);
      expect(SKILL_META[skillId].labelVi.length).toBeGreaterThan(1);
    }
    expect(isValidTopicId("unknown")).toBe(false);
    expect(isValidSkillId("writing")).toBe(false);
    expect(MASTERY_LEVELS.NEW).toBe(0);
    expect(GAME_TYPES.LISTEN_MATCH).toBe("listen_match");
  });

  it("normalizes flashcards from both camelCase and snake_case inputs", () => {
    const fromSnake = normalizeFlashcard(
      {
        id: "card-1",
        front_vi: "  đậm đà ",
        part_of_speech: "tính từ",
        ipa: "/ɗəm˧˨ʔ ɗaː˨˩/",
        definition: "rich in flavor",
        example_vi: "Nước phở rất đậm đà.",
        example_en: "The pho broth is very flavorful.",
        topic_id: "food",
        mastery_level: 9,
        review_count: 3,
      },
      "deck-1"
    );
    expect(fromSnake).toMatchObject({
      id: "card-1",
      deckId: "deck-1",
      frontVi: "đậm đà",
      pos: "tính từ",
      ipa: "/ɗəm˧˨ʔ ɗaː˨˩/",
      definition: "rich in flavor",
      exampleVi: "Nước phở rất đậm đà.",
      exampleEn: "The pho broth is very flavorful.",
      topicId: "food",
      masteryLevel: 5, // clamped to 0..5
      reviewCount: 3,
    });

    const fromCamel = normalizeFlashcard({
      frontVi: "thư giãn",
      pos: "động từ",
      definition: "to relax",
      topicId: "invalid-topic",
      masteryLevel: -2,
    });
    expect(fromCamel.frontVi).toBe("thư giãn");
    expect(fromCamel.topicId).toBeNull();
    expect(fromCamel.masteryLevel).toBe(0);
  });

  it("normalizes decks (sorting nested cards) and game results (computing accuracy)", () => {
    const deck = normalizeDeck({
      id: "deck-food",
      title: "Ẩm thực",
      topic_id: "food",
      is_default: true,
      flashcards: [
        { front_vi: "cay", definition: "spicy", position: 2 },
        { front_vi: "ngon", definition: "delicious", position: 0 },
      ],
    });
    expect(deck.cardCount).toBe(2);
    expect(deck.isDefault).toBe(true);
    expect(deck.isAssigned).toBe(false);
    expect(deck.teacherName).toBe("");
    expect(deck.assignedAt).toBeNull();
    expect(deck.ownerId).toBeNull();
    expect(deck.canEdit).toBe(true);
    expect(deck.cards.map((c) => c.frontVi)).toEqual(["ngon", "cay"]);

    // USER_ROLES + teacher-assigned fields from snake_case and camelCase
    expect(USER_ROLES).toEqual({ STUDENT: "student", TEACHER: "teacher" });
    const assignedFromSnake = normalizeDeck({
      id: "deck-assigned-1",
      title: "Bài đọc Tuần 3",
      user_id: "teacher-1",
      is_assigned: true,
      teacher_name: "Cô Minh",
      assigned_at: "2026-05-12T08:00:00.000Z",
      canEdit: false,
      flashcards: [{ front_vi: "hội thoại", definition: "conversation" }],
    });
    expect(assignedFromSnake).toMatchObject({
      id: "deck-assigned-1",
      isAssigned: true,
      teacherName: "Cô Minh",
      assignedAt: "2026-05-12T08:00:00.000Z",
      ownerId: "teacher-1",
      canEdit: false,
      cardCount: 1,
    });

    const assignedFromCamel = normalizeDeck({
      title: "Nghe hiểu",
      ownerId: "teacher-2",
      isAssigned: true,
      teacherName: "Thầy Nam",
      assignedAt: "2026-05-13T09:00:00.000Z",
    });
    expect(assignedFromCamel).toMatchObject({
      isAssigned: true,
      teacherName: "Thầy Nam",
      assignedAt: "2026-05-13T09:00:00.000Z",
      ownerId: "teacher-2",
      canEdit: true,
    });

    const result = normalizeGameResult({
      game_type: "tone_radar",
      topic_id: "emotions",
      skill_tags: ["listening", "pronunciation", "invalid", "listening"],
      score: 7,
      max_score: 10,
      duration_seconds: 42,
      details_json: { streak: 4 },
    });
    expect(result).toMatchObject({
      gameType: "tone_radar",
      topicId: "emotions",
      skillTags: ["listening", "pronunciation"],
      score: 7,
      maxScore: 10,
      accuracy: 70,
      durationSeconds: 42,
      details: { streak: 4 },
    });
  });
});

describe("src/lib/storage.js (localStorage fallback mode)", () => {
  beforeEach(() => {
    clearLocalStorageData();
  });

  afterEach(() => {
    clearLocalStorageData();
    vi.useRealTimers();
  });

  it("runs cleanly in local mode when Supabase env vars are absent", async () => {
    expect(isSupabaseConfigured).toBe(false);
    expect(supabase).toBeNull();
    expect(await getStorageMode()).toBe("local");
    expect(await getSession()).toEqual({ session: null, user: null, error: null });
    expect(await getCurrentUser()).toBeNull();
    const unsub = onAuthStateChange(() => {});
    expect(typeof unsub).toBe("function");
    unsub();
    expect(await syncLocalToCloud()).toEqual({ syncedDecks: 0, syncedCards: 0, syncedSessions: 0 });
  });

  it("supports full deck & flashcard CRUD, bulk add, and mastery updates", async () => {
    // Seed once when empty
    const seeded = await loadDecks([
      {
        title: "Chủ đề Bản thân",
        topicId: "self",
        isDefault: true,
        cards: [
          { frontVi: "hòa đồng", pos: "tính từ", definition: "sociable", exampleVi: "Cô ấy rất hòa đồng." },
        ],
      },
    ]);
    expect(seeded).toHaveLength(1);
    expect(seeded[0].cards).toHaveLength(1);

    // Subsequent load does not overwrite existing decks
    const reloaded = await loadDecks([{ title: "Should Not Overwrite" }]);
    expect(reloaded).toHaveLength(1);
    expect(reloaded[0].title).toBe("Chủ đề Bản thân");

    // Create deck + add single + bulk add
    const foodDeck = await createDeck({ title: "Món ăn Việt", topicId: "food" });
    const card1 = await addFlashcard(foodDeck.id, {
      front_vi: "thanh đạm",
      pos: "tính từ",
      definition: "light and subtle flavor",
      example_vi: "Món canh này có vị thanh đạm.",
    });
    expect(card1.frontVi).toBe("thanh đạm");
    expect(card1.topicId).toBe("food");

    const bulk = await addFlashcardsBulk(foodDeck.id, [
      { frontVi: "béo ngậy", definition: "rich and creamy" },
      { frontVi: "giòn rụm", definition: "very crispy" },
      { frontVi: "", definition: "missing term should be skipped" },
    ]);
    expect(bulk).toHaveLength(2);

    // Update flashcard with snake_case & camelCase
    const edited = await updateFlashcard(card1.id, {
      ipa: "/tʰajŋ̟˧˧ ɗaːm˧˨ʔ/",
      mastery_level: 1,
    });
    expect(edited.ipa).toBe("/tʰajŋ̟˧˧ ɗaːm˧˨ʔ/");
    expect(edited.masteryLevel).toBe(1);

    // Set mastery increments reviewCount and stamps lastReviewedAt
    const mastered = await setFlashcardMastery(card1.id, 2);
    expect(mastered.masteryLevel).toBe(2);
    expect(mastered.reviewCount).toBe(1);
    expect(mastered.lastReviewedAt).toBeTruthy();

    // Update deck metadata
    const updatedDeck = await updateDeck(foodDeck.id, { title: "Ẩm thực 3 miền", topic_id: "food" });
    expect(updatedDeck.title).toBe("Ẩm thực 3 miền");
    expect(updatedDeck.cards).toHaveLength(3);

    // Delete flashcard and deck
    await deleteFlashcard(bulk[0].id);
    const afterCardDel = (await loadDecks()).find((d) => d.id === foodDeck.id);
    expect(afterCardDel.cards).toHaveLength(2);

    await deleteDeck(foodDeck.id);
    expect(await loadDecks()).toHaveLength(1);
  });

  it("accumulates skill progress, XP, topic mastery, and multi-day streaks accurately", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 10, 9, 0, 0));

    const empty = await loadSkillProgress();
    expect(empty).toMatchObject({
      listening: 0,
      speaking: 0,
      reading: 0,
      pronunciation: 0,
      xp: 0,
      streakDays: 0,
      lastActiveDate: null,
    });

    // Day 1 practice
    const day1 = await recordSkillGain({
      skillTags: ["listening", "pronunciation"],
      accuracy: 80,
      topicId: "weather",
      xpDelta: 40,
    });
    expect(day1.xp).toBe(40);
    expect(day1.streakDays).toBe(1);
    expect(day1.lastActiveDate).toBe("2026-05-10");
    expect(day1.listening).toBeGreaterThan(0);
    expect(day1.pronunciation).toBeGreaterThan(0);
    expect(day1.topicMastery.weather).toBeGreaterThan(0);

    // Same day again: streak stays 1, XP increases
    const sameDay = await recordSkillGain({
      skillTags: ["reading"],
      accuracy: 90,
      topicId: "opinions",
      xpDelta: 30,
    });
    expect(sameDay.streakDays).toBe(1);
    expect(sameDay.xp).toBe(70);

    // Next consecutive day: streak increments to 2
    vi.setSystemTime(new Date(2026, 4, 11, 10, 0, 0));
    const day2 = await recordSkillGain({
      skillTags: ["speaking"],
      accuracy: 85,
      topicId: "emotions",
      xpDelta: 25,
    });
    expect(day2.streakDays).toBe(2);
    expect(day2.lastActiveDate).toBe("2026-05-11");
    expect(day2.xp).toBe(95);

    // Gap of 3 days: streak resets to 1
    vi.setSystemTime(new Date(2026, 4, 14, 10, 0, 0));
    const afterGap = await recordSkillGain({
      skillTags: ["listening"],
      accuracy: 95,
      topicId: "weather",
      xpDelta: 20,
    });
    expect(afterGap.streakDays).toBe(1);
    expect(afterGap.xp).toBe(115);

    // Explicit saveSkillProgress
    const saved = await saveSkillProgress({ ...createEmptySkillProgress(), xp: 250, streakDays: 5 });
    expect(saved.xp).toBe(250);
    expect(saved.streakDays).toBe(5);
  });

  it("saves game sessions, updates skill progress, filters history, and stores preferences", async () => {
    const res1 = await saveGameSession({
      gameType: "listen_match",
      topicId: "food",
      skillTags: ["listening"],
      score: 9,
      maxScore: 10,
      durationSeconds: 60,
    });
    expect(res1.session.accuracy).toBe(90);
    expect(res1.progress.listening).toBeGreaterThan(0);

    await saveGameSession({
      gameType: "dialogue_builder",
      topicId: "routine",
      skillTags: ["speaking", "pronunciation"],
      score: 8,
      maxScore: 10,
      durationSeconds: 95,
    });

    const allHistory = await loadGameHistory();
    expect(allHistory).toHaveLength(2);

    const foodOnly = await loadGameHistory({ topicId: "food" });
    expect(foodOnly).toHaveLength(1);
    expect(foodOnly[0].gameType).toBe("listen_match");

    const dialogueOnly = await loadGameHistory({ gameType: "dialogue_builder" });
    expect(dialogueOnly).toHaveLength(1);
    expect(dialogueOnly[0].topicId).toBe("routine");

    const limited = await loadGameHistory({ limit: 1 });
    expect(limited).toHaveLength(1);

    const prefs = savePreferences({ autoPlayAudio: true, speechRate: 0.9 });
    expect(prefs.autoPlayAudio).toBe(true);
    expect(loadPreferences()).toMatchObject({ autoPlayAudio: true, speechRate: 0.9 });
  });

  it("preserves isAssigned/teacherName/assignedAt locally and stores guest assigned mastery in localStorage", async () => {
    expect(await loadAssignedDecksFromCloud(null)).toEqual([]);

    const created = await createDeck({
      title: "Bài tập PDF tuần 1",
      topicId: "food",
      isAssigned: true,
      teacherName: "Cô Minh",
      cards: [{ frontVi: "nước chấm", definition: "dipping sauce" }],
    });
    expect(created.isAssigned).toBe(true);
    expect(created.teacherName).toBe("Cô Minh");
    expect(created.assignedAt).toBeTruthy();

    const loaded = await loadDecks();
    expect(loaded[0]).toMatchObject({
      id: created.id,
      isAssigned: true,
      teacherName: "Cô Minh",
    });

    const unassigned = await updateDeck(created.id, { isAssigned: false });
    expect(unassigned.isAssigned).toBe(false);
    expect(unassigned.assignedAt).toBeNull();

    const reassigned = await updateDeck(created.id, {
      isAssigned: true,
      teacherName: "Cô Lan",
    });
    expect(reassigned.isAssigned).toBe(true);
    expect(reassigned.teacherName).toBe("Cô Lan");
    expect(reassigned.assignedAt).toBeTruthy();

    // Guest assigned mastery persists to vietflow_v1_assigned_mastery
    const firstMastery = await setFlashcardMastery("assigned-card-1", 3, {
      deckId: "assigned-deck-1",
      isAssignedDeck: true,
    });
    expect(firstMastery).toMatchObject({
      id: "assigned-card-1",
      deckId: "assigned-deck-1",
      masteryLevel: 3,
      reviewCount: 1,
    });

    const secondMastery = await setFlashcardMastery("assigned-card-1", 5, {
      deckId: "assigned-deck-1",
      isAssignedDeck: true,
    });
    expect(secondMastery.masteryLevel).toBe(5);
    expect(secondMastery.reviewCount).toBe(2);

    const storedMap = JSON.parse(
      globalThis.localStorage.getItem("vietflow_v1_assigned_mastery")
    );
    expect(storedMap["assigned-card-1"]).toMatchObject({
      deckId: "assigned-deck-1",
      masteryLevel: 5,
      reviewCount: 2,
    });
  });
});

/**
 * In-memory Postgres-like Supabase mock enforcing global UUID PRIMARY KEY
 * constraints on flashcard_decks, flashcards, and game_sessions across users,
 * plus student_card_progress composite PK and flashcards owner-only UPDATE RLS.
 */
function createMockMultiUserSupabase() {
  const tables = {
    flashcard_decks: [],
    flashcards: [],
    game_sessions: [],
    skill_progress: [],
    student_card_progress: [],
  };

  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  let activeUser = null;
  let flashcardUpdateAttempts = 0;

  function assertValidPk(tableName, row) {
    if (tableName === "skill_progress" || tableName === "student_card_progress") return;
    if (!UUID_RE.test(String(row.id || ""))) {
      throw new Error(`invalid input syntax for type uuid: "${row.id}"`);
    }
    if (tables[tableName].some((existing) => existing.id === row.id)) {
      throw new Error(
        `duplicate key value violates unique constraint "${tableName}_pkey" (23505)`
      );
    }
  }

  function makeBuilder(tableName) {
    const state = {
      op: "select",
      selectSpec: "*",
      selectOpts: {},
      filters: [],
      orders: [],
      payload: null,
      upsertOpts: {},
      single: false,
      maybeSingle: false,
    };

    const run = async () => {
      if (state.op === "select") {
        let rows = tables[tableName].filter((r) =>
          state.filters.every(([k, v]) => r[k] === v)
        );
        if (state.orders.length > 0) {
          rows = [...rows].sort((a, b) => {
            for (const [col, ascending] of state.orders) {
              const av = a[col] ?? "";
              const bv = b[col] ?? "";
              if (av !== bv) {
                return ascending ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
              }
            }
            return 0;
          });
        }
        if (state.selectOpts?.head && state.selectOpts?.count === "exact") {
          return { data: null, count: rows.length, error: null };
        }
        if (tableName === "flashcard_decks" && state.selectSpec.includes("flashcards(")) {
          rows = rows.map((d) => ({
            ...d,
            flashcards: tables.flashcards.filter((c) => c.deck_id === d.id),
          }));
        }
        if (state.single) return { data: rows[0] || null, error: null };
        if (state.maybeSingle) return { data: rows[0] || null, error: null };
        return { data: rows, error: null };
      }

      if (state.op === "insert") {
        const items = Array.isArray(state.payload) ? state.payload : [state.payload];
        const now = new Date().toISOString();
        const inserted = [];
        try {
          for (const item of items) {
            assertValidPk(tableName, item);
            const fullRow = { created_at: now, updated_at: now, ...item };
            tables[tableName].push(fullRow);
            inserted.push(fullRow);
          }
        } catch (err) {
          return { data: null, error: err };
        }
        return { data: state.single ? inserted[0] : inserted, error: null };
      }

      if (state.op === "update") {
        if (tableName === "flashcards") {
          flashcardUpdateAttempts += 1;
        }
        const now = new Date().toISOString();
        const matched = [];
        for (let i = 0; i < tables[tableName].length; i += 1) {
          const row = tables[tableName][i];
          if (!state.filters.every(([k, v]) => row[k] === v)) continue;
          if (tableName === "flashcards" && activeUser && row.user_id !== activeUser.id) {
            return {
              data: null,
              error: new Error("RLS violation: cannot update another user's flashcard"),
            };
          }
          const nextRow = { ...row, ...state.payload, updated_at: now };
          tables[tableName][i] = nextRow;
          matched.push(
            tableName === "flashcard_decks" && state.selectSpec.includes("flashcards(")
              ? {
                  ...nextRow,
                  flashcards: tables.flashcards.filter((c) => c.deck_id === nextRow.id),
                }
              : nextRow
          );
        }
        if (state.single) {
          if (matched.length === 0) {
            return { data: null, error: new Error("JSON object requested, multiple (or no) rows returned") };
          }
          return { data: matched[0], error: null };
        }
        return { data: matched, error: null };
      }

      if (state.op === "upsert") {
        const item = state.payload;
        const onConflict = String(state.upsertOpts?.onConflict || "user_id");
        const keys = onConflict.split(",").map((k) => k.trim());
        const idx = tables[tableName].findIndex((r) =>
          keys.every((k) => r[k] === item[k])
        );
        const fullRow = { updated_at: new Date().toISOString(), ...item };
        if (idx >= 0) tables[tableName][idx] = { ...tables[tableName][idx], ...fullRow };
        else tables[tableName].push(fullRow);
        return { data: state.single ? fullRow : [fullRow], error: null };
      }

      if (state.op === "delete") {
        tables[tableName] = tables[tableName].filter(
          (r) => !state.filters.every(([k, v]) => r[k] === v)
        );
        return { data: null, error: null };
      }

      return { data: null, error: null };
    };

    const builder = {
      select(spec = "*", opts = {}) {
        state.selectSpec = spec;
        state.selectOpts = opts;
        return builder;
      },
      insert(payload) {
        state.op = "insert";
        state.payload = payload;
        return builder;
      },
      update(payload) {
        state.op = "update";
        state.payload = payload;
        return builder;
      },
      upsert(payload, opts = {}) {
        state.op = "upsert";
        state.payload = payload;
        state.upsertOpts = opts;
        return builder;
      },
      delete() {
        state.op = "delete";
        return builder;
      },
      eq(col, val) {
        state.filters.push([col, val]);
        return builder;
      },
      order(col, opts = {}) {
        state.orders.push([col, opts?.ascending !== false]);
        return builder;
      },
      limit() {
        return builder;
      },
      single() {
        state.single = true;
        return run();
      },
      maybeSingle() {
        state.maybeSingle = true;
        return run();
      },
      then(resolve, reject) {
        return run().then(resolve, reject);
      },
    };
    return builder;
  }

  return {
    tables,
    getFlashcardUpdateAttempts: () => flashcardUpdateAttempts,
    resetFlashcardUpdateAttempts: () => {
      flashcardUpdateAttempts = 0;
    },
    setUser(user) {
      activeUser = user;
    },
    getCurrentUser: async () => activeUser,
    client: {
      from: (tableName) => makeBuilder(tableName),
    },
  };
}

describe("src/lib/storage.js (multi-user Supabase PK isolation & sync)", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("./supabase.js");
    clearLocalStorageData();
  });

  it("mints fresh UUIDs per user when seeding hardcoded STARTER_DECKS and coalesces concurrent seeds", async () => {
    const mockDb = createMockMultiUserSupabase();
    vi.resetModules();
    vi.doMock("./supabase.js", () => ({
      isSupabaseConfigured: true,
      supabase: mockDb.client,
      getCurrentUser: mockDb.getCurrentUser,
    }));

    const cloudStorage = await import("./storage.js");

    const HARDCODED_DECK_ID = "a1000001-0000-4000-8000-000000000001";
    const HARDCODED_CARD_ID = "c1000001-0000-4000-8000-000000000001";
    const starterDecks = [
      {
        id: HARDCODED_DECK_ID,
        title: "Chủ đề Bản thân",
        topicId: "self",
        isDefault: true,
        cards: [
          {
            id: HARDCODED_CARD_ID,
            frontVi: "hòa đồng",
            pos: "tính từ",
            definition: "sociable",
            exampleVi: "Cô ấy rất hòa đồng.",
            topicId: "self",
          },
        ],
      },
    ];

    // User 1: two concurrent loadDecks calls coalesce and seed only once with fresh UUIDs
    mockDb.setUser({ id: "user-1" });
    const [u1a, u1b] = await Promise.all([
      cloudStorage.loadDecks(starterDecks),
      cloudStorage.loadDecks(starterDecks),
    ]);
    expect(u1a).toHaveLength(1);
    expect(u1b).toHaveLength(1);
    expect(u1a[0].id).toBe(u1b[0].id);
    expect(u1a[0].id).not.toBe(HARDCODED_DECK_ID);
    expect(u1a[0].cards[0].id).not.toBe(HARDCODED_CARD_ID);

    // User 2: seeds the exact same hardcoded STARTER_DECKS with ZERO 23505 PK collisions
    mockDb.setUser({ id: "user-2" });
    const u2Decks = await cloudStorage.loadDecks(starterDecks);
    expect(u2Decks).toHaveLength(1);
    expect(u2Decks[0].id).not.toBe(HARDCODED_DECK_ID);
    expect(u2Decks[0].id).not.toBe(u1a[0].id);
    expect(u2Decks[0].cards[0].id).not.toBe(u1a[0].cards[0].id);
    expect(mockDb.tables.flashcard_decks).toHaveLength(2);
    expect(mockDb.tables.flashcards).toHaveLength(2);
  });

  it("syncLocalToCloud merges guest custom cards into seeded default decks, mints fresh UUIDs, and is idempotent", async () => {
    const mockDb = createMockMultiUserSupabase();
    vi.resetModules();
    vi.doMock("./supabase.js", () => ({
      isSupabaseConfigured: true,
      supabase: mockDb.client,
      getCurrentUser: mockDb.getCurrentUser,
    }));

    const cloudStorage = await import("./storage.js");
    cloudStorage.clearLocalStorageData();

    const starterDecks = [
      {
        id: "a1000001-0000-4000-8000-000000000001",
        title: "Chủ đề Bản thân",
        topicId: "self",
        isDefault: true,
        cards: [
          {
            id: "c1000001-0000-4000-8000-000000000001",
            frontVi: "hòa đồng",
            definition: "sociable",
            topicId: "self",
          },
        ],
      },
    ];

    // Guest works locally first (signed out)
    mockDb.setUser(null);
    const localSeeded = await cloudStorage.loadDecks(starterDecks);
    await cloudStorage.addFlashcard(localSeeded[0].id, {
      frontVi: "tận tâm",
      definition: "dedicated",
      topicId: "self",
    });
    await cloudStorage.createDeck({
      title: "Từ vựng Công việc",
      topicId: "opinions",
      cards: [{ frontVi: "hiệu suất", definition: "productivity" }],
    });
    // Include a legacy non-UUID local session id to verify UUID regeneration
    globalThis.localStorage.setItem(
      "vietflow_v1_game_sessions",
      JSON.stringify([
        {
          id: "legacy-non-uuid-session",
          gameType: "listen_match",
          topicId: "self",
          skillTags: ["listening"],
          score: 8,
          maxScore: 10,
          createdAt: "2026-05-10T10:00:00.000Z",
        },
      ])
    );

    // User 1 already seeded starter decks in cloud
    mockDb.setUser({ id: "user-1" });
    await cloudStorage.loadDecks(starterDecks);

    // User 2 signs in on the guest's browser and seeds starter decks, then syncs local data
    mockDb.setUser({ id: "user-2" });
    await cloudStorage.loadDecks(starterDecks);

    const firstSync = await cloudStorage.syncLocalToCloud();
    expect(firstSync).toEqual({
      syncedDecks: 1, // only "Từ vựng Công việc" created; default starter deck merged without duplicating
      syncedCards: 2, // 1 custom card ("tận tâm") merged into default deck + 1 card in custom deck
      syncedSessions: 1,
    });

    const u2Decks = await cloudStorage.loadDecks(starterDecks);
    expect(u2Decks).toHaveLength(2);
    const selfDeck = u2Decks.find((d) => d.topicId === "self");
    expect(selfDeck.cards.map((c) => c.frontVi)).toEqual(["hòa đồng", "tận tâm"]);

    // Running sync a second time produces zero duplicates
    const secondSync = await cloudStorage.syncLocalToCloud();
    expect(secondSync).toEqual({ syncedDecks: 0, syncedCards: 0, syncedSessions: 0 });
  });

  it("loads teacher-assigned decks for teacher (deduplicated + editable), signed-in students (student_card_progress), and guests (localStorage)", async () => {
    const mockDb = createMockMultiUserSupabase();
    vi.resetModules();
    vi.doMock("./supabase.js", () => ({
      isSupabaseConfigured: true,
      supabase: mockDb.client,
      getCurrentUser: mockDb.getCurrentUser,
    }));

    const cloudStorage = await import("./storage.js");
    cloudStorage.clearLocalStorageData();

    // 1. Teacher creates a personal deck AND a teacher-assigned PDF deck
    mockDb.setUser({ id: "teacher-minh" });
    await cloudStorage.createDeck({
      title: "Ghi chú riêng của GV",
      topicId: "self",
      isAssigned: false,
      cards: [{ frontVi: "soạn bài", definition: "prepare lessons" }],
    });
    const assignedDeck = await cloudStorage.createDeck({
      title: "PDF Bài 4: Ẩm thực Hà Nội",
      topicId: "food",
      isAssigned: true,
      teacherName: "Cô Minh",
      cards: [
        { frontVi: "phở cuốn", definition: "fresh pho rolls", masteryLevel: 4 },
        { frontVi: "bún thang", definition: "Hanoi noodle soup", masteryLevel: 2 },
      ],
    });
    expect(assignedDeck.isAssigned).toBe(true);
    expect(assignedDeck.teacherName).toBe("Cô Minh");
    expect(assignedDeck.assignedAt).toBeTruthy();
    expect(assignedDeck.canEdit).toBe(true);

    // Teacher sees assigned deck ONCE at the top with canEdit: true
    const teacherDecks = await cloudStorage.loadDecks();
    expect(teacherDecks).toHaveLength(2);
    expect(teacherDecks[0].id).toBe(assignedDeck.id);
    expect(teacherDecks[0].isAssigned).toBe(true);
    expect(teacherDecks[0].canEdit).toBe(true);
    expect(teacherDecks[0].cards[0].masteryLevel).toBe(4);

    // 2. Signed-in Student 1 loads decks: assigned deck appears at TOP with canEdit: false & clean 0 mastery
    mockDb.setUser({ id: "student-an" });
    const student1Decks = await cloudStorage.loadDecks([
      {
        title: "Starter Bản thân",
        topicId: "self",
        isDefault: true,
        cards: [{ frontVi: "thân thiện", definition: "friendly" }],
      },
    ]);
    expect(student1Decks).toHaveLength(2);
    expect(student1Decks[0]).toMatchObject({
      id: assignedDeck.id,
      isAssigned: true,
      teacherName: "Cô Minh",
      canEdit: false,
    });
    expect(student1Decks[0].cards[0].masteryLevel).toBe(0);
    expect(student1Decks[0].cards[0].reviewCount).toBe(0);
    expect(student1Decks[1].canEdit).toBe(true);

    // Student 1 marks mastery -> writes to student_card_progress, NEVER updates teacher's flashcards row
    mockDb.resetFlashcardUpdateAttempts();
    const targetCard = student1Decks[0].cards[0];
    const m1 = await cloudStorage.setFlashcardMastery(targetCard.id, 4, {
      deckId: assignedDeck.id,
      isAssignedDeck: true,
    });
    expect(m1.masteryLevel).toBe(4);
    expect(m1.reviewCount).toBe(1);
    expect(m1.frontVi).toBe("phở cuốn");
    expect(mockDb.getFlashcardUpdateAttempts()).toBe(0);
    expect(mockDb.tables.student_card_progress).toHaveLength(1);
    expect(mockDb.tables.student_card_progress[0]).toMatchObject({
      user_id: "student-an",
      card_id: targetCard.id,
      deck_id: assignedDeck.id,
      mastery_level: 4,
      review_count: 1,
    });

    // Second review upserts on (user_id, card_id) and increments review_count to 2
    const m2 = await cloudStorage.setFlashcardMastery(targetCard.id, 5, {
      deckId: assignedDeck.id,
      isAssignedDeck: true,
    });
    expect(m2.masteryLevel).toBe(5);
    expect(m2.reviewCount).toBe(2);
    expect(mockDb.tables.student_card_progress).toHaveLength(1);
    expect(mockDb.getFlashcardUpdateAttempts()).toBe(0);

    // Reloading Student 1 decks overlays Student 1's own mastery
    const student1Reloaded = await cloudStorage.loadDecks();
    expect(student1Reloaded[0].cards[0].masteryLevel).toBe(5);
    expect(student1Reloaded[0].cards[0].reviewCount).toBe(2);

    // Student 2 sees completely isolated mastery (0) on the same assigned deck
    mockDb.setUser({ id: "student-binh" });
    const student2Decks = await cloudStorage.loadDecks();
    expect(student2Decks[0].id).toBe(assignedDeck.id);
    expect(student2Decks[0].canEdit).toBe(false);
    expect(student2Decks[0].cards[0].masteryLevel).toBe(0);

    // 3. Guest (signed out, Supabase configured) STILL sees assigned decks at TOP & saves mastery in localStorage
    mockDb.setUser(null);
    const guestDecks = await cloudStorage.loadDecks([
      {
        title: "Local Starter",
        topicId: "self",
        isDefault: true,
        cards: [{ frontVi: "xin chào", definition: "hello" }],
      },
    ]);
    expect(guestDecks[0]).toMatchObject({
      id: assignedDeck.id,
      isAssigned: true,
      teacherName: "Cô Minh",
      canEdit: false,
    });
    expect(guestDecks[0].cards[0].masteryLevel).toBe(0);

    const guestMastery = await cloudStorage.setFlashcardMastery(targetCard.id, 3, {
      deckId: assignedDeck.id,
      isAssignedDeck: true,
    });
    expect(guestMastery.masteryLevel).toBe(3);
    expect(guestMastery.reviewCount).toBe(1);
    expect(mockDb.tables.student_card_progress).toHaveLength(1); // unchanged!
    expect(mockDb.getFlashcardUpdateAttempts()).toBe(0);

    // Reloading guest decks overlays mastery from vietflow_v1_assigned_mastery
    const guestReloaded = await cloudStorage.loadDecks();
    expect(guestReloaded[0].cards[0].masteryLevel).toBe(3);
    expect(guestReloaded[0].cards[0].reviewCount).toBe(1);

    // 4. Teacher unassigns deck via updateDeck -> disappears from assigned list
    mockDb.setUser({ id: "teacher-minh" });
    const unassigned = await cloudStorage.updateDeck(assignedDeck.id, { isAssigned: false });
    expect(unassigned.isAssigned).toBe(false);
    expect(unassigned.assignedAt).toBeNull();
    expect(await cloudStorage.loadAssignedDecksFromCloud("student-an")).toEqual([]);
  });

  it("returns [] gracefully from loadAssignedDecksFromCloud when migration 003 has not run yet", async () => {
    const failingClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              order: async () => ({
                data: null,
                error: new Error('column flashcard_decks.is_assigned does not exist'),
              }),
            }),
          }),
        }),
      }),
    };

    vi.resetModules();
    vi.doMock("./supabase.js", () => ({
      isSupabaseConfigured: true,
      supabase: failingClient,
      getCurrentUser: async () => null,
    }));

    const cloudStorage = await import("./storage.js");
    const result = await cloudStorage.loadAssignedDecksFromCloud("student-1");
    expect(result).toEqual([]);
  });
});
