/**
 * munnn01 — Cloudflare D1 Edge API Worker (`munnn01-d1-api`)
 *
 * Pure ES module, zero npm dependencies, zero module-level mutable request state.
 * Verifies Supabase JWTs against pinned `env.SUPABASE_URL`, enforces authoritative
 * teacher role checks via Supabase `user_profiles`, and persists study data in
 * Cloudflare D1 (`env.DB`) using parameterized SQL and atomic `env.DB.batch` writes.
 */

const D1_CAPACITY_BYTES = 5368709120; // 5 GiB
const MAX_JSON_BODY_BYTES = 2 * 1024 * 1024; // 2 MiB
const DEFAULT_ALLOWED_ORIGINS =
  "https://vietnamese-neee.vercel.app,http://localhost:5173,http://127.0.0.1:5173";

const CORS_ALLOW_METHODS = "GET, POST, PATCH, PUT, DELETE, OPTIONS";
const CORS_ALLOW_HEADERS = "Authorization, Content-Type, X-Supabase-Key";

const TOPIC_IDS = Object.freeze([
  "self",
  "food",
  "routine",
  "weather",
  "emotions",
  "opinions",
]);

const TOPIC_ACCENTS = Object.freeze({
  self: "#38bdf8",
  food: "#f59e0b",
  routine: "#34d399",
  weather: "#60a5fa",
  emotions: "#f472b6",
  opinions: "#a78bfa",
});

const SKILL_IDS = Object.freeze([
  "listening",
  "speaking",
  "reading",
  "pronunciation",
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VERCEL_PREVIEW_HOST_PATTERN =
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.vercel\.app$/i;

const DECK_COLUMNS =
  "id, user_id, title, description, topic_id, color, is_default, is_assigned, teacher_name, assigned_at, created_at, updated_at";
const CARD_COLUMNS =
  "id, deck_id, user_id, front_vi, pos, ipa, definition, example_vi, example_en, notes, topic_id, mastery_level, review_count, last_reviewed_at, position, created_at, updated_at";
const CARD_COLUMNS_JOINED =
  "f.id, f.deck_id, f.user_id, f.front_vi, f.pos, f.ipa, f.definition, f.example_vi, f.example_en, f.notes, f.topic_id, f.mastery_level, f.review_count, f.last_reviewed_at, f.position, f.created_at, f.updated_at";
const STUDENT_PROGRESS_COLUMNS =
  "user_id, card_id, deck_id, mastery_level, review_count, last_reviewed_at, updated_at";
const SKILL_PROGRESS_COLUMNS =
  "user_id, listening, speaking, reading, pronunciation, xp, streak_days, last_active_date, topic_mastery, created_at, updated_at";
const GAME_SESSION_COLUMNS =
  "id, user_id, game_type, topic_id, skill_tags, score, max_score, accuracy, duration_seconds, details_json, created_at, updated_at";

const TEACHER_ONLY_ERROR = "Chỉ giáo viên mới có quyền giao bộ thẻ cho học sinh.";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

function isValidUuid(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function isValidTopicId(value) {
  return typeof value === "string" && TOPIC_IDS.includes(value);
}

function isValidSkillId(value) {
  return typeof value === "string" && SKILL_IDS.includes(value);
}

function clampNumber(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
}

function round2(value) {
  return Number(Number(value).toFixed(2));
}

function normalizeOptionalString(value) {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function safeParseJsonObject(value, fallback = {}) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : fallback;
  } catch {
    return fallback;
  }
}

function safeParseJsonArray(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function decodePathParam(raw) {
  try {
    const decoded = decodeURIComponent(raw).trim();
    if (!decoded) {
      throw new HttpError(400, "Mã định danh không hợp lệ.");
    }
    return decoded;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(400, "Mã định danh không hợp lệ.");
  }
}

// ============================================================================
// CORS Helpers
// ============================================================================

function parseAllowedOrigins(env) {
  const raw = String(env?.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS);
  const origins = new Set();
  for (const part of raw.split(",")) {
    const cleaned = part.trim().replace(/\/+$/, "");
    if (cleaned) origins.add(cleaned);
  }
  return origins;
}

/**
 * Check whether an Origin header is strictly allowed by `env.ALLOWED_ORIGINS`
 * or matches an HTTPS `*.vercel.app` preview deployment URL.
 */
export function isAllowedOrigin(origin, env) {
  if (!origin || typeof origin !== "string") return false;
  const normalized = origin.trim().replace(/\/+$/, "");
  if (!normalized) return false;

  const allowlist = parseAllowedOrigins(env);
  if (allowlist.has(normalized)) return true;

  try {
    const parsed = new URL(normalized);
    if (parsed.origin !== normalized) return false;
    if (parsed.protocol !== "https:" || parsed.port !== "") return false;
    return VERCEL_PREVIEW_HOST_PATTERN.test(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Build strict CORS + security headers for a given request origin.
 */
export function buildCorsHeaders(origin, env) {
  const headers = {
    Vary: "Origin",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  };

  if (origin && isAllowedOrigin(origin, env)) {
    headers["Access-Control-Allow-Origin"] = origin.trim().replace(/\/+$/, "");
    headers["Access-Control-Allow-Methods"] = CORS_ALLOW_METHODS;
    headers["Access-Control-Allow-Headers"] = CORS_ALLOW_HEADERS;
    headers["Access-Control-Max-Age"] = "86400";
  }

  return headers;
}

function jsonResponse(payload, status, origin, env) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...buildCorsHeaders(origin, env),
    },
  });
}

// ============================================================================
// Request Body Parsing (2 MiB limit)
// ============================================================================

async function readJsonBody(request) {
  const contentLengthHeader = request.headers.get("Content-Length");
  if (contentLengthHeader) {
    const declaredLength = Number(contentLengthHeader);
    if (Number.isFinite(declaredLength) && declaredLength > MAX_JSON_BODY_BYTES) {
      throw new HttpError(413, "Dữ liệu gửi lên vượt quá giới hạn 2 MB.");
    }
  }

  let rawText;
  try {
    rawText = await request.text();
  } catch {
    throw new HttpError(400, "Không thể đọc nội dung yêu cầu.");
  }

  const byteLength = new TextEncoder().encode(rawText).byteLength;
  if (byteLength > MAX_JSON_BODY_BYTES) {
    throw new HttpError(413, "Dữ liệu gửi lên vượt quá giới hạn 2 MB.");
  }

  if (!rawText.trim()) return {};

  try {
    const parsed = JSON.parse(rawText);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new HttpError(400, "Nội dung JSON phải là một đối tượng hợp lệ.");
    }
    return parsed;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(400, "Nội dung JSON không hợp lệ.");
  }
}

// ============================================================================
// Supabase JWT Auth & Authoritative Teacher Role Verification
// ============================================================================

function getPinnedSupabaseUrl(env) {
  const url = String(env?.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  if (!url) {
    throw new HttpError(500, "Chưa cấu hình SUPABASE_URL trên máy chủ.");
  }
  return url;
}

function extractAuthCredentials(request, env) {
  const authHeader = String(request.headers.get("Authorization") || "").trim();
  const match = authHeader.match(/^Bearer\s+([^\s]+)$/i);
  const token = match ? match[1].trim() : "";
  if (!token) {
    throw new HttpError(401, "Vui lòng đăng nhập để tiếp tục.");
  }

  const apikey = String(
    env?.SUPABASE_ANON_KEY || request.headers.get("X-Supabase-Key") || ""
  ).trim();
  if (!apikey) {
    throw new HttpError(401, "Thiếu khóa xác thực Supabase.");
  }

  return { token, apikey };
}

/**
 * Verify a Supabase access token against pinned `env.SUPABASE_URL/auth/v1/user`.
 * Never trusts any client-supplied Supabase URL.
 */
export async function verifySupabaseAuth(request, env) {
  const { token, apikey } = extractAuthCredentials(request, env);
  const supabaseUrl = getPinnedSupabaseUrl(env);

  let response;
  try {
    response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey,
        Accept: "application/json",
      },
    });
  } catch {
    throw new HttpError(503, "Không thể kết nối máy chủ xác thực Supabase.");
  }

  if (!response.ok) {
    throw new HttpError(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
  }

  let user;
  try {
    user = await response.json();
  } catch {
    throw new HttpError(401, "Phản hồi xác thực không hợp lệ.");
  }

  const userId = typeof user?.id === "string" ? user.id.trim() : "";
  if (!userId) {
    throw new HttpError(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
  }

  return {
    userId,
    email: typeof user.email === "string" ? user.email : "",
    displayName: String(user.user_metadata?.display_name || "").trim(),
    metadataRole: String(user.user_metadata?.role || "student")
      .trim()
      .toLowerCase(),
  };
}

/**
 * Perform an authoritative DB role check against Supabase `user_profiles`.
 * Fails closed (`isTeacher: false`) so students can never forge `isAssigned: true`.
 */
export async function verifyIsTeacher(auth, token, apikey, env) {
  const supabaseUrl = getPinnedSupabaseUrl(env);
  const endpoint = `${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${encodeURIComponent(
    auth.userId
  )}&select=role,display_name`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return { isTeacher: false, displayName: auth.displayName };
    }

    const data = await response.json();
    const row = Array.isArray(data) ? data[0] : data;
    const role = String(row?.role || "").trim().toLowerCase();
    const displayName =
      String(row?.display_name || "").trim() || auth.displayName;

    return {
      isTeacher: role === "teacher",
      displayName,
    };
  } catch {
    return { isTeacher: false, displayName: auth.displayName };
  }
}

// ============================================================================
// Row Formatters (matching frontend `normalizeDeck` / `normalizeFlashcard` / etc.)
// ============================================================================

function formatCardRow(row) {
  return {
    id: row.id,
    deck_id: row.deck_id,
    user_id: row.user_id,
    front_vi: row.front_vi,
    pos: row.pos ?? "",
    ipa: row.ipa ?? "",
    definition: row.definition,
    example_vi: row.example_vi ?? "",
    example_en: row.example_en ?? "",
    notes: row.notes ?? "",
    topic_id: row.topic_id ?? null,
    mastery_level: Number(row.mastery_level ?? 0),
    review_count: Number(row.review_count ?? 0),
    last_reviewed_at: row.last_reviewed_at ?? null,
    position: Number(row.position ?? 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function formatDeckRow(row, flashcards = []) {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description ?? "",
    topic_id: row.topic_id ?? null,
    color: row.color || "#38bdf8",
    is_default: Boolean(row.is_default),
    is_assigned: Boolean(row.is_assigned),
    teacher_name: row.teacher_name ?? "",
    assigned_at: row.assigned_at ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    flashcards,
  };
}

function formatStudentProgressRow(row) {
  return {
    user_id: row.user_id,
    card_id: row.card_id,
    deck_id: row.deck_id,
    mastery_level: Number(row.mastery_level ?? 0),
    review_count: Number(row.review_count ?? 0),
    last_reviewed_at: row.last_reviewed_at ?? null,
    updated_at: row.updated_at,
  };
}

function formatSkillProgressRow(row) {
  if (!row) return null;
  return {
    user_id: row.user_id,
    listening: Number(row.listening ?? 0),
    speaking: Number(row.speaking ?? 0),
    reading: Number(row.reading ?? 0),
    pronunciation: Number(row.pronunciation ?? 0),
    xp: Number(row.xp ?? 0),
    streak_days: Number(row.streak_days ?? 0),
    last_active_date: row.last_active_date ?? null,
    topic_mastery: safeParseJsonObject(row.topic_mastery, {}),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function formatGameSessionRow(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    game_type: row.game_type,
    topic_id: row.topic_id ?? null,
    skill_tags: safeParseJsonArray(row.skill_tags, []),
    score: Number(row.score ?? 0),
    max_score: Number(row.max_score ?? 0),
    accuracy: Number(row.accuracy ?? 0),
    duration_seconds: Number(row.duration_seconds ?? 0),
    details_json: safeParseJsonObject(row.details_json, {}),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function groupCardsByDeck(cardRows) {
  const byDeck = new Map();
  for (const row of cardRows || []) {
    const formatted = formatCardRow(row);
    const list = byDeck.get(formatted.deck_id);
    if (list) {
      list.push(formatted);
    } else {
      byDeck.set(formatted.deck_id, [formatted]);
    }
  }
  return byDeck;
}

function prepareCardRecords(cardsInput, deckId, userId, startPosition, now) {
  const seenIds = new Set();
  const prepared = [];

  for (const raw of cardsInput) {
    if (!raw || typeof raw !== "object") continue;

    const frontVi = String(raw.frontVi ?? raw.front_vi ?? raw.term ?? "").trim();
    const definition = String(raw.definition ?? raw.meaning ?? "").trim();
    if (!frontVi || !definition) continue;

    let cardId = isValidUuid(raw.id) ? raw.id : crypto.randomUUID();
    if (seenIds.has(cardId)) {
      cardId = crypto.randomUUID();
    }
    seenIds.add(cardId);

    const topicCandidate = raw.topicId !== undefined ? raw.topicId : raw.topic_id;
    const topicId = isValidTopicId(topicCandidate) ? topicCandidate : null;

    const masteryLevel = Math.round(
      clampNumber(raw.masteryLevel ?? raw.mastery_level ?? 0, 0, 5)
    );
    const reviewCount = Math.max(
      0,
      Math.round(Number(raw.reviewCount ?? raw.review_count ?? 0) || 0)
    );
    const lastReviewedAt = normalizeOptionalString(
      raw.lastReviewedAt ?? raw.last_reviewed_at
    );

    const position = startPosition + prepared.length;

    prepared.push({
      id: cardId,
      deck_id: deckId,
      user_id: userId,
      front_vi: frontVi,
      pos: String(raw.pos ?? raw.partOfSpeech ?? raw.part_of_speech ?? "").trim(),
      ipa: String(raw.ipa ?? raw.phonetic ?? "").trim(),
      definition,
      example_vi: String(raw.exampleVi ?? raw.example_vi ?? raw.example ?? "").trim(),
      example_en: String(raw.exampleEn ?? raw.example_en ?? "").trim(),
      notes: String(raw.notes ?? "").trim(),
      topic_id: topicId,
      mastery_level: masteryLevel,
      review_count: reviewCount,
      last_reviewed_at: lastReviewedAt,
      position,
      created_at: now,
      updated_at: now,
    });
  }

  return prepared;
}

function buildInsertCardStatement(db, card) {
  return db
    .prepare(
      `INSERT INTO flashcards (
        id, deck_id, user_id, front_vi, pos, ipa, definition,
        example_vi, example_en, notes, topic_id, mastery_level,
        review_count, last_reviewed_at, position, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      card.id,
      card.deck_id,
      card.user_id,
      card.front_vi,
      card.pos,
      card.ipa,
      card.definition,
      card.example_vi,
      card.example_en,
      card.notes,
      card.topic_id,
      card.mastery_level,
      card.review_count,
      card.last_reviewed_at,
      card.position,
      card.created_at,
      card.updated_at
    );
}

function extractFirstNumber(result) {
  const row = result?.results?.[0];
  if (!row || typeof row !== "object") return 0;
  const firstVal = Object.values(row)[0];
  const num = Number(firstVal);
  return Number.isFinite(num) ? num : 0;
}

function requireDb(env) {
  if (!env?.DB) {
    throw new HttpError(500, "Chưa gắn kết cơ sở dữ liệu Cloudflare D1 (DB binding).");
  }
  return env.DB;
}

// ============================================================================
// Route Handlers
// ============================================================================

async function handleHealth(env) {
  const db = requireDb(env);

  const countResults = await db.batch([
    db.prepare("SELECT COUNT(*) AS count FROM flashcard_decks"),
    db.prepare("SELECT COUNT(*) AS count FROM flashcard_decks WHERE is_assigned = 1"),
    db.prepare("SELECT COUNT(*) AS count FROM flashcards"),
    db.prepare("SELECT COUNT(*) AS count FROM student_card_progress"),
    db.prepare("SELECT COUNT(*) AS count FROM game_sessions"),
    db.prepare("SELECT COUNT(*) AS count FROM skill_progress"),
  ]);

  let usedBytes = 0;
  try {
    const pragmaResults = await db.batch([
      db.prepare("PRAGMA page_count"),
      db.prepare("PRAGMA page_size"),
    ]);
    const pageCount = extractFirstNumber(pragmaResults[0]);
    const pageSize = extractFirstNumber(pragmaResults[1]);
    usedBytes = Math.max(0, Math.round(pageCount * pageSize));
  } catch {
    usedBytes = 0;
  }

  if (usedBytes === 0) {
    const metaSize = Number(countResults[0]?.meta?.size_after || 0);
    if (Number.isFinite(metaSize) && metaSize > 0) {
      usedBytes = Math.round(metaSize);
    }
  }

  return {
    status: 200,
    body: {
      ok: true,
      engine: "cloudflare-d1",
      database: "munnn01-db",
      region: "APAC",
      capacityBytes: D1_CAPACITY_BYTES,
      usedBytes,
      counts: {
        decks: extractFirstNumber(countResults[0]),
        assignedDecks: extractFirstNumber(countResults[1]),
        flashcards: extractFirstNumber(countResults[2]),
        studentProgress: extractFirstNumber(countResults[3]),
        gameSessions: extractFirstNumber(countResults[4]),
        skillProfiles: extractFirstNumber(countResults[5]),
      },
    },
  };
}

async function handleGetAssignedDecks(env) {
  const db = requireDb(env);

  const [decksResult, cardsResult] = await db.batch([
    db.prepare(
      `SELECT ${DECK_COLUMNS}
       FROM flashcard_decks
       WHERE is_assigned = 1
       ORDER BY assigned_at DESC, created_at DESC`
    ),
    db.prepare(
      `SELECT ${CARD_COLUMNS_JOINED}
       FROM flashcards f
       INNER JOIN flashcard_decks d ON d.id = f.deck_id
       WHERE d.is_assigned = 1
       ORDER BY f.position ASC, f.created_at ASC`
    ),
  ]);

  const cardsByDeck = groupCardsByDeck(cardsResult.results);
  const decks = (decksResult.results || []).map((row) =>
    formatDeckRow(row, cardsByDeck.get(row.id) || [])
  );

  return { status: 200, body: { ok: true, decks } };
}

async function handleGetDecks(auth, env) {
  const db = requireDb(env);

  const [
    assignedDecksRes,
    assignedCardsRes,
    ownDecksRes,
    ownCardsRes,
    progressRes,
  ] = await db.batch([
    db.prepare(
      `SELECT ${DECK_COLUMNS}
       FROM flashcard_decks
       WHERE is_assigned = 1
       ORDER BY assigned_at DESC, created_at DESC`
    ),
    db.prepare(
      `SELECT ${CARD_COLUMNS_JOINED}
       FROM flashcards f
       INNER JOIN flashcard_decks d ON d.id = f.deck_id
       WHERE d.is_assigned = 1
       ORDER BY f.position ASC, f.created_at ASC`
    ),
    db
      .prepare(
        `SELECT ${DECK_COLUMNS}
         FROM flashcard_decks
         WHERE user_id = ?
         ORDER BY created_at DESC`
      )
      .bind(auth.userId),
    db
      .prepare(
        `SELECT ${CARD_COLUMNS}
         FROM flashcards
         WHERE user_id = ?
         ORDER BY position ASC, created_at ASC`
      )
      .bind(auth.userId),
    db
      .prepare(
        `SELECT ${STUDENT_PROGRESS_COLUMNS}
         FROM student_card_progress
         WHERE user_id = ?`
      )
      .bind(auth.userId),
  ]);

  const assignedCardsByDeck = groupCardsByDeck(assignedCardsRes.results);
  const assignedDecks = (assignedDecksRes.results || []).map((row) =>
    formatDeckRow(row, assignedCardsByDeck.get(row.id) || [])
  );

  const ownCardsByDeck = groupCardsByDeck(ownCardsRes.results);
  const ownDecks = (ownDecksRes.results || []).map((row) =>
    formatDeckRow(row, ownCardsByDeck.get(row.id) || [])
  );

  const studentProgress = (progressRes.results || []).map(formatStudentProgressRow);

  return {
    status: 200,
    body: { ok: true, assignedDecks, ownDecks, studentProgress },
  };
}

async function handleCreateDeck(request, auth, token, apikey, env) {
  const db = requireDb(env);
  const body = await readJsonBody(request);

  const title = String(body.title || "").trim();
  if (!title) {
    throw new HttpError(400, "Tên bộ thẻ không được để trống.");
  }

  const description = String(body.description || "").trim();
  const topicCandidate = body.topicId !== undefined ? body.topicId : body.topic_id;
  const topicId = isValidTopicId(topicCandidate) ? topicCandidate : null;
  const color =
    String(body.color || "").trim() ||
    (topicId ? TOPIC_ACCENTS[topicId] : "#38bdf8");
  const isDefault = Boolean(body.isDefault ?? body.is_default ?? false);
  const isAssigned = Boolean(body.isAssigned ?? body.is_assigned ?? false);

  let teacherName = String(
    body.teacherName ?? body.teacher_name ?? ""
  ).trim();
  const now = new Date().toISOString();
  let assignedAt = null;

  if (isAssigned) {
    const teacherCheck = await verifyIsTeacher(auth, token, apikey, env);
    if (!teacherCheck.isTeacher) {
      throw new HttpError(403, TEACHER_ONLY_ERROR);
    }
    if (!teacherName) {
      teacherName = teacherCheck.displayName || "Giáo viên";
    }
    assignedAt =
      normalizeOptionalString(body.assignedAt ?? body.assigned_at) || now;
  }

  const deckId = isValidUuid(body.id) ? body.id : crypto.randomUUID();
  const rawCards = Array.isArray(body.cards)
    ? body.cards
    : Array.isArray(body.flashcards)
      ? body.flashcards
      : [];

  const preparedCards = prepareCardRecords(rawCards, deckId, auth.userId, 0, now);

  const deckRecord = {
    id: deckId,
    user_id: auth.userId,
    title,
    description,
    topic_id: topicId,
    color,
    is_default: isDefault ? 1 : 0,
    is_assigned: isAssigned ? 1 : 0,
    teacher_name: teacherName,
    assigned_at: assignedAt,
    created_at: now,
    updated_at: now,
  };

  const statements = [
    db
      .prepare(
        `INSERT INTO flashcard_decks (
          id, user_id, title, description, topic_id, color,
          is_default, is_assigned, teacher_name, assigned_at,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        deckRecord.id,
        deckRecord.user_id,
        deckRecord.title,
        deckRecord.description,
        deckRecord.topic_id,
        deckRecord.color,
        deckRecord.is_default,
        deckRecord.is_assigned,
        deckRecord.teacher_name,
        deckRecord.assigned_at,
        deckRecord.created_at,
        deckRecord.updated_at
      ),
    ...preparedCards.map((card) => buildInsertCardStatement(db, card)),
  ];

  await db.batch(statements);

  return {
    status: 201,
    body: {
      ok: true,
      deck: formatDeckRow(deckRecord, preparedCards.map(formatCardRow)),
    },
  };
}

async function handleUpdateDeck(request, deckId, auth, token, apikey, env) {
  const db = requireDb(env);

  const existing = await db
    .prepare(
      `SELECT ${DECK_COLUMNS} FROM flashcard_decks WHERE id = ? AND user_id = ?`
    )
    .bind(deckId, auth.userId)
    .first();

  if (!existing) {
    throw new HttpError(404, "Không tìm thấy bộ thẻ.");
  }

  const body = await readJsonBody(request);
  const topicInput = body.topicId !== undefined ? body.topicId : body.topic_id;
  const isAssignedInput =
    body.isAssigned !== undefined ? body.isAssigned : body.is_assigned;
  const teacherNameInput =
    body.teacherName !== undefined ? body.teacherName : body.teacher_name;
  const assignedAtInput =
    body.assignedAt !== undefined ? body.assignedAt : body.assigned_at;

  let nextTitle = existing.title;
  if (body.title !== undefined) {
    nextTitle = String(body.title).trim();
    if (!nextTitle) {
      throw new HttpError(400, "Tên bộ thẻ không được để trống.");
    }
  }

  const nextDescription =
    body.description !== undefined
      ? String(body.description).trim()
      : existing.description;

  const nextTopicId =
    topicInput !== undefined
      ? isValidTopicId(topicInput)
        ? topicInput
        : null
      : existing.topic_id;

  const nextColor =
    body.color !== undefined
      ? String(body.color).trim() || existing.color
      : existing.color;

  const now = new Date().toISOString();
  let nextIsAssigned = Boolean(existing.is_assigned);
  let nextTeacherName =
    teacherNameInput !== undefined
      ? String(teacherNameInput || "").trim()
      : existing.teacher_name;
  let nextAssignedAt = existing.assigned_at;

  if (isAssignedInput !== undefined) {
    nextIsAssigned = Boolean(isAssignedInput);
    if (nextIsAssigned) {
      const teacherCheck = await verifyIsTeacher(auth, token, apikey, env);
      if (!teacherCheck.isTeacher) {
        throw new HttpError(403, TEACHER_ONLY_ERROR);
      }
      if (!nextTeacherName) {
        nextTeacherName = teacherCheck.displayName || "Giáo viên";
      }
      nextAssignedAt =
        normalizeOptionalString(assignedAtInput) || existing.assigned_at || now;
    } else {
      nextAssignedAt = null;
    }
  } else if (assignedAtInput !== undefined) {
    nextAssignedAt = normalizeOptionalString(assignedAtInput);
  }

  const [, updatedRes, cardsRes] = await db.batch([
    db
      .prepare(
        `UPDATE flashcard_decks
         SET title = ?, description = ?, topic_id = ?, color = ?,
             is_assigned = ?, teacher_name = ?, assigned_at = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`
      )
      .bind(
        nextTitle,
        nextDescription,
        nextTopicId,
        nextColor,
        nextIsAssigned ? 1 : 0,
        nextTeacherName,
        nextAssignedAt,
        now,
        deckId,
        auth.userId
      ),
    db
      .prepare(
        `SELECT ${DECK_COLUMNS} FROM flashcard_decks WHERE id = ? AND user_id = ?`
      )
      .bind(deckId, auth.userId),
    db
      .prepare(
        `SELECT ${CARD_COLUMNS}
         FROM flashcards
         WHERE deck_id = ?
         ORDER BY position ASC, created_at ASC`
      )
      .bind(deckId),
  ]);

  const updatedDeck = updatedRes.results?.[0];
  if (!updatedDeck) {
    throw new HttpError(404, "Không tìm thấy bộ thẻ.");
  }

  return {
    status: 200,
    body: {
      ok: true,
      deck: formatDeckRow(
        updatedDeck,
        (cardsRes.results || []).map(formatCardRow)
      ),
    },
  };
}

async function handleDeleteDeck(deckId, auth, env) {
  const db = requireDb(env);

  const existing = await db
    .prepare("SELECT id FROM flashcard_decks WHERE id = ? AND user_id = ?")
    .bind(deckId, auth.userId)
    .first();

  if (!existing) {
    throw new HttpError(404, "Không tìm thấy bộ thẻ.");
  }

  await db.batch([
    db
      .prepare(
        `DELETE FROM student_card_progress
         WHERE deck_id = ?
            OR card_id IN (SELECT id FROM flashcards WHERE deck_id = ?)`
      )
      .bind(deckId, deckId),
    db.prepare("DELETE FROM flashcards WHERE deck_id = ?").bind(deckId),
    db
      .prepare("DELETE FROM flashcard_decks WHERE id = ? AND user_id = ?")
      .bind(deckId, auth.userId),
  ]);

  return { status: 200, body: { ok: true, deleted: true, id: deckId } };
}

async function handleAddCardsBulk(request, deckId, auth, env) {
  const db = requireDb(env);

  const deck = await db
    .prepare("SELECT id, topic_id FROM flashcard_decks WHERE id = ? AND user_id = ?")
    .bind(deckId, auth.userId)
    .first();

  if (!deck) {
    throw new HttpError(404, "Không tìm thấy bộ thẻ.");
  }

  const body = await readJsonBody(request);
  const rawCards = Array.isArray(body.cards) ? body.cards : [];
  if (rawCards.length === 0) {
    throw new HttpError(
      400,
      "Cần ít nhất từ vựng tiếng Việt và định nghĩa để tạo flashcard."
    );
  }

  const maxPosRow = await db
    .prepare(
      "SELECT COALESCE(MAX(position), -1) AS max_pos FROM flashcards WHERE deck_id = ?"
    )
    .bind(deckId)
    .first();

  const startPos = Number(maxPosRow?.max_pos ?? -1) + 1;
  const now = new Date().toISOString();
  const preparedCards = prepareCardRecords(
    rawCards,
    deckId,
    auth.userId,
    startPos,
    now
  );

  if (preparedCards.length === 0) {
    throw new HttpError(
      400,
      "Cần ít nhất từ vựng tiếng Việt và định nghĩa để tạo flashcard."
    );
  }

  await db.batch([
    ...preparedCards.map((card) => buildInsertCardStatement(db, card)),
    db
      .prepare(
        "UPDATE flashcard_decks SET updated_at = ? WHERE id = ? AND user_id = ?"
      )
      .bind(now, deckId, auth.userId),
  ]);

  return {
    status: 201,
    body: { ok: true, cards: preparedCards.map(formatCardRow) },
  };
}

async function handleUpdateCard(request, cardId, auth, env) {
  const db = requireDb(env);

  const existing = await db
    .prepare(
      `SELECT ${CARD_COLUMNS} FROM flashcards WHERE id = ? AND user_id = ?`
    )
    .bind(cardId, auth.userId)
    .first();

  if (!existing) {
    throw new HttpError(404, "Không tìm thấy flashcard.");
  }

  const body = await readJsonBody(request);
  const frontViInput =
    body.frontVi !== undefined ? body.frontVi : body.front_vi;
  const exampleViInput =
    body.exampleVi !== undefined ? body.exampleVi : body.example_vi;
  const exampleEnInput =
    body.exampleEn !== undefined ? body.exampleEn : body.example_en;
  const topicInput = body.topicId !== undefined ? body.topicId : body.topic_id;
  const masteryInput =
    body.masteryLevel !== undefined ? body.masteryLevel : body.mastery_level;
  const reviewCountInput =
    body.reviewCount !== undefined ? body.reviewCount : body.review_count;
  const lastReviewedAtInput =
    body.lastReviewedAt !== undefined
      ? body.lastReviewedAt
      : body.last_reviewed_at;

  let nextFrontVi = existing.front_vi;
  if (frontViInput !== undefined) {
    nextFrontVi = String(frontViInput).trim();
    if (!nextFrontVi) {
      throw new HttpError(400, "Từ vựng tiếng Việt không được để trống.");
    }
  }

  let nextDefinition = existing.definition;
  if (body.definition !== undefined) {
    nextDefinition = String(body.definition).trim();
    if (!nextDefinition) {
      throw new HttpError(400, "Định nghĩa không được để trống.");
    }
  }

  const nextPos = body.pos !== undefined ? String(body.pos).trim() : existing.pos;
  const nextIpa = body.ipa !== undefined ? String(body.ipa).trim() : existing.ipa;
  const nextExampleVi =
    exampleViInput !== undefined
      ? String(exampleViInput).trim()
      : existing.example_vi;
  const nextExampleEn =
    exampleEnInput !== undefined
      ? String(exampleEnInput).trim()
      : existing.example_en;
  const nextNotes =
    body.notes !== undefined ? String(body.notes).trim() : existing.notes;
  const nextTopicId =
    topicInput !== undefined
      ? isValidTopicId(topicInput)
        ? topicInput
        : null
      : existing.topic_id;
  const nextMastery =
    masteryInput !== undefined
      ? Math.round(clampNumber(masteryInput, 0, 5))
      : Number(existing.mastery_level ?? 0);
  const nextReviewCount =
    reviewCountInput !== undefined
      ? Math.max(0, Math.round(Number(reviewCountInput) || 0))
      : Number(existing.review_count ?? 0);
  const nextLastReviewedAt =
    lastReviewedAtInput !== undefined
      ? normalizeOptionalString(lastReviewedAtInput)
      : existing.last_reviewed_at;
  const nextPosition =
    body.position !== undefined
      ? Math.max(0, Math.round(Number(body.position) || 0))
      : Number(existing.position ?? 0);

  const now = new Date().toISOString();

  const [, updatedRes] = await db.batch([
    db
      .prepare(
        `UPDATE flashcards
         SET front_vi = ?, pos = ?, ipa = ?, definition = ?,
             example_vi = ?, example_en = ?, notes = ?, topic_id = ?,
             mastery_level = ?, review_count = ?, last_reviewed_at = ?,
             position = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`
      )
      .bind(
        nextFrontVi,
        nextPos,
        nextIpa,
        nextDefinition,
        nextExampleVi,
        nextExampleEn,
        nextNotes,
        nextTopicId,
        nextMastery,
        nextReviewCount,
        nextLastReviewedAt,
        nextPosition,
        now,
        cardId,
        auth.userId
      ),
    db
      .prepare(
        `SELECT ${CARD_COLUMNS} FROM flashcards WHERE id = ? AND user_id = ?`
      )
      .bind(cardId, auth.userId),
  ]);

  const updatedCard = updatedRes.results?.[0];
  if (!updatedCard) {
    throw new HttpError(404, "Không tìm thấy flashcard.");
  }

  return { status: 200, body: { ok: true, card: formatCardRow(updatedCard) } };
}

async function handleDeleteCard(cardId, auth, env) {
  const db = requireDb(env);

  const existing = await db
    .prepare("SELECT id FROM flashcards WHERE id = ? AND user_id = ?")
    .bind(cardId, auth.userId)
    .first();

  if (!existing) {
    throw new HttpError(404, "Không tìm thấy flashcard.");
  }

  await db.batch([
    db
      .prepare("DELETE FROM student_card_progress WHERE card_id = ?")
      .bind(cardId),
    db
      .prepare("DELETE FROM flashcards WHERE id = ? AND user_id = ?")
      .bind(cardId, auth.userId),
  ]);

  return { status: 200, body: { ok: true, deleted: true, id: cardId } };
}

async function handleUpsertStudentProgress(request, cardId, auth, env) {
  const db = requireDb(env);
  const body = await readJsonBody(request);

  const card = await db
    .prepare("SELECT id, deck_id, user_id FROM flashcards WHERE id = ?")
    .bind(cardId)
    .first();

  if (!card) {
    throw new HttpError(404, "Không tìm thấy flashcard.");
  }

  if (card.user_id !== auth.userId) {
    const deck = await db
      .prepare("SELECT is_assigned FROM flashcard_decks WHERE id = ?")
      .bind(card.deck_id)
      .first();
    if (!deck || !deck.is_assigned) {
      throw new HttpError(
        403,
        "Bạn không có quyền ghi tiến độ cho thẻ riêng tư của người khác."
      );
    }
  }

  const now = new Date().toISOString();
  const masteryLevel = Math.round(
    clampNumber(body.masteryLevel ?? body.mastery_level ?? 0, 0, 5)
  );
  const lastReviewedAt =
    normalizeOptionalString(body.lastReviewedAt ?? body.last_reviewed_at) ||
    now;

  const [, selectedRes] = await db.batch([
    db
      .prepare(
        `INSERT INTO student_card_progress (
          user_id, card_id, deck_id, mastery_level, review_count, last_reviewed_at, updated_at
        ) VALUES (?, ?, ?, ?, 1, ?, ?)
        ON CONFLICT(user_id, card_id) DO UPDATE SET
          deck_id = excluded.deck_id,
          mastery_level = excluded.mastery_level,
          review_count = student_card_progress.review_count + 1,
          last_reviewed_at = excluded.last_reviewed_at,
          updated_at = excluded.updated_at`
      )
      .bind(auth.userId, card.id, card.deck_id, masteryLevel, lastReviewedAt, now),
    db
      .prepare(
        `SELECT ${STUDENT_PROGRESS_COLUMNS}
         FROM student_card_progress
         WHERE user_id = ? AND card_id = ?`
      )
      .bind(auth.userId, card.id),
  ]);

  const progress = selectedRes.results?.[0];
  return {
    status: 200,
    body: { ok: true, progress: formatStudentProgressRow(progress) },
  };
}

async function handleGetSkillProgress(auth, env) {
  const db = requireDb(env);

  const row = await db
    .prepare(`SELECT ${SKILL_PROGRESS_COLUMNS} FROM skill_progress WHERE user_id = ?`)
    .bind(auth.userId)
    .first();

  return {
    status: 200,
    body: { ok: true, progress: row ? formatSkillProgressRow(row) : null },
  };
}

async function handleUpsertSkillProgress(request, auth, env) {
  const db = requireDb(env);
  const body = await readJsonBody(request);

  const listening = round2(clampNumber(body.listening ?? 0, 0, 100));
  const speaking = round2(clampNumber(body.speaking ?? 0, 0, 100));
  const reading = round2(clampNumber(body.reading ?? 0, 0, 100));
  const pronunciation = round2(clampNumber(body.pronunciation ?? 0, 0, 100));
  const xp = Math.max(0, Math.round(Number(body.xp ?? 0) || 0));
  const streakDays = Math.max(
    0,
    Math.round(Number(body.streakDays ?? body.streak_days ?? 0) || 0)
  );
  const lastActiveDate = normalizeOptionalString(
    body.lastActiveDate ?? body.last_active_date
  );

  const rawTopicMastery = safeParseJsonObject(
    body.topicMastery ?? body.topic_mastery,
    {}
  );
  const cleanTopicMastery = {};
  for (const id of TOPIC_IDS) {
    if (rawTopicMastery[id] !== undefined) {
      cleanTopicMastery[id] = round2(clampNumber(rawTopicMastery[id], 0, 100));
    }
  }
  const topicMasteryJson = JSON.stringify(cleanTopicMastery);
  const now = new Date().toISOString();

  const [, selectedRes] = await db.batch([
    db
      .prepare(
        `INSERT INTO skill_progress (
          user_id, listening, speaking, reading, pronunciation,
          xp, streak_days, last_active_date, topic_mastery,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          listening = excluded.listening,
          speaking = excluded.speaking,
          reading = excluded.reading,
          pronunciation = excluded.pronunciation,
          xp = excluded.xp,
          streak_days = excluded.streak_days,
          last_active_date = excluded.last_active_date,
          topic_mastery = excluded.topic_mastery,
          updated_at = excluded.updated_at`
      )
      .bind(
        auth.userId,
        listening,
        speaking,
        reading,
        pronunciation,
        xp,
        streakDays,
        lastActiveDate,
        topicMasteryJson,
        now,
        now
      ),
    db
      .prepare(
        `SELECT ${SKILL_PROGRESS_COLUMNS} FROM skill_progress WHERE user_id = ?`
      )
      .bind(auth.userId),
  ]);

  const progress = selectedRes.results?.[0];
  return {
    status: 200,
    body: { ok: true, progress: formatSkillProgressRow(progress) },
  };
}

async function handleGetGameSessions(url, auth, env) {
  const db = requireDb(env);

  const rawLimit = Number(url.searchParams.get("limit") || 50);
  const limit = Math.max(
    1,
    Math.min(200, Math.round(Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 50))
  );
  const topicIdParam =
    url.searchParams.get("topicId") ?? url.searchParams.get("topic_id");
  const gameTypeParam =
    url.searchParams.get("gameType") ?? url.searchParams.get("game_type");

  const conditions = ["user_id = ?"];
  const bindings = [auth.userId];

  if (topicIdParam && isValidTopicId(topicIdParam)) {
    conditions.push("topic_id = ?");
    bindings.push(topicIdParam);
  }

  const cleanGameType = String(gameTypeParam || "").trim();
  if (cleanGameType) {
    conditions.push("game_type = ?");
    bindings.push(cleanGameType);
  }

  bindings.push(limit);

  const result = await db
    .prepare(
      `SELECT ${GAME_SESSION_COLUMNS}
       FROM game_sessions
       WHERE ${conditions.join(" AND ")}
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .bind(...bindings)
    .all();

  const sessions = (result.results || []).map(formatGameSessionRow);
  return { status: 200, body: { ok: true, sessions } };
}

async function handleCreateGameSession(request, auth, env) {
  const db = requireDb(env);
  const body = await readJsonBody(request);

  const gameType = String(body.gameType ?? body.game_type ?? "").trim();
  if (!gameType) {
    throw new HttpError(400, "Thiếu loại trò chơi (gameType).");
  }

  const topicCandidate = body.topicId !== undefined ? body.topicId : body.topic_id;
  const topicId = isValidTopicId(topicCandidate) ? topicCandidate : null;

  const rawSkills = safeParseJsonArray(body.skillTags ?? body.skill_tags, []);
  const skillTags = [...new Set(rawSkills.filter(isValidSkillId))];

  const score = Math.max(0, Math.round(Number(body.score ?? 0) || 0));
  const maxScore = Math.max(
    score,
    Math.round(Number(body.maxScore ?? body.max_score ?? 0) || 0)
  );
  const accuracy =
    body.accuracy !== undefined && body.accuracy !== null
      ? round2(clampNumber(body.accuracy, 0, 100))
      : maxScore > 0
        ? round2(clampNumber((score / maxScore) * 100, 0, 100))
        : 0;
  const durationSeconds = Math.max(
    0,
    Math.round(Number(body.durationSeconds ?? body.duration_seconds ?? 0) || 0)
  );
  const details = safeParseJsonObject(body.details ?? body.details_json, {});

  const now = new Date().toISOString();
  const createdAt =
    normalizeOptionalString(body.createdAt ?? body.created_at) || now;
  const sessionId = isValidUuid(body.id) ? body.id : crypto.randomUUID();

  const record = {
    id: sessionId,
    user_id: auth.userId,
    game_type: gameType,
    topic_id: topicId,
    skill_tags: JSON.stringify(skillTags),
    score,
    max_score: maxScore,
    accuracy,
    duration_seconds: durationSeconds,
    details_json: JSON.stringify(details),
    created_at: createdAt,
    updated_at: now,
  };

  await db
    .prepare(
      `INSERT INTO game_sessions (
        id, user_id, game_type, topic_id, skill_tags,
        score, max_score, accuracy, duration_seconds, details_json,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      record.id,
      record.user_id,
      record.game_type,
      record.topic_id,
      record.skill_tags,
      record.score,
      record.max_score,
      record.accuracy,
      record.duration_seconds,
      record.details_json,
      record.created_at,
      record.updated_at
    )
    .run();

  return {
    status: 201,
    body: { ok: true, session: formatGameSessionRow(record) },
  };
}

// ============================================================================
// Main Router
// ============================================================================

export async function handleRequest(request, env, _ctx) {
  const origin = request.headers.get("Origin");
  const method = request.method.toUpperCase();

  // CORS Preflight
  if (method === "OPTIONS") {
    if (origin && !isAllowedOrigin(origin, env)) {
      return jsonResponse(
        { ok: false, error: "Origin không được phép truy cập." },
        403,
        null,
        env
      );
    }
    return new Response(null, {
      status: 204,
      headers: {
        ...buildCorsHeaders(origin, env),
        "Access-Control-Allow-Methods": CORS_ALLOW_METHODS,
        "Access-Control-Allow-Headers": CORS_ALLOW_HEADERS,
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    const url = new URL(request.url);
    const pathname =
      url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;

    // Public endpoints
    if (pathname === "/api/health") {
      if (method !== "GET") {
        throw new HttpError(405, "Phương thức HTTP không được hỗ trợ.");
      }
      const res = await handleHealth(env);
      return jsonResponse(res.body, res.status, origin, env);
    }

    if (pathname === "/api/assigned-decks") {
      if (method !== "GET") {
        throw new HttpError(405, "Phương thức HTTP không được hỗ trợ.");
      }
      const res = await handleGetAssignedDecks(env);
      return jsonResponse(res.body, res.status, origin, env);
    }

    // Authenticated endpoints
    let res = null;

    if (pathname === "/api/decks") {
      const { token, apikey } = extractAuthCredentials(request, env);
      const auth = await verifySupabaseAuth(request, env);
      if (method === "GET") {
        res = await handleGetDecks(auth, env);
      } else if (method === "POST") {
        res = await handleCreateDeck(request, auth, token, apikey, env);
      } else {
        throw new HttpError(405, "Phương thức HTTP không được hỗ trợ.");
      }
      return jsonResponse(res.body, res.status, origin, env);
    }

    const deckCardsMatch = pathname.match(/^\/api\/decks\/([^/]+)\/cards$/);
    if (deckCardsMatch) {
      const deckId = decodePathParam(deckCardsMatch[1]);
      const auth = await verifySupabaseAuth(request, env);
      if (method !== "POST") {
        throw new HttpError(405, "Phương thức HTTP không được hỗ trợ.");
      }
      res = await handleAddCardsBulk(request, deckId, auth, env);
      return jsonResponse(res.body, res.status, origin, env);
    }

    const deckMatch = pathname.match(/^\/api\/decks\/([^/]+)$/);
    if (deckMatch) {
      const deckId = decodePathParam(deckMatch[1]);
      const { token, apikey } = extractAuthCredentials(request, env);
      const auth = await verifySupabaseAuth(request, env);
      if (method === "PATCH") {
        res = await handleUpdateDeck(request, deckId, auth, token, apikey, env);
      } else if (method === "DELETE") {
        res = await handleDeleteDeck(deckId, auth, env);
      } else {
        throw new HttpError(405, "Phương thức HTTP không được hỗ trợ.");
      }
      return jsonResponse(res.body, res.status, origin, env);
    }

    const cardMatch = pathname.match(/^\/api\/cards\/([^/]+)$/);
    if (cardMatch) {
      const cardId = decodePathParam(cardMatch[1]);
      const auth = await verifySupabaseAuth(request, env);
      if (method === "PATCH") {
        res = await handleUpdateCard(request, cardId, auth, env);
      } else if (method === "DELETE") {
        res = await handleDeleteCard(cardId, auth, env);
      } else {
        throw new HttpError(405, "Phương thức HTTP không được hỗ trợ.");
      }
      return jsonResponse(res.body, res.status, origin, env);
    }

    const studentProgressMatch = pathname.match(
      /^\/api\/student-progress\/([^/]+)$/
    );
    if (studentProgressMatch) {
      const cardId = decodePathParam(studentProgressMatch[1]);
      const auth = await verifySupabaseAuth(request, env);
      if (method !== "PUT") {
        throw new HttpError(405, "Phương thức HTTP không được hỗ trợ.");
      }
      res = await handleUpsertStudentProgress(request, cardId, auth, env);
      return jsonResponse(res.body, res.status, origin, env);
    }

    if (pathname === "/api/skill-progress") {
      const auth = await verifySupabaseAuth(request, env);
      if (method === "GET") {
        res = await handleGetSkillProgress(auth, env);
      } else if (method === "PUT") {
        res = await handleUpsertSkillProgress(request, auth, env);
      } else {
        throw new HttpError(405, "Phương thức HTTP không được hỗ trợ.");
      }
      return jsonResponse(res.body, res.status, origin, env);
    }

    if (pathname === "/api/game-sessions") {
      const auth = await verifySupabaseAuth(request, env);
      if (method === "GET") {
        res = await handleGetGameSessions(url, auth, env);
      } else if (method === "POST") {
        res = await handleCreateGameSession(request, auth, env);
      } else {
        throw new HttpError(405, "Phương thức HTTP không được hỗ trợ.");
      }
      return jsonResponse(res.body, res.status, origin, env);
    }

    return jsonResponse(
      { ok: false, error: "Endpoint không tồn tại." },
      404,
      origin,
      env
    );
  } catch (err) {
    if (err instanceof HttpError) {
      return jsonResponse(
        { ok: false, error: err.message },
        err.status,
        origin,
        env
      );
    }

    const msg = String(err?.message || "");
    if (msg.includes("UNIQUE constraint failed")) {
      return jsonResponse(
        { ok: false, error: "Dữ liệu bị trùng mã định danh (conflict)." },
        409,
        origin,
        env
      );
    }
    if (
      msg.includes("CHECK constraint failed") ||
      msg.includes("FOREIGN KEY constraint failed")
    ) {
      return jsonResponse(
        { ok: false, error: "Dữ liệu không hợp lệ theo ràng buộc cơ sở dữ liệu." },
        400,
        origin,
        env
      );
    }

    return jsonResponse(
      { ok: false, error: "Lỗi máy chủ Cloudflare D1 API." },
      500,
      origin,
      env
    );
  }
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  },
};
