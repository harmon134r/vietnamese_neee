import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import {
  DEFAULT_D1_API_URL,
  d1Health,
  d1LoadAssignedDecks,
  d1LoadDecks,
  d1Request,
  getD1ApiUrl,
  isD1Configured,
} from "./d1Client.js";

const TEST_D1_URL = "https://munnn01-d1-api.munnn01.workers.dev";

function createJsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name) =>
        String(name).toLowerCase() === "content-type"
          ? "application/json; charset=utf-8"
          : null,
    },
    text: async () => (body === undefined ? "" : JSON.stringify(body)),
    json: async () => body,
  };
}

describe("src/lib/d1Client.js — config, auth forwarding, timeouts, and error mapping", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
    vi.doUnmock("./supabase.js");
  });

  it("evaluates getD1ApiUrl() and isD1Configured() across Vitest default, explicit URL, off/false, and production mode", () => {
    // Under Vitest (MODE === "test") without VITE_D1_API_URL -> disabled by default
    expect(getD1ApiUrl()).toBe("");
    expect(isD1Configured()).toBe(false);

    // Explicit URL enables D1 and strips trailing slashes
    vi.stubEnv("VITE_D1_API_URL", "https://custom-d1.workers.dev///");
    expect(getD1ApiUrl()).toBe("https://custom-d1.workers.dev");
    expect(isD1Configured()).toBe(true);

    // Explicit "off" or "false" disables D1 even in production mode
    vi.stubEnv("MODE", "production");
    vi.stubEnv("VITE_D1_API_URL", "off");
    expect(getD1ApiUrl()).toBe("");
    expect(isD1Configured()).toBe(false);

    vi.stubEnv("VITE_D1_API_URL", "FALSE");
    expect(getD1ApiUrl()).toBe("");
    expect(isD1Configured()).toBe(false);

    // Production mode with unset VITE_D1_API_URL falls back to DEFAULT_D1_API_URL
    vi.stubEnv("VITE_D1_API_URL", "");
    expect(getD1ApiUrl()).toBe(DEFAULT_D1_API_URL);
    expect(isD1Configured()).toBe(true);
  });

  it("forwards Authorization + X-Supabase-Key headers on authenticated requests and omits them on public endpoints", async () => {
    vi.stubEnv("VITE_D1_API_URL", TEST_D1_URL);
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb-anon-key-123");

    const getSessionMock = vi.fn().mockResolvedValue({
      session: { access_token: "jwt-access-token-xyz", user: { id: "u-1" } },
      user: { id: "u-1" },
      error: null,
    });

    vi.resetModules();
    vi.doMock("./supabase.js", () => ({
      getSession: getSessionMock,
    }));

    const client = await import("./d1Client.js");

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse({ ok: true, engine: "cloudflare-d1" }, 200))
      .mockResolvedValueOnce(
        createJsonResponse({ ok: true, assignedDecks: [], ownDecks: [], studentProgress: [] }, 200)
      );
    vi.stubGlobal("fetch", fetchMock);

    // Public health check -> no auth headers
    const health = await client.d1Health();
    expect(health.ok).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe(`${TEST_D1_URL}/api/health`);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
    expect(fetchMock.mock.calls[0][1].headers["X-Supabase-Key"]).toBeUndefined();
    expect(getSessionMock).not.toHaveBeenCalled();

    // Authenticated GET /api/decks -> sends Bearer JWT + X-Supabase-Key
    await client.d1LoadDecks();
    expect(getSessionMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[1][0]).toBe(`${TEST_D1_URL}/api/decks`);
    expect(fetchMock.mock.calls[1][1].headers).toMatchObject({
      Authorization: "Bearer jwt-access-token-xyz",
      "X-Supabase-Key": "sb-anon-key-123",
    });
  });

  it("rejects with 401 when requireAuth is true without a session, preserves server 403 messages, and aborts on timeout", async () => {
    vi.stubEnv("VITE_D1_API_URL", TEST_D1_URL);

    const getSessionMock = vi.fn();
    vi.resetModules();
    vi.doMock("./supabase.js", () => ({
      getSession: getSessionMock,
    }));
    const client = await import("./d1Client.js");

    // 1. Missing session throws 401 before network fetch
    getSessionMock.mockResolvedValueOnce({ session: null, user: null, error: null });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(client.d1LoadDecks()).rejects.toMatchObject({
      status: 401,
      message: expect.stringMatching(/đăng nhập/i),
    });
    expect(fetchMock).not.toHaveBeenCalled();

    // 2. HTTP 403 surfaces exact Vietnamese server message and .status
    getSessionMock.mockResolvedValue({
      session: { access_token: "student-jwt" },
      user: { id: "student-1" },
      error: null,
    });
    fetchMock.mockResolvedValueOnce(
      createJsonResponse(
        { ok: false, error: "Chỉ giáo viên mới có quyền giao bộ thẻ cho học sinh." },
        403
      )
    );
    await expect(
      client.d1CreateDeck({ title: "Hack", isAssigned: true })
    ).rejects.toMatchObject({
      status: 403,
      message: "Chỉ giáo viên mới có quyền giao bộ thẻ cho học sinh.",
    });

    // 3. HTTP 500 without body falls back to friendly Vietnamese message
    fetchMock.mockResolvedValueOnce(createJsonResponse(undefined, 500));
    await expect(client.d1Health()).rejects.toMatchObject({
      status: 500,
      message: expect.stringMatching(/Cloudflare D1/i),
    });

    // 4. Timeout triggers AbortController and throws 408
    fetchMock.mockImplementationOnce(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => {
            const abortErr = new Error("The operation was aborted.");
            abortErr.name = "AbortError";
            reject(abortErr);
          });
        })
    );
    await expect(
      client.d1Request("/api/health", { requireAuth: false, timeoutMs: 100 })
    ).rejects.toMatchObject({
      status: 408,
      isTimeout: true,
      message: expect.stringMatching(/quá thời gian chờ/i),
    });
  });

  it("throws status 0 if d1Request is invoked when D1 is disabled", async () => {
    await expect(d1Health()).rejects.toMatchObject({ status: 0 });
    await expect(d1LoadAssignedDecks()).rejects.toMatchObject({ status: 0 });
    await expect(d1LoadDecks()).rejects.toMatchObject({ status: 0 });
    await expect(d1Request("/api/health")).rejects.toMatchObject({ status: 0 });
  });
});

describe("src/lib/storage.js with Cloudflare D1 enabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
    vi.doUnmock("./supabase.js");
  });

  async function setupD1Storage({
    user = { id: "student-an" },
    accessToken = "token-student-an",
    supabaseClient = null,
    isSupabaseConfigured = true,
  } = {}) {
    let activeUser = user;
    let activeToken = accessToken;

    vi.stubEnv("VITE_D1_API_URL", TEST_D1_URL);
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-key-test");
    vi.resetModules();

    vi.doMock("./supabase.js", () => ({
      isSupabaseConfigured,
      supabase: supabaseClient || {},
      getCurrentUser: async () => activeUser,
      getSession: async () => ({
        session: activeUser ? { access_token: activeToken, user: activeUser } : null,
        user: activeUser,
        error: null,
      }),
    }));

    const storage = await import("./storage.js");
    storage.clearLocalStorageData();

    return {
      storage,
      setUser(nextUser, nextToken = "token-next") {
        activeUser = nextUser;
        activeToken = nextToken;
      },
    };
  }

  it("returns cloudflare-d1 storage mode, loads decks in one GET /api/decks call with student progress overlay, and supports guest assigned decks", async () => {
    const { storage, setUser } = await setupD1Storage({
      user: { id: "student-an" },
      accessToken: "jwt-an",
    });

    expect(await storage.getStorageMode()).toBe("cloudflare-d1");
    expect(storage.isCloudStorageMode("cloudflare-d1")).toBe(true);
    expect(storage.isCloudStorageMode("supabase")).toBe(true);
    expect(storage.isCloudStorageMode("local")).toBe(false);

    const fetchMock = vi.fn().mockResolvedValueOnce(
      createJsonResponse({
        ok: true,
        assignedDecks: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            user_id: "teacher-minh",
            title: "PDF Tuần 5: Ẩm thực",
            topic_id: "food",
            is_assigned: true,
            teacher_name: "Cô Minh",
            assigned_at: "2026-06-01T08:00:00.000Z",
            flashcards: [
              {
                id: "22222222-2222-4222-8222-222222222221",
                deck_id: "11111111-1111-4111-8111-111111111111",
                front_vi: "bún chả",
                definition: "grilled pork with rice noodles",
                mastery_level: 5, // teacher's own mastery must NOT leak to student
                review_count: 9,
                position: 0,
              },
              {
                id: "22222222-2222-4222-8222-222222222222",
                deck_id: "11111111-1111-4111-8111-111111111111",
                front_vi: "nem rán",
                definition: "fried spring rolls",
                mastery_level: 4,
                review_count: 3,
                position: 1,
              },
            ],
          },
        ],
        ownDecks: [
          {
            id: "33333333-3333-4333-8333-333333333333",
            user_id: "student-an",
            title: "Từ vựng của An",
            topic_id: "self",
            flashcards: [
              {
                id: "44444444-4444-4444-8444-444444444444",
                deck_id: "33333333-3333-4333-8333-333333333333",
                front_vi: "hòa đồng",
                definition: "sociable",
                mastery_level: 2,
                review_count: 2,
                position: 0,
              },
            ],
          },
        ],
        studentProgress: [
          {
            user_id: "student-an",
            card_id: "22222222-2222-4222-8222-222222222221",
            deck_id: "11111111-1111-4111-8111-111111111111",
            mastery_level: 3,
            review_count: 2,
            last_reviewed_at: "2026-06-02T09:00:00.000Z",
          },
        ],
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const decks = await storage.loadDecks();
    // Single GET /api/decks call!
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${TEST_D1_URL}/api/decks`);
    expect(decks).toHaveLength(2);

    // Assigned deck at top, read-only for student, overlaid with studentProgress
    expect(decks[0]).toMatchObject({
      id: "11111111-1111-4111-8111-111111111111",
      isAssigned: true,
      teacherName: "Cô Minh",
      canEdit: false,
    });
    expect(decks[0].cards[0]).toMatchObject({
      frontVi: "bún chả",
      masteryLevel: 3,
      reviewCount: 2,
    });
    // Unreviewed assigned card resets to 0 instead of inheriting teacher mastery
    expect(decks[0].cards[1]).toMatchObject({
      frontVi: "nem rán",
      masteryLevel: 0,
      reviewCount: 0,
    });

    // Own deck editable
    expect(decks[1]).toMatchObject({
      id: "33333333-3333-4333-8333-333333333333",
      canEdit: true,
    });

    // Guest mode -> getStorageMode is "local", but still loads public GET /api/assigned-decks + localStorage mastery
    setUser(null);
    expect(await storage.getStorageMode()).toBe("local");

    await storage.setFlashcardMastery("22222222-2222-4222-8222-222222222222", 4, {
      deckId: "11111111-1111-4111-8111-111111111111",
      isAssignedDeck: true,
    });

    fetchMock.mockResolvedValueOnce(
      createJsonResponse({
        ok: true,
        decks: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            user_id: "teacher-minh",
            title: "PDF Tuần 5: Ẩm thực",
            is_assigned: true,
            teacher_name: "Cô Minh",
            flashcards: [
              {
                id: "22222222-2222-4222-8222-222222222222",
                deck_id: "11111111-1111-4111-8111-111111111111",
                front_vi: "nem rán",
                definition: "fried spring rolls",
                mastery_level: 0,
                position: 0,
              },
            ],
          },
        ],
      })
    );

    const guestDecks = await storage.loadDecks([
      {
        title: "Starter cục bộ",
        topicId: "self",
        cards: [{ frontVi: "xin chào", definition: "hello" }],
      },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe(`${TEST_D1_URL}/api/assigned-decks`);
    expect(guestDecks[0].id).toBe("11111111-1111-4111-8111-111111111111");
    expect(guestDecks[0].cards[0].masteryLevel).toBe(4);
    expect(guestDecks[0].cards[0].reviewCount).toBe(1);
    expect(guestDecks[1].title).toBe("Starter cục bộ");
  });

  it("routes createDeck (teacher assigned + 403 student guard), deck/card CRUD, and assigned setFlashcardMastery to PUT /api/student-progress/:cardId", async () => {
    const { storage, setUser } = await setupD1Storage({
      user: { id: "teacher-minh" },
      accessToken: "jwt-teacher",
    });

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    // 1. Teacher creates assigned deck -> POST /api/decks
    fetchMock.mockResolvedValueOnce(
      createJsonResponse(
        {
          ok: true,
          deck: {
            id: "aaaa1111-1111-4111-8111-111111111111",
            user_id: "teacher-minh",
            title: "Bài đọc PDF 1",
            topic_id: "food",
            is_assigned: true,
            teacher_name: "Cô Minh",
            assigned_at: "2026-06-03T10:00:00.000Z",
            flashcards: [
              {
                id: "bbbb1111-1111-4111-8111-111111111111",
                deck_id: "aaaa1111-1111-4111-8111-111111111111",
                front_vi: "phở tái",
                definition: "rare beef pho",
                position: 0,
              },
            ],
          },
        },
        201
      )
    );

    const created = await storage.createDeck({
      title: "Bài đọc PDF 1",
      topicId: "food",
      isAssigned: true,
      teacherName: "Cô Minh",
      cards: [{ frontVi: "phở tái", definition: "rare beef pho" }],
    });
    expect(created).toMatchObject({
      id: "aaaa1111-1111-4111-8111-111111111111",
      isAssigned: true,
      teacherName: "Cô Minh",
      canEdit: true,
    });
    expect(fetchMock.mock.calls[0][0]).toBe(`${TEST_D1_URL}/api/decks`);
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      title: "Bài đọc PDF 1",
      isAssigned: true,
      teacherName: "Cô Minh",
    });

    // 2. Teacher adds bulk cards -> POST /api/decks/:id/cards
    fetchMock.mockResolvedValueOnce(
      createJsonResponse(
        {
          ok: true,
          cards: [
            {
              id: "bbbb1111-1111-4111-8111-111111111112",
              deck_id: created.id,
              front_vi: "nước mắm",
              definition: "fish sauce",
              position: 1,
            },
          ],
        },
        201
      )
    );
    const added = await storage.addFlashcardsBulk(created.id, [
      { frontVi: "nước mắm", definition: "fish sauce" },
    ]);
    expect(added).toHaveLength(1);
    expect(fetchMock.mock.calls[1][0]).toBe(
      `${TEST_D1_URL}/api/decks/${created.id}/cards`
    );

    // 3. Teacher updates deck -> PATCH /api/decks/:id
    fetchMock.mockResolvedValueOnce(
      createJsonResponse({
        ok: true,
        deck: {
          id: created.id,
          user_id: "teacher-minh",
          title: "Bài đọc PDF 1 (Cập nhật)",
          is_assigned: true,
          teacher_name: "Cô Minh",
          flashcards: [],
        },
      })
    );
    const updatedDeck = await storage.updateDeck(created.id, {
      title: "Bài đọc PDF 1 (Cập nhật)",
    });
    expect(updatedDeck.title).toBe("Bài đọc PDF 1 (Cập nhật)");
    expect(fetchMock.mock.calls[2][1].method).toBe("PATCH");

    // 4. Student attempting to assign deck surfaces exact 403 message
    setUser({ id: "student-an" }, "jwt-student");
    fetchMock.mockResolvedValueOnce(
      createJsonResponse(
        { ok: false, error: "Chỉ giáo viên mới có quyền giao bộ thẻ cho học sinh." },
        403
      )
    );
    await expect(
      storage.createDeck({ title: "Thử giao bài", isAssigned: true })
    ).rejects.toThrow("Chỉ giáo viên mới có quyền giao bộ thẻ cho học sinh.");

    // 5. Student mastery on assigned card routes to PUT /api/student-progress/:cardId
    const assignedCardId = "bbbb1111-1111-4111-8111-111111111111";
    fetchMock.mockResolvedValueOnce(
      createJsonResponse({
        ok: true,
        progress: {
          user_id: "student-an",
          card_id: assignedCardId,
          deck_id: created.id,
          mastery_level: 4,
          review_count: 1,
          last_reviewed_at: "2026-06-03T11:00:00.000Z",
          updated_at: "2026-06-03T11:00:00.000Z",
        },
      })
    );

    const masteryRes = await storage.setFlashcardMastery(assignedCardId, 4, {
      deckId: created.id,
      isAssignedDeck: true,
    });
    expect(masteryRes).toMatchObject({
      id: assignedCardId,
      deckId: created.id,
      masteryLevel: 4,
      reviewCount: 1,
    });
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    expect(lastCall[0]).toBe(`${TEST_D1_URL}/api/student-progress/${assignedCardId}`);
    expect(lastCall[1].method).toBe("PUT");
    expect(JSON.parse(lastCall[1].body)).toMatchObject({
      deckId: created.id,
      masteryLevel: 4,
    });

    // 6. Own card update & delete route to PATCH/DELETE /api/cards/:id and DELETE /api/decks/:id
    fetchMock.mockResolvedValueOnce(
      createJsonResponse({
        ok: true,
        card: {
          id: "cccc1111-1111-4111-8111-111111111111",
          deck_id: "dddd1111-1111-4111-8111-111111111111",
          front_vi: "ấm áp",
          definition: "warm",
          mastery_level: 3,
          review_count: 1,
        },
      })
    );
    const updatedCard = await storage.updateFlashcard(
      "cccc1111-1111-4111-8111-111111111111",
      { masteryLevel: 3, reviewCount: 1 }
    );
    expect(updatedCard.masteryLevel).toBe(3);

    fetchMock.mockResolvedValueOnce(createJsonResponse({ ok: true, deleted: true }));
    await storage.deleteFlashcard("cccc1111-1111-4111-8111-111111111111");
    expect(fetchMock.mock.calls[fetchMock.mock.calls.length - 1][1].method).toBe("DELETE");

    fetchMock.mockResolvedValueOnce(createJsonResponse({ ok: true, deleted: true }));
    await storage.deleteDeck(created.id);
    expect(fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0]).toBe(
      `${TEST_D1_URL}/api/decks/${created.id}`
    );
  });

  it("persists skill progress, game sessions, and local-to-D1 sync cleanly", async () => {
    const { storage, setUser } = await setupD1Storage({
      user: { id: "student-an" },
      accessToken: "jwt-an",
    });

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    // saveSkillProgress -> PUT /api/skill-progress
    fetchMock.mockResolvedValueOnce(
      createJsonResponse({
        ok: true,
        progress: {
          listening: 65,
          speaking: 50,
          reading: 70,
          pronunciation: 60,
          xp: 180,
          streak_days: 4,
          last_active_date: "2026-06-03",
          topic_mastery: { food: 72 },
        },
      })
    );
    const savedProgress = await storage.saveSkillProgress({
      listening: 65,
      speaking: 50,
      reading: 70,
      pronunciation: 60,
      xp: 180,
      streakDays: 4,
      lastActiveDate: "2026-06-03",
      topicMastery: { food: 72 },
    });
    expect(savedProgress).toMatchObject({
      listening: 65,
      xp: 180,
      streakDays: 4,
      topicMastery: expect.objectContaining({ food: 72 }),
    });
    expect(fetchMock.mock.calls[0][0]).toBe(`${TEST_D1_URL}/api/skill-progress`);
    expect(fetchMock.mock.calls[0][1].method).toBe("PUT");

    // saveGameSession -> POST /api/game-sessions + GET /api/skill-progress + PUT /api/skill-progress
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            ok: true,
            session: {
              id: "eeee1111-1111-4111-8111-111111111111",
              game_type: "listen_match",
              topic_id: "food",
              skill_tags: ["listening"],
              score: 9,
              max_score: 10,
              accuracy: 90,
              duration_seconds: 55,
              details_json: { streak: 5 },
              created_at: "2026-06-03T12:00:00.000Z",
            },
          },
          201
        )
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          ok: true,
          progress: {
            listening: 65,
            speaking: 50,
            reading: 70,
            pronunciation: 60,
            xp: 180,
            streak_days: 4,
            last_active_date: "2026-06-03",
            topic_mastery: { food: 72 },
          },
        })
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          ok: true,
          progress: {
            listening: 74.5,
            speaking: 50,
            reading: 70,
            pronunciation: 60,
            xp: 226,
            streak_days: 4,
            last_active_date: "2026-06-03",
            topic_mastery: { food: 80.04 },
          },
        })
      );

    const gameRes = await storage.saveGameSession({
      gameType: "listen_match",
      topicId: "food",
      skillTags: ["listening"],
      score: 9,
      maxScore: 10,
      durationSeconds: 55,
      details: { streak: 5 },
    });
    expect(gameRes.session.accuracy).toBe(90);
    expect(gameRes.progress.xp).toBe(226);
    expect(fetchMock.mock.calls[1][0]).toBe(`${TEST_D1_URL}/api/game-sessions`);
    expect(fetchMock.mock.calls[1][1].method).toBe("POST");

    // loadGameHistory forwards limit, topicId, gameType query params
    fetchMock.mockResolvedValueOnce(
      createJsonResponse({
        ok: true,
        sessions: [
          {
            id: "eeee1111-1111-4111-8111-111111111111",
            game_type: "listen_match",
            topic_id: "food",
            skill_tags: ["listening"],
            score: 9,
            max_score: 10,
            accuracy: 90,
          },
        ],
      })
    );
    const history = await storage.loadGameHistory({
      limit: 10,
      topicId: "food",
      gameType: "listen_match",
    });
    expect(history).toHaveLength(1);
    expect(fetchMock.mock.calls[4][0]).toBe(
      `${TEST_D1_URL}/api/game-sessions?limit=10&topicId=food&gameType=listen_match`
    );

    // saveGameSession with skipSkillGain: true saves session without double-updating skill_progress
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            ok: true,
            session: {
              id: "eeee1111-1111-4111-8111-111111111112",
              game_type: "listen_match",
              topic_id: "food",
              skill_tags: ["listening"],
              score: 10,
              max_score: 10,
              accuracy: 100,
              duration_seconds: 40,
            },
          },
          201
        )
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          ok: true,
          progress: {
            listening: 74.5,
            speaking: 50,
            reading: 70,
            pronunciation: 60,
            xp: 226,
            streak_days: 4,
            last_active_date: "2026-06-03",
            topic_mastery: { food: 80.04 },
          },
        })
      );

    const callCountBeforeSkip = fetchMock.mock.calls.length;
    const stepSyncedRes = await storage.saveGameSession({
      gameType: "listen_match",
      topicId: "food",
      skillTags: ["listening"],
      score: 10,
      maxScore: 10,
      durationSeconds: 40,
      skipSkillGain: true,
    });
    expect(stepSyncedRes.session.accuracy).toBe(100);
    expect(stepSyncedRes.progress.xp).toBe(226);
    expect(fetchMock.mock.calls.length - callCountBeforeSkip).toBe(2);
    expect(fetchMock.mock.calls[callCountBeforeSkip][0]).toBe(
      `${TEST_D1_URL}/api/game-sessions`
    );
    expect(fetchMock.mock.calls[callCountBeforeSkip + 1][0]).toBe(
      `${TEST_D1_URL}/api/skill-progress`
    );
    expect(fetchMock.mock.calls[callCountBeforeSkip + 1][1].method).toBe("GET");

    // syncLocalToCloud pushes local-only deck into D1
    setUser(null);
    await storage.createDeck({
      title: "Từ vựng ngoại tuyến",
      topicId: "weather",
      cards: [{ frontVi: "mát mẻ", definition: "cool and pleasant" }],
    });

    setUser({ id: "student-an" }, "jwt-an");
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({ ok: true, assignedDecks: [], ownDecks: [], studentProgress: [] })
      )
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            ok: true,
            deck: {
              id: "ffff1111-1111-4111-8111-111111111111",
              user_id: "student-an",
              title: "Từ vựng ngoại tuyến",
              topic_id: "weather",
              flashcards: [
                {
                  id: "ffff2222-2222-4222-8222-222222222222",
                  front_vi: "mát mẻ",
                  definition: "cool and pleasant",
                },
              ],
            },
          },
          201
        )
      )
      .mockResolvedValueOnce(createJsonResponse({ ok: true, progress: null }))
      .mockResolvedValueOnce(createJsonResponse({ ok: true, progress: { xp: 180 } }));

    const synced = await storage.syncLocalToCloud();
    expect(synced).toEqual({ syncedDecks: 1, syncedCards: 1, syncedSessions: 0 });
  });

  it("auto-migrates existing Supabase decks into D1 when D1 is empty and falls back gracefully when D1 is unreachable", async () => {
    const supabaseDeckRow = {
      id: "99991111-1111-4111-8111-111111111111",
      user_id: "student-an",
      title: "Bộ thẻ cũ trên Supabase",
      topic_id: "routine",
      is_default: false,
      is_assigned: false,
      flashcards: [
        {
          id: "99992222-2222-4222-8222-222222222222",
          deck_id: "99991111-1111-4111-8111-111111111111",
          front_vi: "thức dậy",
          definition: "wake up",
          position: 0,
        },
      ],
    };

    const mockSupabase = {
      from: vi.fn((table) => ({
        select: () => ({
          eq: () => ({
            order: () =>
              table === "flashcard_decks"
                ? {
                    order: async () => ({ data: [], error: null }),
                    then: (resolve) => resolve({ data: [supabaseDeckRow], error: null }),
                  }
                : {
                    limit: async () => ({ data: [], error: null }),
                  },
            maybeSingle: async () =>
              table === "skill_progress"
                ? {
                    data: {
                      listening: 42,
                      speaking: 30,
                      reading: 25,
                      pronunciation: 20,
                      xp: 120,
                      streak_days: 2,
                      last_active_date: "2026-06-01",
                      topic_mastery: { routine: 40 },
                    },
                    error: null,
                  }
                : { data: null, error: null },
          }),
        }),
      })),
    };

    const { storage } = await setupD1Storage({
      user: { id: "student-an" },
      accessToken: "jwt-an",
      supabaseClient: mockSupabase,
    });

    const fetchMock = vi
      .fn()
      // 1. D1 returns empty ownDecks -> triggers one-time Supabase auto-migration into D1
      .mockResolvedValueOnce(
        createJsonResponse({ ok: true, assignedDecks: [], ownDecks: [], studentProgress: [] })
      )
      .mockResolvedValueOnce(
        createJsonResponse({ ok: true, deck: supabaseDeckRow }, 201)
      );
    vi.stubGlobal("fetch", fetchMock);

    const migrated = await storage.loadDecks([
      { title: "Starter", topicId: "self", cards: [{ frontVi: "chào", definition: "hi" }] },
    ]);
    expect(migrated).toHaveLength(1);
    expect(migrated[0].title).toBe("Bộ thẻ cũ trên Supabase");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].method).toBe("POST");

    // 2. loadSkillProgress reads Supabase seamlessly when D1 has no row yet
    fetchMock.mockResolvedValueOnce(createJsonResponse({ ok: true, progress: null }));
    const progress = await storage.loadSkillProgress();
    expect(progress.xp).toBe(120);
    expect(progress.listening).toBe(42);

    // 3. Complete D1 network outage falls back cleanly to Supabase / localStorage without throwing
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const fallbackDecks = await storage.loadDecks();
    expect(fallbackDecks).toHaveLength(1);
    expect(fallbackDecks[0].title).toBe("Bộ thẻ cũ trên Supabase");

    const fallbackProgress = await storage.loadSkillProgress();
    expect(fallbackProgress.xp).toBe(120);

    const fallbackHistory = await storage.loadGameHistory();
    expect(Array.isArray(fallbackHistory)).toBe(true);
    expect(warnSpy).toHaveBeenCalled();
  });
});

describe("Navbar & AuthModal Cloudflare D1 UI indicators", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_D1_API_URL", TEST_D1_URL);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
    vi.doUnmock("./supabase.js");
  });

  it("renders Cloudflare D1 cloud status tooltip in Navbar and live 5 GB capacity pill + stats in AuthModal", async () => {
    vi.resetModules();
    vi.doMock("./supabase.js", async () => {
      const actual = await vi.importActual("./supabase.js");
      return {
        ...actual,
        isSupabaseConfigured: true,
      };
    });

    const fetchMock = vi.fn().mockResolvedValueOnce(
      createJsonResponse({
        ok: true,
        engine: "cloudflare-d1",
        database: "munnn01-db",
        region: "APAC",
        capacityBytes: 5368709120,
        usedBytes: 24576,
        counts: {
          decks: 12,
          assignedDecks: 3,
          flashcards: 140,
          studentProgress: 18,
          gameSessions: 25,
          skillProfiles: 4,
        },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { Navbar } = await import("../components/layout/Navbar.jsx");
    const { AuthModal } = await import("../components/layout/AuthModal.jsx");

    const signedInUser = {
      id: "user-thu",
      email: "nguyen.anh.thu@students.vietflow.app",
      user_metadata: { display_name: "Nguyễn Anh Thư", role: "student" },
    };
    const signedInProfile = {
      id: "user-thu",
      email: "",
      displayName: "Nguyễn Anh Thư",
      role: "student",
      cefrLevel: "A2-B1",
    };

    const { unmount: unmountNav } = render(
      React.createElement(Navbar, {
        activeView: "dashboard",
        onNavigate: vi.fn(),
        skillProgress: { xp: 200, streakDays: 5 },
        user: signedInUser,
        userProfile: signedInProfile,
        storageMode: "cloudflare-d1",
        isSupabaseConfigured: true,
        onOpenAuth: vi.fn(),
      })
    );

    const accountBtn = screen.getByRole("button", { name: "Nguyễn Anh Thư" });
    expect(accountBtn).toHaveAttribute("title", "Đang đồng bộ Cloudflare D1 (5 GB)");
    expect(accountBtn.querySelector(".vf-status-dot.is-cloud")).not.toBeNull();
    unmountNav();

    render(
      React.createElement(AuthModal, {
        isOpen: true,
        onClose: vi.fn(),
        user: signedInUser,
        userProfile: signedInProfile,
      })
    );

    expect(screen.getByTestId("d1-capacity-pill")).toHaveTextContent("Cloudflare D1 · 5 GB");
    expect(
      screen.queryByRole("button", { name: /Đồng bộ dữ liệu cục bộ/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Gộp dữ liệu từ trình duyệt/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("auto-sync-note")).toHaveTextContent(
      /Tự động đẩy thẻ mới và lưu tiến độ ngay sau từng câu luyện tập lên Cloudflare D1/i
    );

    await waitFor(() => {
      expect(screen.getByTestId("d1-health-stats")).toHaveTextContent(
        /24\.0 KB \/ 5 GB · 12 bộ thẻ · 140 flashcard/
      );
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${TEST_D1_URL}/api/health`,
      expect.objectContaining({ method: "GET" })
    );
  });
});
