import { getSession } from "./supabase.js";

export const DEFAULT_D1_API_URL = "https://munnn01-d1-api.munnn01.workers.dev";
const DEFAULT_TIMEOUT_MS = 8000;

function readEnv(key) {
  const fromMeta =
    typeof import.meta !== "undefined" ? import.meta.env?.[key] : undefined;
  if (fromMeta !== undefined) return fromMeta;
  return typeof process !== "undefined" ? process.env?.[key] : undefined;
}

function isTestEnvironment() {
  const mode =
    typeof import.meta !== "undefined" ? import.meta.env?.MODE : undefined;
  if (mode !== undefined && mode !== "") {
    return mode === "test";
  }
  return Boolean(
    (typeof import.meta !== "undefined" && import.meta.env?.VITEST) ||
      (typeof process !== "undefined" &&
        (process.env?.VITEST || process.env?.NODE_ENV === "test"))
  );
}

/**
 * Resolve the active Cloudflare D1 Edge API base URL.
 * - Returns `""` when `VITE_D1_API_URL` is `"off"` or `"false"`.
 * - Returns `""` under Vitest (`MODE === "test"`) unless `VITE_D1_API_URL` is explicitly set.
 * - Falls back to `DEFAULT_D1_API_URL` in development and production builds.
 * @returns {string}
 */
export function getD1ApiUrl() {
  const raw = readEnv("VITE_D1_API_URL");
  const trimmed = typeof raw === "string" ? raw.trim() : "";

  if (trimmed) {
    const lower = trimmed.toLowerCase();
    if (lower === "off" || lower === "false") {
      return "";
    }
    return trimmed.replace(/\/+$/, "");
  }

  if (isTestEnvironment()) {
    return "";
  }

  return DEFAULT_D1_API_URL;
}

/**
 * True when Cloudflare D1 API requests are enabled for the current runtime.
 * @returns {boolean}
 */
export function isD1Configured() {
  return Boolean(getD1ApiUrl());
}

function mapStatusToVietnameseMessage(status) {
  switch (status) {
    case 400:
      return "Dữ liệu gửi lên Cloudflare D1 không hợp lệ.";
    case 401:
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    case 403:
      return "Bạn không có quyền thực hiện thao tác này.";
    case 404:
      return "Không tìm thấy dữ liệu yêu cầu trên Cloudflare D1.";
    case 408:
    case 504:
      return "Kết nối Cloudflare D1 quá thời gian chờ. Vui lòng thử lại.";
    case 429:
      return "Bạn thao tác hơi nhanh. Vui lòng đợi một chút rồi thử lại.";
    default:
      if (status >= 500) {
        return "Máy chủ Cloudflare D1 đang bận. Vui lòng thử lại sau.";
      }
      return "Không thể kết nối Cloudflare D1.";
  }
}

async function parseResponseBody(response) {
  if (!response || response.status === 204) return null;

  if (typeof response.text === "function") {
    const rawText = await response.text();
    if (!rawText) return null;
    try {
      return JSON.parse(rawText);
    } catch {
      return { message: rawText };
    }
  }

  if (typeof response.json === "function") {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Execute an HTTP JSON request against the Cloudflare D1 Edge API Worker.
 * @param {string} path
 * @param {{ method?: string, body?: any, requireAuth?: boolean, timeoutMs?: number }} [options={}]
 * @returns {Promise<any>}
 */
export async function d1Request(
  path,
  { method = "GET", body, requireAuth = false, timeoutMs = DEFAULT_TIMEOUT_MS } = {}
) {
  const baseUrl = getD1ApiUrl();
  if (!baseUrl) {
    const err = new Error("Cloudflare D1 chưa được cấu hình.");
    err.status = 0;
    throw err;
  }

  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (requireAuth) {
    const { session } = await getSession();
    const accessToken = session?.access_token;
    if (!accessToken) {
      const err = new Error("Vui lòng đăng nhập để đồng bộ dữ liệu lên Cloudflare D1.");
      err.status = 401;
      throw err;
    }
    headers.Authorization = `Bearer ${accessToken}`;

    const supabaseAnonKey = String(readEnv("VITE_SUPABASE_ANON_KEY") || "").trim();
    if (supabaseAnonKey) {
      headers["X-Supabase-Key"] = supabaseAnonKey;
    }
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  const controller = new AbortController();
  const effectiveTimeout = Math.max(100, Number(timeoutMs) || DEFAULT_TIMEOUT_MS);
  const timer = setTimeout(() => controller.abort(), effectiveTimeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
      const serverMessage =
        typeof data?.error === "string" && data.error.trim()
          ? data.error.trim()
          : typeof data?.message === "string" && data.message.trim()
            ? data.message.trim()
            : "";
      const err = new Error(serverMessage || mapStatusToVietnameseMessage(response.status));
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    if (err?.name === "AbortError") {
      const timeoutErr = new Error(
        "Kết nối Cloudflare D1 quá thời gian chờ. Vui lòng thử lại."
      );
      timeoutErr.status = 408;
      timeoutErr.isTimeout = true;
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch D1 Worker health, storage usage, capacity, and table row counts.
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<{ ok: boolean, engine?: string, database?: string, region?: string, capacityBytes?: number, usedBytes?: number, counts?: Record<string, number> }>}
 */
export function d1Health(options = {}) {
  return d1Request("/api/health", {
    method: "GET",
    requireAuth: false,
    timeoutMs: options?.timeoutMs ?? 5000,
  });
}

/**
 * Publicly fetch all teacher-assigned flashcard decks with nested flashcards.
 * @returns {Promise<{ decks: Array<Record<string, any>> }>}
 */
export function d1LoadAssignedDecks() {
  return d1Request("/api/assigned-decks", {
    method: "GET",
    requireAuth: false,
  });
}

/**
 * Fetch assigned decks, personal decks, and private student card progress in one round-trip.
 * @returns {Promise<{ assignedDecks: Array<Record<string, any>>, ownDecks: Array<Record<string, any>>, studentProgress: Array<Record<string, any>> }>}
 */
export function d1LoadDecks() {
  return d1Request("/api/decks", {
    method: "GET",
    requireAuth: true,
  });
}

/**
 * Create a new deck (with optional nested cards) atomically in D1.
 * @param {Record<string, any>} payload
 * @returns {Promise<{ deck: Record<string, any> }>}
 */
export function d1CreateDeck(payload) {
  return d1Request("/api/decks", {
    method: "POST",
    body: payload,
    requireAuth: true,
  });
}

/**
 * Update metadata or assignment state of an owned deck in D1.
 * @param {string} deckId
 * @param {Record<string, any>} updates
 * @returns {Promise<{ deck: Record<string, any> }>}
 */
export function d1UpdateDeck(deckId, updates) {
  return d1Request(`/api/decks/${encodeURIComponent(deckId)}`, {
    method: "PATCH",
    body: updates,
    requireAuth: true,
  });
}

/**
 * Delete an owned deck and all dependent cards/progress rows in D1.
 * @param {string} deckId
 * @returns {Promise<{ deleted: boolean, id: string }>}
 */
export function d1DeleteDeck(deckId) {
  return d1Request(`/api/decks/${encodeURIComponent(deckId)}`, {
    method: "DELETE",
    requireAuth: true,
  });
}

/**
 * Insert one or more flashcards into an owned deck atomically in D1.
 * @param {string} deckId
 * @param {Array<Record<string, any>>} cards
 * @returns {Promise<{ cards: Array<Record<string, any>> }>}
 */
export function d1AddCardsBulk(deckId, cards) {
  return d1Request(`/api/decks/${encodeURIComponent(deckId)}/cards`, {
    method: "POST",
    body: { cards },
    requireAuth: true,
  });
}

/**
 * Update an owned flashcard in D1.
 * @param {string} cardId
 * @param {Record<string, any>} updates
 * @returns {Promise<{ card: Record<string, any> }>}
 */
export function d1UpdateCard(cardId, updates) {
  return d1Request(`/api/cards/${encodeURIComponent(cardId)}`, {
    method: "PATCH",
    body: updates,
    requireAuth: true,
  });
}

/**
 * Delete an owned flashcard in D1.
 * @param {string} cardId
 * @returns {Promise<{ deleted: boolean, id: string }>}
 */
export function d1DeleteCard(cardId) {
  return d1Request(`/api/cards/${encodeURIComponent(cardId)}`, {
    method: "DELETE",
    requireAuth: true,
  });
}

/**
 * Upsert private student mastery progress for a teacher-assigned flashcard in D1.
 * @param {string} cardId
 * @param {Record<string, any>} payload
 * @returns {Promise<{ progress: Record<string, any> }>}
 */
export function d1SaveStudentProgress(cardId, payload) {
  return d1Request(`/api/student-progress/${encodeURIComponent(cardId)}`, {
    method: "PUT",
    body: payload,
    requireAuth: true,
  });
}

/**
 * Load the signed-in learner's 4-skill progress row from D1.
 * @returns {Promise<{ progress: Record<string, any> | null }>}
 */
export function d1LoadSkillProgress() {
  return d1Request("/api/skill-progress", {
    method: "GET",
    requireAuth: true,
  });
}

/**
 * Upsert the signed-in learner's 4-skill progress row in D1.
 * @param {Record<string, any>} payload
 * @returns {Promise<{ progress: Record<string, any> }>}
 */
export function d1SaveSkillProgress(payload) {
  return d1Request("/api/skill-progress", {
    method: "PUT",
    body: payload,
    requireAuth: true,
  });
}

/**
 * Load recent game/practice sessions from D1 with optional filters.
 * @param {{ limit?: number, topicId?: string, gameType?: string }} [options={}]
 * @returns {Promise<{ sessions: Array<Record<string, any>> }>}
 */
export function d1LoadGameHistory(options = {}) {
  const params = new URLSearchParams();
  if (options?.limit !== undefined && options?.limit !== null) {
    params.set("limit", String(options.limit));
  }
  if (options?.topicId) {
    params.set("topicId", String(options.topicId));
  }
  if (options?.gameType) {
    params.set("gameType", String(options.gameType));
  }
  const qs = params.toString();
  return d1Request(`/api/game-sessions${qs ? `?${qs}` : ""}`, {
    method: "GET",
    requireAuth: true,
  });
}

/**
 * Record a completed game/practice session in D1.
 * @param {Record<string, any>} payload
 * @returns {Promise<{ session: Record<string, any> }>}
 */
export function d1SaveGameSession(payload) {
  return d1Request("/api/game-sessions", {
    method: "POST",
    body: payload,
    requireAuth: true,
  });
}
