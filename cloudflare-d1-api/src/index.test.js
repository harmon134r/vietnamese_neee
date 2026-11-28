// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "./index.js";

const MIGRATION_PATH = resolve(
  import.meta.dirname,
  "../migrations/0001_initial_d1_schema.sql"
);
const MIGRATION_SQL = readFileSync(MIGRATION_PATH, "utf8");

const SUPABASE_URL = "https://astsuiojyzxjdubxwvfr.supabase.co";
const ANON_KEY = "sb-anon-test-key";
const ALLOWED_ORIGINS =
  "https://vietnamese-neee.vercel.app,http://localhost:5173,http://127.0.0.1:5173";

const TEACHER_USER = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "co.lan@students.vietflow.app",
  token: "jwt-teacher-valid",
  displayName: "Cô Lan",
  metadataRole: "teacher",
  dbRole: "teacher",
};

const STUDENT_USER = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "minh.anh@students.vietflow.app",
  token: "jwt-student-valid",
  displayName: "Minh Anh",
  metadataRole: "student",
  dbRole: "student",
};

// Simulates an attacker who mutated user_metadata.role = "teacher" on the client
// while authoritative Supabase user_profiles.role remains "student".
const FORGING_STUDENT_USER = {
  id: "33333333-3333-4333-8333-333333333333",
  email: "spoof@students.vietflow.app",
  token: "jwt-forging-student",
  displayName: "Học Sinh Giả Mạo",
  metadataRole: "teacher",
  dbRole: "student",
};

const USERS_BY_TOKEN = new Map([
  [TEACHER_USER.token, TEACHER_USER],
  [STUDENT_USER.token, STUDENT_USER],
  [FORGING_STUDENT_USER.token, FORGING_STUDENT_USER],
]);

/**
 * Lightweight Cloudflare D1 binding adapter backed by real in-memory SQLite (`node:sqlite`).
 * Executes our real migration SQL, CHECK constraints, foreign keys, PRAGMAs, and atomic batches.
 */
function createSqliteD1Mock() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON;");
  sqlite.exec(MIGRATION_SQL);

  let batchCallCount = 0;

  function executeStatement(sql, params) {
    const trimmed = sql.trim();
    const upper = trimmed.toUpperCase();
    const stmt = sqlite.prepare(sql);
    const isReader =
      upper.startsWith("SELECT") ||
      upper.startsWith("PRAGMA") ||
      upper.includes("RETURNING");

    if (isReader) {
      const results = stmt.all(...params);
      return { success: true, results, meta: { changes: 0 } };
    }

    const info = stmt.run(...params);
    return {
      success: true,
      results: [],
      meta: {
        changes: Number(info?.changes ?? 0),
        last_row_id: Number(info?.lastInsertRowid ?? 0),
      },
    };
  }

  function createPreparedStatement(sql, boundParams = []) {
    return {
      _sql: sql,
      _params: boundParams,
      bind(...params) {
        return createPreparedStatement(sql, params);
      },
      async all() {
        return executeStatement(sql, boundParams);
      },
      async first(colName) {
        const res = executeStatement(sql, boundParams);
        const row = res.results[0] ?? null;
        if (!row) return null;
        return colName ? (row[colName] ?? null) : row;
      },
      async run() {
        return executeStatement(sql, boundParams);
      },
    };
  }

  const db = {
    sqlite,
    getBatchCallCount: () => batchCallCount,
    resetBatchCallCount: () => {
      batchCallCount = 0;
    },
    prepare(sql) {
      return createPreparedStatement(sql, []);
    },
    async batch(statements) {
      batchCallCount += 1;
      sqlite.exec("BEGIN");
      try {
        const outputs = statements.map((stmt) =>
          executeStatement(stmt._sql, stmt._params)
        );
        sqlite.exec("COMMIT");
        return outputs;
      } catch (err) {
        sqlite.exec("ROLLBACK");
        throw err;
      }
    },
  };

  return db;
}

function createSupabaseFetchMock() {
  return vi.fn(async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    const headers = new Headers(init.headers || {});
    const authHeader = headers.get("Authorization") || "";
    const apikey = headers.get("apikey") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!url.startsWith(SUPABASE_URL)) {
      return new Response(JSON.stringify({ error: "Unexpected Supabase host" }), {
        status: 500,
      });
    }

    if (apikey !== ANON_KEY) {
      return new Response(JSON.stringify({ message: "Invalid API key" }), {
        status: 401,
      });
    }

    const user = USERS_BY_TOKEN.get(token);
    if (!user) {
      return new Response(JSON.stringify({ message: "Invalid JWT" }), {
        status: 401,
      });
    }

    if (url === `${SUPABASE_URL}/auth/v1/user`) {
      return new Response(
        JSON.stringify({
          id: user.id,
          email: user.email,
          user_metadata: {
            display_name: user.displayName,
            role: user.metadataRole,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (url.startsWith(`${SUPABASE_URL}/rest/v1/user_profiles`)) {
      const parsed = new URL(url);
      const userIdFilter = parsed.searchParams.get("user_id") || "";
      const expectedFilter = `eq.${user.id}`;
      if (userIdFilter !== expectedFilter) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify([
          {
            role: user.dbRole,
            display_name: user.displayName,
          },
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Not mocked" }), { status: 404 });
  });
}

function authHeaders(token, extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    "X-Supabase-Key": ANON_KEY,
    "Content-Type": "application/json",
    Origin: "https://vietnamese-neee.vercel.app",
    ...extra,
  };
}

describe("munnn01 Cloudflare D1 Edge API Worker", () => {
  let db;
  let env;
  let fetchMock;

  beforeEach(() => {
    db = createSqliteD1Mock();
    env = {
      DB: db,
      SUPABASE_URL,
      ALLOWED_ORIGINS,
    };
    fetchMock = createSupabaseFetchMock();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    db.sqlite.close();
  });

  it("applies 0001_initial_d1_schema.sql idempotently with 5 tables and 6 indexes", () => {
    expect(() => db.sqlite.exec(MIGRATION_SQL)).not.toThrow();

    const tables = db.sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
      )
      .all()
      .map((r) => r.name);

    expect(tables).toEqual([
      "flashcard_decks",
      "flashcards",
      "game_sessions",
      "skill_progress",
      "student_card_progress",
    ]);

    const indexes = db.sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_%' ORDER BY name"
      )
      .all()
      .map((r) => r.name);

    expect(indexes).toEqual([
      "idx_flashcard_decks_assigned",
      "idx_flashcard_decks_user_id",
      "idx_flashcards_deck_id",
      "idx_flashcards_user_id",
      "idx_game_sessions_user_created",
      "idx_student_card_progress_user_deck",
    ]);
  });

  describe("CORS preflight & origin allowlist", () => {
    it("allows configured production, localhost, and Vercel preview origins", async () => {
      const allowedOrigins = [
        "https://vietnamese-neee.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://vietnamese-neee-git-d1-preview.vercel.app",
      ];

      for (const origin of allowedOrigins) {
        const res = await worker.fetch(
          new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
            method: "OPTIONS",
            headers: { Origin: origin },
          }),
          env
        );

        expect(res.status).toBe(204);
        expect(res.headers.get("Access-Control-Allow-Origin")).toBe(origin);
        expect(res.headers.get("Access-Control-Allow-Headers")).toBe(
          "Authorization, Content-Type, X-Supabase-Key"
        );
        expect(res.headers.get("Access-Control-Allow-Methods")).toContain(
          "PATCH"
        );
        expect(res.headers.get("Vary")).toBe("Origin");
      }
    });

    it("rejects disallowed and spoofed origins", async () => {
      const blockedOrigins = [
        "https://evil.example.com",
        "https://vietnamese-neee.vercel.app.evil.com",
        "http://insecure-preview.vercel.app",
        "https://vercel.app",
      ];

      for (const origin of blockedOrigins) {
        const preflightRes = await worker.fetch(
          new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
            method: "OPTIONS",
            headers: { Origin: origin },
          }),
          env
        );
        expect(preflightRes.status).toBe(403);
        expect(preflightRes.headers.get("Access-Control-Allow-Origin")).toBeNull();

        const getRes = await worker.fetch(
          new Request("https://munnn01-d1-api.munnn01.workers.dev/api/health", {
            method: "GET",
            headers: { Origin: origin },
          }),
          env
        );
        expect(getRes.status).toBe(200);
        expect(getRes.headers.get("Access-Control-Allow-Origin")).toBeNull();
      }
    });
  });

  describe("Public endpoints: GET /api/health & GET /api/assigned-decks", () => {
    it("GET /api/health returns 5 GiB capacity, usedBytes, and live table counts", async () => {
      const res = await worker.fetch(
        new Request("https://munnn01-d1-api.munnn01.workers.dev/api/health", {
          headers: { Origin: "https://vietnamese-neee.vercel.app" },
        }),
        env
      );

      expect(res.status).toBe(200);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
        "https://vietnamese-neee.vercel.app"
      );

      const data = await res.json();
      expect(data).toMatchObject({
        ok: true,
        engine: "cloudflare-d1",
        database: "munnn01-db",
        region: "APAC",
        capacityBytes: 5368709120,
        counts: {
          decks: 0,
          assignedDecks: 0,
          flashcards: 0,
          studentProgress: 0,
          gameSessions: 0,
          skillProfiles: 0,
        },
      });
      expect(typeof data.usedBytes).toBe("number");
      expect(data.usedBytes).toBeGreaterThan(0);
    });

    it("GET /api/assigned-decks serves only assigned decks with ordered flashcards publicly", async () => {
      // Teacher creates 1 assigned deck with 2 cards
      const assignedRes = await worker.fetch(
        new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
          method: "POST",
          headers: authHeaders(TEACHER_USER.token),
          body: JSON.stringify({
            title: "Bài 1: Chào hỏi",
            description: "Từ vựng PDF tuần 1",
            topicId: "self",
            isAssigned: true,
            cards: [
              { frontVi: "xin chào", pos: "cụm từ", definition: "hello" },
              { frontVi: "cảm ơn", pos: "động từ", definition: "thank you" },
            ],
          }),
        }),
        env
      );
      expect(assignedRes.status).toBe(201);

      // Student creates 1 private deck
      const privateRes = await worker.fetch(
        new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
          method: "POST",
          headers: authHeaders(STUDENT_USER.token),
          body: JSON.stringify({
            title: "Bộ thẻ riêng của Minh Anh",
            topicId: "food",
            cards: [{ frontVi: "phở bò", definition: "beef noodle soup" }],
          }),
        }),
        env
      );
      expect(privateRes.status).toBe(201);

      // Public request (NO Authorization header)
      const publicRes = await worker.fetch(
        new Request(
          "https://munnn01-d1-api.munnn01.workers.dev/api/assigned-decks",
          {
            method: "GET",
            headers: { Origin: "http://localhost:5173" },
          }
        ),
        env
      );

      expect(publicRes.status).toBe(200);
      const payload = await publicRes.json();
      expect(payload.ok).toBe(true);
      expect(payload.decks).toHaveLength(1);
      expect(payload.decks[0]).toMatchObject({
        title: "Bài 1: Chào hỏi",
        topic_id: "self",
        is_assigned: true,
        teacher_name: "Cô Lan",
      });
      expect(payload.decks[0].flashcards).toHaveLength(2);
      expect(payload.decks[0].flashcards[0]).toMatchObject({
        front_vi: "xin chào",
        definition: "hello",
        position: 0,
      });
      expect(payload.decks[0].flashcards[1]).toMatchObject({
        front_vi: "cảm ơn",
        definition: "thank you",
        position: 1,
      });

      // Health counts reflect both decks and 3 cards
      const healthData = await (
        await worker.fetch(
          new Request("https://munnn01-d1-api.munnn01.workers.dev/api/health"),
          env
        )
      ).json();
      expect(healthData.counts.decks).toBe(2);
      expect(healthData.counts.assignedDecks).toBe(1);
      expect(healthData.counts.flashcards).toBe(3);
    });
  });

  describe("Authentication & Request Size Validation", () => {
    it("returns 401 when Authorization token is missing, malformed, or invalid", async () => {
      const noAuth = await worker.fetch(
        new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks"),
        env
      );
      expect(noAuth.status).toBe(401);

      const noKey = await worker.fetch(
        new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
          headers: { Authorization: `Bearer ${STUDENT_USER.token}` },
        }),
        env
      );
      expect(noKey.status).toBe(401);

      const badToken = await worker.fetch(
        new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
          headers: authHeaders("jwt-expired-or-forged"),
        }),
        env
      );
      expect(badToken.status).toBe(401);
    });

    it("returns 413 when JSON payload exceeds 2 MiB", async () => {
      const hugePayload = JSON.stringify({
        title: "Huge deck",
        description: "a".repeat(2 * 1024 * 1024 + 128),
      });

      const res = await worker.fetch(
        new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
          method: "POST",
          headers: authHeaders(STUDENT_USER.token),
          body: hugePayload,
        }),
        env
      );

      expect(res.status).toBe(413);
      const data = await res.json();
      expect(data.ok).toBe(false);
    });
  });

  describe("Teacher Role Enforcement & Deck / Card CRUD", () => {
    it("allows teachers to create assigned decks (201) and blocks students even with forged metadata (403)", async () => {
      // Teacher succeeds
      const teacherRes = await worker.fetch(
        new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
          method: "POST",
          headers: authHeaders(TEACHER_USER.token),
          body: JSON.stringify({
            title: "Từ vựng Ẩm thực",
            topicId: "food",
            isAssigned: true,
            cards: [{ frontVi: "bánh mì", definition: "Vietnamese baguette" }],
          }),
        }),
        env
      );
      expect(teacherRes.status).toBe(201);
      const teacherBody = await teacherRes.json();
      expect(teacherBody.deck.is_assigned).toBe(true);
      expect(teacherBody.deck.teacher_name).toBe("Cô Lan");
      expect(teacherBody.deck.assigned_at).toBeTruthy();

      // Normal student blocked with 403
      const studentRes = await worker.fetch(
        new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
          method: "POST",
          headers: authHeaders(STUDENT_USER.token),
          body: JSON.stringify({
            title: "Bài giao trái phép",
            isAssigned: true,
          }),
        }),
        env
      );
      expect(studentRes.status).toBe(403);
      expect(await studentRes.json()).toMatchObject({
        ok: false,
        error: "Chỉ giáo viên mới có quyền giao bộ thẻ cho học sinh.",
      });

      // Forging student (user_metadata.role === "teacher", DB role === "student") ALSO blocked!
      const forgedRes = await worker.fetch(
        new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
          method: "POST",
          headers: authHeaders(FORGING_STUDENT_USER.token),
          body: JSON.stringify({
            title: "Giả mạo giáo viên",
            is_assigned: true,
          }),
        }),
        env
      );
      expect(forgedRes.status).toBe(403);
      expect(await forgedRes.json()).toMatchObject({
        ok: false,
        error: "Chỉ giáo viên mới có quyền giao bộ thẻ cho học sinh.",
      });
    });

    it("enforces ownership on PATCH/DELETE /api/decks/:id and cascades deletions cleanly", async () => {
      // Teacher creates assigned deck with 1 card
      const created = await (
        await worker.fetch(
          new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
            method: "POST",
            headers: authHeaders(TEACHER_USER.token),
            body: JSON.stringify({
              title: "Thời tiết 4 mùa",
              topicId: "weather",
              isAssigned: true,
              cards: [{ frontVi: "mưa rào", definition: "rain shower" }],
            }),
          }),
          env
        )
      ).json();
      const deckId = created.deck.id;
      const cardId = created.deck.flashcards[0].id;

      // Student records progress on that card
      const progRes = await worker.fetch(
        new Request(
          `https://munnn01-d1-api.munnn01.workers.dev/api/student-progress/${cardId}`,
          {
            method: "PUT",
            headers: authHeaders(STUDENT_USER.token),
            body: JSON.stringify({ masteryLevel: 3 }),
          }
        ),
        env
      );
      expect(progRes.status).toBe(200);

      // Student CANNOT PATCH teacher's deck -> 404
      const studentPatch = await worker.fetch(
        new Request(
          `https://munnn01-d1-api.munnn01.workers.dev/api/decks/${deckId}`,
          {
            method: "PATCH",
            headers: authHeaders(STUDENT_USER.token),
            body: JSON.stringify({ title: "Bị sửa lén" }),
          }
        ),
        env
      );
      expect(studentPatch.status).toBe(404);

      // Student CANNOT DELETE teacher's deck -> 404
      const studentDelete = await worker.fetch(
        new Request(
          `https://munnn01-d1-api.munnn01.workers.dev/api/decks/${deckId}`,
          {
            method: "DELETE",
            headers: authHeaders(STUDENT_USER.token),
          }
        ),
        env
      );
      expect(studentDelete.status).toBe(404);

      // Student creates own deck and CANNOT escalate it to isAssigned: true via PATCH -> 403
      const ownDeck = await (
        await worker.fetch(
          new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
            method: "POST",
            headers: authHeaders(STUDENT_USER.token),
            body: JSON.stringify({ title: "Bộ riêng" }),
          }),
          env
        )
      ).json();

      const escalatePatch = await worker.fetch(
        new Request(
          `https://munnn01-d1-api.munnn01.workers.dev/api/decks/${ownDeck.deck.id}`,
          {
            method: "PATCH",
            headers: authHeaders(STUDENT_USER.token),
            body: JSON.stringify({ isAssigned: true }),
          }
        ),
        env
      );
      expect(escalatePatch.status).toBe(403);

      // Teacher CAN update own deck
      const teacherPatch = await worker.fetch(
        new Request(
          `https://munnn01-d1-api.munnn01.workers.dev/api/decks/${deckId}`,
          {
            method: "PATCH",
            headers: authHeaders(TEACHER_USER.token),
            body: JSON.stringify({
              title: "Thời tiết Việt Nam",
              description: "Đã cập nhật",
            }),
          }
        ),
        env
      );
      expect(teacherPatch.status).toBe(200);
      const patched = await teacherPatch.json();
      expect(patched.deck.title).toBe("Thời tiết Việt Nam");
      expect(patched.deck.flashcards).toHaveLength(1);

      // Teacher deletes deck -> cascades flashcards + student_card_progress cleanly
      const deleteRes = await worker.fetch(
        new Request(
          `https://munnn01-d1-api.munnn01.workers.dev/api/decks/${deckId}`,
          {
            method: "DELETE",
            headers: authHeaders(TEACHER_USER.token),
          }
        ),
        env
      );
      expect(deleteRes.status).toBe(200);
      expect(await deleteRes.json()).toEqual({
        ok: true,
        deleted: true,
        id: deckId,
      });

      const remainingCards = db.sqlite
        .prepare("SELECT COUNT(*) AS c FROM flashcards WHERE deck_id = ?")
        .get(deckId);
      const remainingProgress = db.sqlite
        .prepare(
          "SELECT COUNT(*) AS c FROM student_card_progress WHERE deck_id = ?"
        )
        .get(deckId);
      expect(remainingCards.c).toBe(0);
      expect(remainingProgress.c).toBe(0);
    });

    it("supports bulk card append at MAX(position)+1, card PATCH, and card DELETE with ownership checks", async () => {
      const created = await (
        await worker.fetch(
          new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
            method: "POST",
            headers: authHeaders(STUDENT_USER.token),
            body: JSON.stringify({
              title: "Sinh hoạt",
              topicId: "routine",
              cards: [
                { frontVi: "thức dậy", definition: "wake up" },
                { frontVi: "đánh răng", definition: "brush teeth" },
                { frontVi: "ăn sáng", definition: "eat breakfast" },
              ],
            }),
          }),
          env
        )
      ).json();

      const deckId = created.deck.id;
      const middleCardId = created.deck.flashcards[1].id;

      // Delete middle card (position 1), leaving positions 0 and 2
      const delMid = await worker.fetch(
        new Request(
          `https://munnn01-d1-api.munnn01.workers.dev/api/cards/${middleCardId}`,
          {
            method: "DELETE",
            headers: authHeaders(STUDENT_USER.token),
          }
        ),
        env
      );
      expect(delMid.status).toBe(200);

      // Append 2 cards -> must start at MAX(position) + 1 = 3
      const appendRes = await worker.fetch(
        new Request(
          `https://munnn01-d1-api.munnn01.workers.dev/api/decks/${deckId}/cards`,
          {
            method: "POST",
            headers: authHeaders(STUDENT_USER.token),
            body: JSON.stringify({
              cards: [
                { frontVi: "đi làm", definition: "go to work" },
                { frontVi: "nghỉ trưa", definition: "take a lunch break" },
              ],
            }),
          }
        ),
        env
      );
      expect(appendRes.status).toBe(201);
      const appended = await appendRes.json();
      expect(appended.cards.map((c) => c.position)).toEqual([3, 4]);

      const targetCardId = appended.cards[0].id;

      // Another user cannot PATCH student's card
      const otherPatch = await worker.fetch(
        new Request(
          `https://munnn01-d1-api.munnn01.workers.dev/api/cards/${targetCardId}`,
          {
            method: "PATCH",
            headers: authHeaders(TEACHER_USER.token),
            body: JSON.stringify({ definition: "hijacked" }),
          }
        ),
        env
      );
      expect(otherPatch.status).toBe(404);

      // Owner can PATCH card
      const ownerPatch = await worker.fetch(
        new Request(
          `https://munnn01-d1-api.munnn01.workers.dev/api/cards/${targetCardId}`,
          {
            method: "PATCH",
            headers: authHeaders(STUDENT_USER.token),
            body: JSON.stringify({
              masteryLevel: 4,
              reviewCount: 3,
              notes: "Dùng hằng ngày",
            }),
          }
        ),
        env
      );
      expect(ownerPatch.status).toBe(200);
      const patchedCard = (await ownerPatch.json()).card;
      expect(patchedCard).toMatchObject({
        id: targetCardId,
        mastery_level: 4,
        review_count: 3,
        notes: "Dùng hằng ngày",
      });
    });
  });

  describe("Student Progress Upsert & Batched GET /api/decks", () => {
    it("upserts student_card_progress resolving deck_id automatically and increments review_count atomically", async () => {
      // Teacher creates assigned deck
      const teacherDeck = (
        await (
          await worker.fetch(
            new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
              method: "POST",
              headers: authHeaders(TEACHER_USER.token),
              body: JSON.stringify({
                title: "Cảm xúc cơ bản",
                topicId: "emotions",
                isAssigned: true,
                cards: [{ frontVi: "hào hứng", definition: "excited" }],
              }),
            }),
            env
          )
        ).json()
      ).deck;

      // Teacher also creates a private unassigned deck
      const teacherPrivateDeck = (
        await (
          await worker.fetch(
            new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
              method: "POST",
              headers: authHeaders(TEACHER_USER.token),
              body: JSON.stringify({
                title: "Nháp riêng giáo viên",
                isAssigned: false,
                cards: [{ frontVi: "bí mật", definition: "secret" }],
              }),
            }),
            env
          )
        ).json()
      ).deck;

      const cardId = teacherDeck.flashcards[0].id;

      // First review (omitting deckId -> auto-resolved!)
      const firstPut = await worker.fetch(
        new Request(
          `https://munnn01-d1-api.munnn01.workers.dev/api/student-progress/${cardId}`,
          {
            method: "PUT",
            headers: authHeaders(STUDENT_USER.token),
            body: JSON.stringify({ masteryLevel: 2 }),
          }
        ),
        env
      );
      expect(firstPut.status).toBe(200);
      expect((await firstPut.json()).progress).toMatchObject({
        user_id: STUDENT_USER.id,
        card_id: cardId,
        deck_id: teacherDeck.id,
        mastery_level: 2,
        review_count: 1,
      });

      // Second review -> increments review_count atomically to 2
      const secondPut = await worker.fetch(
        new Request(
          `https://munnn01-d1-api.munnn01.workers.dev/api/student-progress/${cardId}`,
          {
            method: "PUT",
            headers: authHeaders(STUDENT_USER.token),
            body: JSON.stringify({ masteryLevel: 5 }),
          }
        ),
        env
      );
      expect(secondPut.status).toBe(200);
      expect((await secondPut.json()).progress).toMatchObject({
        card_id: cardId,
        deck_id: teacherDeck.id,
        mastery_level: 5,
        review_count: 2,
      });

      // Private card belonging to another user -> 403
      const forbiddenPut = await worker.fetch(
        new Request(
          `https://munnn01-d1-api.munnn01.workers.dev/api/student-progress/${teacherPrivateDeck.flashcards[0].id}`,
          {
            method: "PUT",
            headers: authHeaders(STUDENT_USER.token),
            body: JSON.stringify({ masteryLevel: 3 }),
          }
        ),
        env
      );
      expect(forbiddenPut.status).toBe(403);

      // Missing card -> 404
      const missingPut = await worker.fetch(
        new Request(
          "https://munnn01-d1-api.munnn01.workers.dev/api/student-progress/00000000-0000-4000-8000-000000000000",
          {
            method: "PUT",
            headers: authHeaders(STUDENT_USER.token),
            body: JSON.stringify({ masteryLevel: 1 }),
          }
        ),
        env
      );
      expect(missingPut.status).toBe(404);

      // GET /api/decks returns assignedDecks, ownDecks, studentProgress in a single DB.batch call
      db.resetBatchCallCount();
      const decksRes = await worker.fetch(
        new Request("https://munnn01-d1-api.munnn01.workers.dev/api/decks", {
          headers: authHeaders(STUDENT_USER.token),
        }),
        env
      );
      expect(decksRes.status).toBe(200);
      expect(db.getBatchCallCount()).toBe(1);

      const decksData = await decksRes.json();
      expect(decksData.assignedDecks).toHaveLength(1);
      expect(decksData.ownDecks).toHaveLength(0);
      expect(decksData.studentProgress).toHaveLength(1);
      expect(decksData.studentProgress[0]).toMatchObject({
        card_id: cardId,
        deck_id: teacherDeck.id,
        mastery_level: 5,
        review_count: 2,
      });
    });
  });

  describe("Skill Progress & Game Sessions", () => {
    it("supports GET/PUT /api/skill-progress with upsert and JSON topic_mastery", async () => {
      // Initially null
      const initialRes = await worker.fetch(
        new Request(
          "https://munnn01-d1-api.munnn01.workers.dev/api/skill-progress",
          {
            headers: authHeaders(STUDENT_USER.token),
          }
        ),
        env
      );
      expect(initialRes.status).toBe(200);
      expect(await initialRes.json()).toEqual({ ok: true, progress: null });

      // First PUT inserts
      const put1 = await worker.fetch(
        new Request(
          "https://munnn01-d1-api.munnn01.workers.dev/api/skill-progress",
          {
            method: "PUT",
            headers: authHeaders(STUDENT_USER.token),
            body: JSON.stringify({
              listening: 72.5,
              speaking: 55,
              reading: 80,
              pronunciation: 64.25,
              xp: 180,
              streakDays: 4,
              lastActiveDate: "2026-11-28",
              topicMastery: { self: 85, food: 60, invalid_key: 99 },
            }),
          }
        ),
        env
      );
      expect(put1.status).toBe(200);
      const saved1 = (await put1.json()).progress;
      expect(saved1).toMatchObject({
        user_id: STUDENT_USER.id,
        listening: 72.5,
        speaking: 55,
        reading: 80,
        pronunciation: 64.25,
        xp: 180,
        streak_days: 4,
        last_active_date: "2026-11-28",
        topic_mastery: { self: 85, food: 60 },
      });

      // Second PUT updates cleanly
      const put2 = await worker.fetch(
        new Request(
          "https://munnn01-d1-api.munnn01.workers.dev/api/skill-progress",
          {
            method: "PUT",
            headers: authHeaders(STUDENT_USER.token),
            body: JSON.stringify({
              listening: 120, // clamped to 100
              speaking: 60,
              reading: 85,
              pronunciation: 70,
              xp: 240,
              streak_days: 5,
              last_active_date: "2026-11-29",
              topic_mastery: { self: 92, food: 74, opinions: 40 },
            }),
          }
        ),
        env
      );
      expect(put2.status).toBe(200);
      expect((await put2.json()).progress).toMatchObject({
        listening: 100,
        xp: 240,
        streak_days: 5,
        topic_mastery: { self: 92, food: 74, opinions: 40 },
      });

      // GET reads back latest snapshot
      const readBack = await (
        await worker.fetch(
          new Request(
            "https://munnn01-d1-api.munnn01.workers.dev/api/skill-progress",
            {
              headers: authHeaders(STUDENT_USER.token),
            }
          ),
          env
        )
      ).json();
      expect(readBack.progress.xp).toBe(240);
      expect(readBack.progress.topic_mastery.opinions).toBe(40);
    });

    it("supports POST/GET /api/game-sessions with filtering, limit, and user isolation", async () => {
      // Student posts 2 sessions
      const s1Res = await worker.fetch(
        new Request(
          "https://munnn01-d1-api.munnn01.workers.dev/api/game-sessions",
          {
            method: "POST",
            headers: authHeaders(STUDENT_USER.token),
            body: JSON.stringify({
              gameType: "listen_match",
              topicId: "food",
              skillTags: ["listening", "invalid_tag"],
              score: 8,
              maxScore: 10,
              durationSeconds: 95,
              details: { round: 1, perfect: false },
              createdAt: "2026-11-28T10:00:00.000Z",
            }),
          }
        ),
        env
      );
      expect(s1Res.status).toBe(201);
      const s1 = (await s1Res.json()).session;
      expect(s1).toMatchObject({
        game_type: "listen_match",
        topic_id: "food",
        skill_tags: ["listening"],
        score: 8,
        max_score: 10,
        accuracy: 80,
        duration_seconds: 95,
        details_json: { round: 1, perfect: false },
      });

      const s2Res = await worker.fetch(
        new Request(
          "https://munnn01-d1-api.munnn01.workers.dev/api/game-sessions",
          {
            method: "POST",
            headers: authHeaders(STUDENT_USER.token),
            body: JSON.stringify({
              gameType: "synonym-antonym-chase",
              topicId: "opinions",
              skillTags: ["reading"],
              score: 10,
              maxScore: 10,
              accuracy: 100,
              durationSeconds: 62,
              details: { track: "lofi" },
              createdAt: "2026-11-28T11:00:00.000Z",
            }),
          }
        ),
        env
      );
      expect(s2Res.status).toBe(201);

      // Teacher posts 1 session (must NOT leak into student GET)
      const teacherSessionRes = await worker.fetch(
        new Request(
          "https://munnn01-d1-api.munnn01.workers.dev/api/game-sessions",
          {
            method: "POST",
            headers: authHeaders(TEACHER_USER.token),
            body: JSON.stringify({
              gameType: "listen_match",
              topicId: "food",
              skillTags: ["listening"],
              score: 10,
              maxScore: 10,
              createdAt: "2026-11-28T12:00:00.000Z",
            }),
          }
        ),
        env
      );
      expect(teacherSessionRes.status).toBe(201);

      // Student GET all (newest first, isolated to student)
      const allStudent = await (
        await worker.fetch(
          new Request(
            "https://munnn01-d1-api.munnn01.workers.dev/api/game-sessions?limit=50",
            {
              headers: authHeaders(STUDENT_USER.token),
            }
          ),
          env
        )
      ).json();
      expect(allStudent.sessions).toHaveLength(2);
      expect(allStudent.sessions[0].game_type).toBe("synonym-antonym-chase");
      expect(allStudent.sessions[1].game_type).toBe("listen_match");

      // Filtered by topicId & gameType
      const filtered = await (
        await worker.fetch(
          new Request(
            "https://munnn01-d1-api.munnn01.workers.dev/api/game-sessions?topicId=food&gameType=listen_match&limit=10",
            {
              headers: authHeaders(STUDENT_USER.token),
            }
          ),
          env
        )
      ).json();
      expect(filtered.sessions).toHaveLength(1);
      expect(filtered.sessions[0].topic_id).toBe("food");
      expect(filtered.sessions[0].details_json).toEqual({
        round: 1,
        perfect: false,
      });

      // Limit=1
      const limited = await (
        await worker.fetch(
          new Request(
            "https://munnn01-d1-api.munnn01.workers.dev/api/game-sessions?limit=1",
            {
              headers: authHeaders(STUDENT_USER.token),
            }
          ),
          env
        )
      ).json();
      expect(limited.sessions).toHaveLength(1);
      expect(limited.sessions[0].game_type).toBe("synonym-antonym-chase");
    });
  });
});
