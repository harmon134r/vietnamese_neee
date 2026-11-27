import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ttsHandler, {
  buildEdgeSsml,
  generateSecMsGecV2,
  normalizeLang,
  normalizeSpeed,
  normalizeVoice,
  resolveEdgeVoice,
  speedToEdgeRate,
  splitTextIntoChunks,
} from "../../api/tts.js";
import {
  GAME_TYPES,
  MASTERY_LEVELS,
  SKILL_IDS,
  SKILL_META,
  TOPIC_IDS,
  TOPIC_META,
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

  it("normalizes Vietnamese neural voice IDs, builds escaped SSML, and formats v2 Sec-MS-GEC tokens", () => {
    expect(normalizeVoice(undefined)).toBe("hoaimy");
    expect(normalizeVoice("hoaimy")).toBe("hoaimy");
    expect(normalizeVoice("namminh")).toBe("namminh");
    expect(normalizeVoice("vi-VN-NamMinhNeural")).toBe("namminh");
    expect(normalizeVoice("unknown")).toBe("hoaimy");

    expect(resolveEdgeVoice("vi", "hoaimy")).toEqual({
      id: "hoaimy",
      edgeName: "vi-VN-HoaiMyNeural",
      locale: "vi-VN",
    });
    expect(resolveEdgeVoice("vi", "namminh")).toEqual({
      id: "namminh",
      edgeName: "vi-VN-NamMinhNeural",
      locale: "vi-VN",
    });

    const ssml = buildEdgeSsml('A & B < "C" > \'D\'', resolveEdgeVoice("vi", "namminh"), "-25%");
    expect(ssml).toContain('voice name="vi-VN-NamMinhNeural"');
    expect(ssml).toContain('rate="-25%"');
    expect(ssml).toContain("A &amp; B &lt; &quot;C&quot; &gt; &apos;D&apos;");

    const token = generateSecMsGecV2(1700000000000);
    expect(token).toMatch(/^[0-9A-F]{16}-[0-9A-F]{64}$/);
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

  it("serves primary Edge Neural TTS audio, falls back to Google Translate on Edge error, and returns 502/504 when both fail", async () => {
    const fakeEdgeMp3 = Buffer.from([0xff, 0xf3, 0x64, 0xc4, 0x00, 0x00]);
    const synthesizeEdgeOk = vi.fn().mockResolvedValue(fakeEdgeMp3);

    const resHoaiMy = createMockRes();
    await ttsHandler(
      { method: "GET", query: { text: "Xin chào", lang: "vi-VN", voice: "hoaimy", speed: "0.75" } },
      resHoaiMy,
      { synthesizeEdge: synthesizeEdgeOk }
    );
    expect(resHoaiMy.statusCode).toBe(200);
    expect(resHoaiMy.headers["content-type"]).toBe("audio/mpeg");
    expect(resHoaiMy.headers["x-tts-provider"]).toBe("edge-neural");
    expect(resHoaiMy.headers["x-tts-voice"]).toBe("vi-VN-HoaiMyNeural");
    expect(resHoaiMy.headers["x-tts-lang"]).toBe("vi");
    expect(resHoaiMy.headers["x-tts-chunks"]).toBe("1");
    expect(resHoaiMy.headers["cache-control"]).toContain("max-age=86400");
    expect(Buffer.isBuffer(resHoaiMy.body)).toBe(true);
    expect(synthesizeEdgeOk).toHaveBeenCalledWith(
      "Xin chào",
      expect.objectContaining({ edgeName: "vi-VN-HoaiMyNeural" }),
      "-25%"
    );

    const resNamMinh = createMockRes();
    await ttsHandler(
      { method: "GET", query: { text: "Xin chào", lang: "vi", voice: "namminh", speed: "1.15" } },
      resNamMinh,
      { synthesizeEdge: synthesizeEdgeOk }
    );
    expect(resNamMinh.statusCode).toBe(200);
    expect(resNamMinh.headers["x-tts-provider"]).toBe("edge-neural");
    expect(resNamMinh.headers["x-tts-voice"]).toBe("vi-VN-NamMinhNeural");
    expect(synthesizeEdgeOk).toHaveBeenLastCalledWith(
      "Xin chào",
      expect.objectContaining({ edgeName: "vi-VN-NamMinhNeural" }),
      "+15%"
    );

    // Fallback to Google Translate TTS when Edge Neural fails
    const synthesizeEdgeFail = vi.fn().mockRejectedValue(new Error("Edge temporarily unavailable"));
    const fakeGoogleMp3 = new Uint8Array([0x49, 0x44, 0x33, 0x03]).buffer;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "audio/mpeg" },
        arrayBuffer: async () => fakeGoogleMp3,
      })
    );

    const resFallback = createMockRes();
    await ttsHandler(
      { method: "GET", query: { text: "Xin chào", lang: "vi-VN", speed: "1" } },
      resFallback,
      { synthesizeEdge: synthesizeEdgeFail }
    );
    expect(resFallback.statusCode).toBe(200);
    expect(resFallback.headers["content-type"]).toBe("audio/mpeg");
    expect(resFallback.headers["x-tts-provider"]).toBe("google-fallback");
    expect(resFallback.headers["x-tts-voice"]).toBe("google-vi");
    expect(resFallback.headers["x-tts-lang"]).toBe("vi");
    expect(resFallback.headers["x-tts-chunks"]).toBe("1");
    expect(resFallback.headers["cache-control"]).toContain("max-age=86400");
    expect(Buffer.isBuffer(resFallback.body)).toBe(true);

    // Both Edge and Google fail -> 502 with no-store
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
      synthesizeEdge: synthesizeEdgeFail,
    });
    expect(resFail.statusCode).toBe(502);
    expect(resFail.body.upstreamStatus).toBe(503);
    expect(resFail.headers["cache-control"]).toBe("no-store");

    // Both time out -> 504 with no-store
    const abortErr = new Error("Timeout");
    abortErr.name = "AbortError";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortErr));
    const resTimeout = createMockRes();
    await ttsHandler({ method: "GET", query: { text: "Xin chào" } }, resTimeout, {
      synthesizeEdge: vi.fn().mockRejectedValue(abortErr),
    });
    expect(resTimeout.statusCode).toBe(504);
    expect(resTimeout.headers["cache-control"]).toBe("no-store");
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
    expect(deck.cards.map((c) => c.frontVi)).toEqual(["ngon", "cay"]);

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
});

/**
 * In-memory Postgres-like Supabase mock enforcing global UUID PRIMARY KEY
 * constraints on flashcard_decks, flashcards, and game_sessions across users.
 */
function createMockMultiUserSupabase() {
  const tables = {
    flashcard_decks: [],
    flashcards: [],
    game_sessions: [],
    skill_progress: [],
  };

  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  let activeUser = null;

  function assertValidPk(tableName, row) {
    if (tableName === "skill_progress") return;
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
      payload: null,
      single: false,
      maybeSingle: false,
    };

    const run = async () => {
      if (state.op === "select") {
        let rows = tables[tableName].filter((r) =>
          state.filters.every(([k, v]) => r[k] === v)
        );
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

      if (state.op === "upsert") {
        const item = state.payload;
        const idx = tables[tableName].findIndex((r) => r.user_id === item.user_id);
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
      upsert(payload) {
        state.op = "upsert";
        state.payload = payload;
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
      order() {
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
});
