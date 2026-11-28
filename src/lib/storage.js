import {
  SKILL_IDS,
  TOPIC_IDS,
  clampNumber,
  createEmptySkillProgress,
  generateId,
  isValidSkillId,
  isValidTopicId,
  normalizeDeck,
  normalizeFlashcard,
  normalizeGameResult,
} from "./contracts.js";
import { getCurrentUser, isSupabaseConfigured, supabase } from "./supabase.js";

const STORAGE_KEYS = Object.freeze({
  DECKS: "vietflow_v1_decks",
  PROGRESS: "vietflow_v1_skill_progress",
  SESSIONS: "vietflow_v1_game_sessions",
  PREFERENCES: "vietflow_v1_preferences",
  ASSIGNED_MASTERY: "vietflow_v1_assigned_mastery",
});

const DECK_SELECT_BASE =
  "id,user_id,title,description,topic_id,color,is_default,is_assigned,teacher_name,assigned_at,created_at,updated_at";
const DECK_SELECT_BASE_LEGACY =
  "id,user_id,title,description,topic_id,color,is_default,created_at,updated_at";
const FLASHCARD_SELECT_FIELDS =
  "id,deck_id,front_vi,pos,ipa,definition,example_vi,example_en,notes,topic_id,mastery_level,review_count,last_reviewed_at,position,created_at,updated_at";
const DECK_SELECT_WITH_CARDS = `${DECK_SELECT_BASE},flashcards(${FLASHCARD_SELECT_FIELDS})`;
const DECK_SELECT_WITH_CARDS_LEGACY = `${DECK_SELECT_BASE_LEGACY},flashcards(${FLASHCARD_SELECT_FIELDS})`;

const memoryFallback = new Map();
const inFlightCloudSeedByUser = new Map();
const assignedCardsById = new Map();
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isMissingAssignedColumnError(err) {
  const msg = String(err?.message || "").toLowerCase();
  return (
    msg.includes("is_assigned") ||
    msg.includes("teacher_name") ||
    msg.includes("assigned_at")
  );
}

function readLocalAssignedMastery() {
  const saved = readLocalJson(STORAGE_KEYS.ASSIGNED_MASTERY, {});
  return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
}

function writeLocalAssignedMastery(map) {
  writeLocalJson(STORAGE_KEYS.ASSIGNED_MASTERY, map);
}

function mergeAssignedAndOwnDecks(assignedDecks, ownDecks) {
  const merged = [];
  const seenIds = new Set();
  for (const deck of assignedDecks || []) {
    if (!deck?.id || seenIds.has(deck.id)) continue;
    seenIds.add(deck.id);
    merged.push(deck);
  }
  for (const deck of ownDecks || []) {
    if (!deck?.id || seenIds.has(deck.id)) continue;
    seenIds.add(deck.id);
    merged.push(deck);
  }
  return merged;
}

function isValidUuid(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function normalizeMatchKey(value) {
  return String(value || "").normalize("NFC").trim().toLowerCase();
}

/**
 * Return a shallow clone of a deck and its cards without `id` / `deckId`
 * so Supabase inserts always mint fresh globally unique UUIDs per user.
 * @param {Record<string, any>} deck
 * @returns {Record<string, any>}
 */
function cloneDeckWithFreshIds(deck) {
  const { id: _deckId, cards: rawCards, flashcards: rawFlashcards, ...deckRest } = deck || {};
  const sourceCards = Array.isArray(rawCards)
    ? rawCards
    : Array.isArray(rawFlashcards)
      ? rawFlashcards
      : [];
  const cards = sourceCards.map((card) => {
    const { id: _cardId, deckId: _d1, deck_id: _d2, ...cardRest } = card || {};
    return cardRest;
  });
  return { ...deckRest, cards };
}

function readLocalJson(key, fallback) {
  try {
    const raw =
      typeof globalThis.localStorage !== "undefined"
        ? globalThis.localStorage.getItem(key)
        : memoryFallback.get(key) ?? null;
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  const serialized = JSON.stringify(value);
  try {
    if (typeof globalThis.localStorage !== "undefined") {
      globalThis.localStorage.setItem(key, serialized);
      return;
    }
  } catch (err) {
    console.warn("localStorage write failed, using memory fallback:", err);
  }
  memoryFallback.set(key, serialized);
}

function removeLocalKey(key) {
  try {
    if (typeof globalThis.localStorage !== "undefined") {
      globalThis.localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
  memoryFallback.delete(key);
}

/**
 * Get YYYY-MM-DD for a Date in local timezone.
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
function toLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Compute updated streak days given previous lastActiveDate and today.
 * @param {string | null} lastActiveDate
 * @param {number} currentStreak
 * @param {string} todayKey
 * @returns {number}
 */
function computeNextStreak(lastActiveDate, currentStreak, todayKey) {
  if (!lastActiveDate) return Math.max(1, currentStreak || 1);
  if (lastActiveDate === todayKey) return Math.max(1, currentStreak || 1);

  const prev = new Date(`${lastActiveDate}T00:00:00`);
  const today = new Date(`${todayKey}T00:00:00`);
  const diffDays = Math.round((today.getTime() - prev.getTime()) / 86400000);
  if (diffDays === 1) return (currentStreak || 0) + 1;
  return 1;
}

/**
 * Resolve active authenticated user if Supabase is configured & user signed in.
 * @returns {Promise<import("@supabase/supabase-js").User | null>}
 */
async function getCloudUser() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

/**
 * Return the currently active persistence mode ("supabase" when configured + logged in, else "local").
 * @returns {Promise<"supabase" | "local">}
 */
export async function getStorageMode() {
  const user = await getCloudUser();
  return user ? "supabase" : "local";
}

// ============================================================================
// Decks & Flashcards
// ============================================================================

function getLocalDecksRaw() {
  const saved = readLocalJson(STORAGE_KEYS.DECKS, null);
  if (!Array.isArray(saved)) return null;
  return saved.map(normalizeDeck);
}

function saveLocalDecks(decks) {
  const normalized = decks.map(normalizeDeck);
  writeLocalJson(STORAGE_KEYS.DECKS, normalized);
  return normalized;
}

function toDbFlashcardRow(card, deckId, userId, position) {
  return {
    id: card.id,
    deck_id: deckId,
    user_id: userId,
    front_vi: card.frontVi,
    pos: card.pos,
    ipa: card.ipa,
    definition: card.definition,
    example_vi: card.exampleVi,
    example_en: card.exampleEn,
    notes: card.notes,
    topic_id: card.topicId,
    mastery_level: card.masteryLevel,
    review_count: card.reviewCount,
    last_reviewed_at: card.lastReviewedAt,
    position: position ?? card.position ?? 0,
  };
}

/**
 * Load all teacher-assigned decks from Supabase (publicly readable by students & guests)
 * and overlay the current learner's private mastery progress on each card.
 * Gracefully returns `[]` when unconfigured, offline, or before migration 003 runs.
 * @param {string | null} [currentUserId=null]
 * @returns {Promise<import("./contracts.js").Deck[]>}
 */
export async function loadAssignedDecksFromCloud(currentUserId = null) {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data: deckRows, error } = await supabase
      .from("flashcard_decks")
      .select("*, flashcards(*)")
      .eq("is_assigned", true)
      .order("assigned_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!Array.isArray(deckRows) || deckRows.length === 0) return [];

    const progressByCardId = new Map();
    if (currentUserId) {
      try {
        const { data: progressRows, error: progressError } = await supabase
          .from("student_card_progress")
          .select("card_id,deck_id,mastery_level,review_count,last_reviewed_at")
          .eq("user_id", currentUserId);

        if (!progressError && Array.isArray(progressRows)) {
          for (const row of progressRows) {
            progressByCardId.set(String(row.card_id), {
              masteryLevel: Math.round(clampNumber(row.mastery_level ?? 0, 0, 5)),
              reviewCount: Math.max(0, Math.round(Number(row.review_count ?? 0) || 0)),
              lastReviewedAt: row.last_reviewed_at ?? null,
            });
          }
        }
      } catch (err) {
        console.warn("Could not load student_card_progress:", err?.message);
      }
    } else {
      const localMap = readLocalAssignedMastery();
      for (const [cardId, entry] of Object.entries(localMap)) {
        if (entry && typeof entry === "object") {
          progressByCardId.set(String(cardId), {
            masteryLevel: Math.round(clampNumber(entry.masteryLevel ?? 0, 0, 5)),
            reviewCount: Math.max(0, Math.round(Number(entry.reviewCount ?? 0) || 0)),
            lastReviewedAt: entry.lastReviewedAt ?? null,
          });
        }
      }
    }

    return deckRows.map((row) => {
      const canEdit = Boolean(currentUserId && row.user_id === currentUserId);
      const rawCards = Array.isArray(row.flashcards) ? row.flashcards : [];
      const overlaidCards = rawCards.map((card) => {
        const cardId = String(card.id);
        const studentProgress = progressByCardId.get(cardId);
        if (studentProgress) {
          return {
            ...card,
            mastery_level: studentProgress.masteryLevel,
            review_count: studentProgress.reviewCount,
            last_reviewed_at: studentProgress.lastReviewedAt,
          };
        }
        if (!canEdit) {
          return {
            ...card,
            mastery_level: 0,
            review_count: 0,
            last_reviewed_at: null,
          };
        }
        return card;
      });

      const normalized = normalizeDeck({
        ...row,
        isAssigned: true,
        is_assigned: true,
        teacherName: String(row.teacher_name || "").trim() || "Giáo viên",
        ownerId: row.user_id ?? null,
        canEdit,
        flashcards: overlaidCards,
      });

      for (const card of normalized.cards) {
        assignedCardsById.set(card.id, {
          deckId: normalized.id,
          canEdit,
          card,
        });
      }

      return normalized;
    });
  } catch (err) {
    console.warn("Could not load assigned decks from cloud:", err?.message);
    return [];
  }
}

/**
 * Load all flashcard decks (with their nested flashcards).
 * Merges teacher-assigned cloud decks at the top (deduplicated by ID), even in guest mode
 * when Supabase is configured. If personal storage is empty and `seedDecks` is provided,
 * seeds those starter decks once.
 * @param {Array<Partial<import("./contracts.js").Deck>>} [seedDecks=[]]
 * @returns {Promise<import("./contracts.js").Deck[]>}
 */
export async function loadDecks(seedDecks = []) {
  const user = await getCloudUser();
  const assignedDecks = await loadAssignedDecksFromCloud(user?.id || null);

  if (user && supabase) {
    try {
      let { data, error } = await supabase
        .from("flashcard_decks")
        .select(DECK_SELECT_WITH_CARDS)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error && isMissingAssignedColumnError(error)) {
        const legacyRes = await supabase
          .from("flashcard_decks")
          .select(DECK_SELECT_WITH_CARDS_LEGACY)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        data = legacyRes.data;
        error = legacyRes.error;
      }

      if (error) throw error;

      let ownDecks = (data || []).map((row) =>
        normalizeDeck({ ...row, ownerId: row.user_id ?? user.id, canEdit: true })
      );

      if (ownDecks.length === 0 && Array.isArray(seedDecks) && seedDecks.length > 0) {
        if (!inFlightCloudSeedByUser.has(user.id)) {
          const seedPromise = (async () => {
            const seeded = [];
            for (const seed of seedDecks) {
              seeded.push(await createDeck(cloneDeckWithFreshIds(seed)));
            }
            return seeded;
          })().finally(() => {
            inFlightCloudSeedByUser.delete(user.id);
          });
          inFlightCloudSeedByUser.set(user.id, seedPromise);
        }
        ownDecks = await inFlightCloudSeedByUser.get(user.id);
      }

      return mergeAssignedAndOwnDecks(assignedDecks, ownDecks);
    } catch (err) {
      console.warn("Falling back to local decks after Supabase error:", err?.message);
    }
  }

  let localDecks = getLocalDecksRaw();
  if (localDecks === null) {
    if (Array.isArray(seedDecks) && seedDecks.length > 0) {
      localDecks = saveLocalDecks(seedDecks.map(normalizeDeck));
    } else {
      localDecks = [];
    }
  }

  return mergeAssignedAndOwnDecks(assignedDecks, localDecks);
}

/**
 * Create a new flashcard deck, optionally with initial cards and teacher assignment metadata.
 * @param {{ title: string, description?: string, topicId?: import("./contracts.js").TopicId | null, color?: string, isDefault?: boolean, isAssigned?: boolean, teacherName?: string, assignedAt?: string | null, cards?: Array<Record<string, any>> }} input
 * @returns {Promise<import("./contracts.js").Deck>}
 */
export async function createDeck(input) {
  const title = String(input?.title || "").trim();
  if (!title) throw new Error("Tên bộ thẻ không được để trống.");

  const isAssigned = Boolean(input?.isAssigned ?? input?.is_assigned ?? false);
  const teacherName = String(input?.teacherName ?? input?.teacher_name ?? "").trim();
  const assignedAt = isAssigned
    ? (input?.assignedAt ?? input?.assigned_at ?? new Date().toISOString())
    : null;

  const requestedId = isValidUuid(input?.id) ? input.id : generateId();
  const deck = normalizeDeck({
    ...input,
    id: requestedId,
    title,
    isAssigned,
    teacherName,
    assignedAt,
    canEdit: true,
  });

  const user = await getCloudUser();
  if (user && supabase) {
    const baseInsert = {
      id: deck.id,
      user_id: user.id,
      title: deck.title,
      description: deck.description,
      topic_id: deck.topicId,
      color: deck.color,
      is_default: deck.isDefault,
    };

    let { data: deckRow, error: deckError } = await supabase
      .from("flashcard_decks")
      .insert({
        ...baseInsert,
        is_assigned: deck.isAssigned,
        teacher_name: deck.teacherName,
        assigned_at: deck.assignedAt,
      })
      .select(DECK_SELECT_BASE)
      .single();

    if (deckError && isMissingAssignedColumnError(deckError) && !deck.isAssigned) {
      const legacyRes = await supabase
        .from("flashcard_decks")
        .insert(baseInsert)
        .select(DECK_SELECT_BASE_LEGACY)
        .single();
      deckRow = legacyRes.data;
      deckError = legacyRes.error;
    }

    if (deckError) throw deckError;

    let savedCards = [];
    if (deck.cards.length > 0) {
      const rows = deck.cards.map((card, idx) =>
        toDbFlashcardRow(
          { ...card, id: isValidUuid(card.id) ? card.id : generateId() },
          deckRow.id,
          user.id,
          idx
        )
      );
      const { data: cardRows, error: cardsError } = await supabase
        .from("flashcards")
        .insert(rows)
        .select(FLASHCARD_SELECT_FIELDS);
      if (cardsError) {
        await supabase.from("flashcard_decks").delete().eq("id", deckRow.id);
        throw cardsError;
      }
      savedCards = cardRows || [];
    }

    return normalizeDeck({
      ...deckRow,
      ownerId: deckRow.user_id ?? user.id,
      canEdit: true,
      flashcards: savedCards,
    });
  }

  const current = getLocalDecksRaw() || [];
  const next = [deck, ...current];
  saveLocalDecks(next);
  return deck;
}

/**
 * Update metadata (including teacher assignment state) of an existing deck.
 * @param {string} deckId
 * @param {{ title?: string, description?: string, topicId?: import("./contracts.js").TopicId | null, color?: string, isAssigned?: boolean, teacherName?: string, assignedAt?: string | null }} updates
 * @returns {Promise<import("./contracts.js").Deck>}
 */
export async function updateDeck(deckId, updates = {}) {
  const topicInput = updates.topicId !== undefined ? updates.topicId : updates.topic_id;
  const isAssignedInput =
    updates.isAssigned !== undefined ? updates.isAssigned : updates.is_assigned;
  const teacherNameInput =
    updates.teacherName !== undefined ? updates.teacherName : updates.teacher_name;
  const assignedAtInput =
    updates.assignedAt !== undefined ? updates.assignedAt : updates.assigned_at;

  const user = await getCloudUser();
  if (user && supabase) {
    const payload = {};
    if (updates.title !== undefined) payload.title = String(updates.title).trim();
    if (updates.description !== undefined) payload.description = String(updates.description).trim();
    if (topicInput !== undefined) {
      payload.topic_id = isValidTopicId(topicInput) ? topicInput : null;
    }
    if (updates.color !== undefined) payload.color = String(updates.color);
    if (isAssignedInput !== undefined) {
      const nextAssigned = Boolean(isAssignedInput);
      payload.is_assigned = nextAssigned;
      payload.assigned_at = nextAssigned
        ? (assignedAtInput ?? new Date().toISOString())
        : null;
    } else if (assignedAtInput !== undefined) {
      payload.assigned_at = assignedAtInput;
    }
    if (teacherNameInput !== undefined) {
      payload.teacher_name = String(teacherNameInput || "").trim();
    }

    let { data, error } = await supabase
      .from("flashcard_decks")
      .update(payload)
      .eq("id", deckId)
      .eq("user_id", user.id)
      .select(DECK_SELECT_WITH_CARDS)
      .single();

    if (
      error &&
      isMissingAssignedColumnError(error) &&
      isAssignedInput === undefined &&
      teacherNameInput === undefined
    ) {
      const legacyRes = await supabase
        .from("flashcard_decks")
        .update(payload)
        .eq("id", deckId)
        .eq("user_id", user.id)
        .select(DECK_SELECT_WITH_CARDS_LEGACY)
        .single();
      data = legacyRes.data;
      error = legacyRes.error;
    }

    if (error) throw error;
    return normalizeDeck({ ...data, ownerId: data?.user_id ?? user.id, canEdit: true });
  }

  const current = getLocalDecksRaw() || [];
  const index = current.findIndex((d) => d.id === deckId);
  if (index === -1) throw new Error("Không tìm thấy bộ thẻ.");

  const merged = { ...current[index], ...updates };
  if (topicInput !== undefined) merged.topicId = topicInput;
  if (isAssignedInput !== undefined) {
    const nextAssigned = Boolean(isAssignedInput);
    merged.isAssigned = nextAssigned;
    merged.assignedAt = nextAssigned
      ? (assignedAtInput ?? current[index].assignedAt ?? new Date().toISOString())
      : null;
  } else if (assignedAtInput !== undefined) {
    merged.assignedAt = assignedAtInput;
  }
  if (teacherNameInput !== undefined) {
    merged.teacherName = String(teacherNameInput || "").trim();
  }

  const updated = normalizeDeck({
    ...merged,
    id: deckId,
    updatedAt: new Date().toISOString(),
  });
  current[index] = updated;
  saveLocalDecks(current);
  return updated;
}

/**
 * Delete a deck and all of its flashcards.
 * @param {string} deckId
 * @returns {Promise<void>}
 */
export async function deleteDeck(deckId) {
  const user = await getCloudUser();
  if (user && supabase) {
    const { error } = await supabase
      .from("flashcard_decks")
      .delete()
      .eq("id", deckId)
      .eq("user_id", user.id);
    if (error) throw error;
    return;
  }

  const current = getLocalDecksRaw() || [];
  saveLocalDecks(current.filter((d) => d.id !== deckId));
}

/**
 * Add a single flashcard to a deck.
 * @param {string} deckId
 * @param {Record<string, any>} cardInput
 * @returns {Promise<import("./contracts.js").Flashcard>}
 */
export async function addFlashcard(deckId, cardInput) {
  const added = await addFlashcardsBulk(deckId, [cardInput]);
  return added[0];
}

/**
 * Add one or more flashcards to a deck in bulk.
 * @param {string} deckId
 * @param {Array<Record<string, any>>} cardsInput
 * @returns {Promise<import("./contracts.js").Flashcard[]>}
 */
export async function addFlashcardsBulk(deckId, cardsInput = []) {
  if (!Array.isArray(cardsInput) || cardsInput.length === 0) return [];

  const prepared = cardsInput
    .map((item, idx) =>
      normalizeFlashcard(
        { ...item, id: isValidUuid(item?.id) ? item.id : generateId(), position: idx },
        deckId
      )
    )
    .filter((c) => c.frontVi && c.definition);

  if (prepared.length === 0) {
    throw new Error("Cần ít nhất từ vựng tiếng Việt và định nghĩa để tạo flashcard.");
  }

  const user = await getCloudUser();
  if (user && supabase) {
    const { count } = await supabase
      .from("flashcards")
      .select("id", { count: "exact", head: true })
      .eq("deck_id", deckId)
      .eq("user_id", user.id);

    const startPos = Number(count || 0);
    const rows = prepared.map((card, idx) =>
      toDbFlashcardRow(card, deckId, user.id, startPos + idx)
    );

    const { data, error } = await supabase
      .from("flashcards")
      .insert(rows)
      .select(
        "id,deck_id,front_vi,pos,ipa,definition,example_vi,example_en,notes,topic_id,mastery_level,review_count,last_reviewed_at,position,created_at,updated_at"
      );

    if (error) throw error;
    return (data || []).map((row) => normalizeFlashcard(row, deckId));
  }

  const current = getLocalDecksRaw() || [];
  const index = current.findIndex((d) => d.id === deckId);
  if (index === -1) throw new Error("Không tìm thấy bộ thẻ.");

  const deck = current[index];
  const startPos = deck.cards.length;
  const positioned = prepared.map((card, idx) => ({
    ...card,
    deckId,
    topicId: card.topicId ?? deck.topicId,
    position: startPos + idx,
  }));

  current[index] = normalizeDeck({
    ...deck,
    cards: [...deck.cards, ...positioned],
    updatedAt: new Date().toISOString(),
  });
  saveLocalDecks(current);
  return positioned;
}

/**
 * Update an existing flashcard by ID.
 * @param {string} cardId
 * @param {Partial<import("./contracts.js").Flashcard>} updates
 * @returns {Promise<import("./contracts.js").Flashcard>}
 */
export async function updateFlashcard(cardId, updates = {}) {
  const frontVi = updates.frontVi !== undefined ? updates.frontVi : updates.front_vi;
  const exampleVi = updates.exampleVi !== undefined ? updates.exampleVi : updates.example_vi;
  const exampleEn = updates.exampleEn !== undefined ? updates.exampleEn : updates.example_en;
  const topicId = updates.topicId !== undefined ? updates.topicId : updates.topic_id;
  const masteryLevel =
    updates.masteryLevel !== undefined ? updates.masteryLevel : updates.mastery_level;
  const reviewCount =
    updates.reviewCount !== undefined ? updates.reviewCount : updates.review_count;
  const lastReviewedAt =
    updates.lastReviewedAt !== undefined ? updates.lastReviewedAt : updates.last_reviewed_at;

  const normalizedUpdates = { ...updates };
  if (frontVi !== undefined) normalizedUpdates.frontVi = frontVi;
  if (exampleVi !== undefined) normalizedUpdates.exampleVi = exampleVi;
  if (exampleEn !== undefined) normalizedUpdates.exampleEn = exampleEn;
  if (topicId !== undefined) normalizedUpdates.topicId = topicId;
  if (masteryLevel !== undefined) normalizedUpdates.masteryLevel = masteryLevel;
  if (reviewCount !== undefined) normalizedUpdates.reviewCount = reviewCount;
  if (lastReviewedAt !== undefined) normalizedUpdates.lastReviewedAt = lastReviewedAt;

  const user = await getCloudUser();
  if (user && supabase) {
    const payload = {};
    if (frontVi !== undefined) payload.front_vi = String(frontVi).trim();
    if (updates.pos !== undefined) payload.pos = String(updates.pos).trim();
    if (updates.ipa !== undefined) payload.ipa = String(updates.ipa).trim();
    if (updates.definition !== undefined) payload.definition = String(updates.definition).trim();
    if (exampleVi !== undefined) payload.example_vi = String(exampleVi).trim();
    if (exampleEn !== undefined) payload.example_en = String(exampleEn).trim();
    if (updates.notes !== undefined) payload.notes = String(updates.notes).trim();
    if (topicId !== undefined) {
      payload.topic_id = isValidTopicId(topicId) ? topicId : null;
    }
    if (masteryLevel !== undefined) {
      payload.mastery_level = Math.round(clampNumber(masteryLevel, 0, 5));
    }
    if (reviewCount !== undefined) {
      payload.review_count = Math.max(0, Math.round(Number(reviewCount) || 0));
    }
    if (lastReviewedAt !== undefined) {
      payload.last_reviewed_at = lastReviewedAt;
    }
    if (updates.position !== undefined) {
      payload.position = Math.max(0, Math.round(Number(updates.position) || 0));
    }

    const { data, error } = await supabase
      .from("flashcards")
      .update(payload)
      .eq("id", cardId)
      .eq("user_id", user.id)
      .select(
        "id,deck_id,front_vi,pos,ipa,definition,example_vi,example_en,notes,topic_id,mastery_level,review_count,last_reviewed_at,position,created_at,updated_at"
      )
      .single();

    if (error) throw error;
    return normalizeFlashcard(data);
  }

  const current = getLocalDecksRaw() || [];
  let updatedCard = null;
  const now = new Date().toISOString();

  const nextDecks = current.map((deck) => {
    const idx = deck.cards.findIndex((c) => c.id === cardId);
    if (idx === -1) return deck;
    updatedCard = normalizeFlashcard(
      { ...deck.cards[idx], ...normalizedUpdates, id: cardId, deckId: deck.id, updatedAt: now },
      deck.id
    );
    const nextCards = [...deck.cards];
    nextCards[idx] = updatedCard;
    return normalizeDeck({ ...deck, cards: nextCards, updatedAt: now });
  });

  if (!updatedCard) throw new Error("Không tìm thấy flashcard.");
  saveLocalDecks(nextDecks);
  return updatedCard;
}

/**
 * Delete a flashcard by ID.
 * @param {string} cardId
 * @returns {Promise<void>}
 */
export async function deleteFlashcard(cardId) {
  const user = await getCloudUser();
  if (user && supabase) {
    const { error } = await supabase
      .from("flashcards")
      .delete()
      .eq("id", cardId)
      .eq("user_id", user.id);
    if (error) throw error;
    return;
  }

  const current = getLocalDecksRaw() || [];
  const nextDecks = current.map((deck) => ({
    ...deck,
    cards: deck.cards.filter((c) => c.id !== cardId),
    updatedAt: new Date().toISOString(),
  }));
  saveLocalDecks(nextDecks);
}

async function saveAssignedCardMastery(cardId, masteryLevel, now, deckIdHint, user) {
  const cached = assignedCardsById.get(cardId);
  let resolvedDeckId = deckIdHint || cached?.deckId || "";

  if (user && supabase) {
    if (!resolvedDeckId) {
      const { data: cardRow } = await supabase
        .from("flashcards")
        .select("deck_id")
        .eq("id", cardId)
        .maybeSingle();
      resolvedDeckId = cardRow?.deck_id || "";
    }

    const { data: existingProgress } = await supabase
      .from("student_card_progress")
      .select("review_count")
      .eq("user_id", user.id)
      .eq("card_id", cardId)
      .maybeSingle();

    const nextReviewCount = Number(existingProgress?.review_count || 0) + 1;
    const { data, error } = await supabase
      .from("student_card_progress")
      .upsert(
        {
          user_id: user.id,
          card_id: cardId,
          deck_id: resolvedDeckId,
          mastery_level: masteryLevel,
          review_count: nextReviewCount,
          last_reviewed_at: now,
        },
        { onConflict: "user_id,card_id" }
      )
      .select("user_id,card_id,deck_id,mastery_level,review_count,last_reviewed_at,updated_at")
      .single();

    if (error) throw error;

    const mergedCard = cached?.card
      ? {
          ...cached.card,
          masteryLevel,
          reviewCount: nextReviewCount,
          lastReviewedAt: now,
          updatedAt: data?.updated_at || now,
        }
      : {
          id: cardId,
          deckId: data?.deck_id || resolvedDeckId,
          masteryLevel,
          reviewCount: nextReviewCount,
          lastReviewedAt: now,
          updatedAt: data?.updated_at || now,
        };

    if (cached) {
      assignedCardsById.set(cardId, { ...cached, deckId: mergedCard.deckId, card: mergedCard });
    }
    return mergedCard;
  }

  const localMap = readLocalAssignedMastery();
  const prev = localMap[cardId];
  const nextReviewCount = Number(prev?.reviewCount || 0) + 1;
  const nextEntry = {
    deckId: resolvedDeckId || prev?.deckId || "",
    masteryLevel,
    reviewCount: nextReviewCount,
    lastReviewedAt: now,
  };
  writeLocalAssignedMastery({ ...localMap, [cardId]: nextEntry });

  const mergedCard = cached?.card
    ? {
        ...cached.card,
        masteryLevel,
        reviewCount: nextReviewCount,
        lastReviewedAt: now,
        updatedAt: now,
      }
    : {
        id: cardId,
        deckId: nextEntry.deckId,
        masteryLevel,
        reviewCount: nextReviewCount,
        lastReviewedAt: now,
        updatedAt: now,
      };

  if (cached) {
    assignedCardsById.set(cardId, { ...cached, deckId: mergedCard.deckId, card: mergedCard });
  }
  return mergedCard;
}

/**
 * Update a flashcard's mastery level (0..5), increment reviewCount, and timestamp lastReviewedAt.
 * For teacher-assigned decks owned by another user, persists private progress to
 * `student_card_progress` (signed-in) or localStorage `vietflow_v1_assigned_mastery` (guest)
 * without ever attempting to UPDATE the teacher's `flashcards` row.
 * @param {string} cardId
 * @param {number} masteryLevel
 * @param {{ deckId?: string, isAssignedDeck?: boolean }} [options={}]
 * @returns {Promise<import("./contracts.js").Flashcard>}
 */
export async function setFlashcardMastery(cardId, masteryLevel, options = {}) {
  const clamped = Math.round(clampNumber(masteryLevel, 0, 5));
  const now = new Date().toISOString();
  const user = await getCloudUser();

  const cached = assignedCardsById.get(cardId);
  const explicitAssigned = options?.isAssignedDeck === true;
  const cachedNonOwnedAssigned =
    options?.isAssignedDeck !== false && Boolean(cached && cached.canEdit === false);

  if (explicitAssigned || cachedNonOwnedAssigned) {
    return saveAssignedCardMastery(
      cardId,
      clamped,
      now,
      options?.deckId || cached?.deckId || "",
      user
    );
  }

  if (user && supabase) {
    const { data: existing } = await supabase
      .from("flashcards")
      .select("id,deck_id,user_id,review_count")
      .eq("id", cardId)
      .maybeSingle();

    if (existing && existing.user_id && existing.user_id !== user.id) {
      return saveAssignedCardMastery(
        cardId,
        clamped,
        now,
        options?.deckId || existing.deck_id || "",
        user
      );
    }

    return updateFlashcard(cardId, {
      masteryLevel: clamped,
      reviewCount: Number(existing?.review_count || 0) + 1,
      lastReviewedAt: now,
    });
  }

  const current = getLocalDecksRaw() || [];
  let prevReviewCount = 0;
  let foundDeck = null;
  for (const deck of current) {
    const found = deck.cards.find((c) => c.id === cardId);
    if (found) {
      prevReviewCount = found.reviewCount || 0;
      foundDeck = deck;
      break;
    }
  }

  if (!foundDeck || (foundDeck.isAssigned && foundDeck.canEdit === false)) {
    return saveAssignedCardMastery(
      cardId,
      clamped,
      now,
      options?.deckId || foundDeck?.id || cached?.deckId || "",
      null
    );
  }

  return updateFlashcard(cardId, {
    masteryLevel: clamped,
    reviewCount: prevReviewCount + 1,
    lastReviewedAt: now,
  });
}

// ============================================================================
// Skill Progress (Listening, Speaking, Reading, Pronunciation, XP, Streak)
// ============================================================================

function normalizeSkillProgress(raw = {}) {
  const base = createEmptySkillProgress();
  const topicMastery = { ...base.topicMastery };
  const rawTopicMastery = raw.topicMastery ?? raw.topic_mastery ?? {};
  if (rawTopicMastery && typeof rawTopicMastery === "object") {
    for (const id of TOPIC_IDS) {
      if (rawTopicMastery[id] !== undefined) {
        topicMastery[id] = Number(clampNumber(rawTopicMastery[id], 0, 100).toFixed(2));
      }
    }
  }

  return {
    listening: Number(clampNumber(raw.listening ?? 0, 0, 100).toFixed(2)),
    speaking: Number(clampNumber(raw.speaking ?? 0, 0, 100).toFixed(2)),
    reading: Number(clampNumber(raw.reading ?? 0, 0, 100).toFixed(2)),
    pronunciation: Number(clampNumber(raw.pronunciation ?? 0, 0, 100).toFixed(2)),
    xp: Math.max(0, Math.round(Number(raw.xp ?? 0) || 0)),
    streakDays: Math.max(0, Math.round(Number(raw.streakDays ?? raw.streak_days ?? 0) || 0)),
    lastActiveDate: raw.lastActiveDate ?? raw.last_active_date ?? null,
    topicMastery,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? new Date().toISOString(),
  };
}

/**
 * Load the learner's 4-skill progress, XP, streak, and per-topic mastery.
 * @returns {Promise<import("./contracts.js").SkillProgress>}
 */
export async function loadSkillProgress() {
  const user = await getCloudUser();
  if (user && supabase) {
    try {
      const { data, error } = await supabase
        .from("skill_progress")
        .select(
          "listening,speaking,reading,pronunciation,xp,streak_days,last_active_date,topic_mastery,updated_at"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) return normalizeSkillProgress(data);
    } catch (err) {
      console.warn("Falling back to local skill progress:", err?.message);
    }
  }

  const local = readLocalJson(STORAGE_KEYS.PROGRESS, null);
  return local ? normalizeSkillProgress(local) : createEmptySkillProgress();
}

/**
 * Save a full SkillProgress snapshot to Supabase (if logged in) and localStorage.
 * @param {Partial<import("./contracts.js").SkillProgress>} progress
 * @returns {Promise<import("./contracts.js").SkillProgress>}
 */
export async function saveSkillProgress(progress) {
  const normalized = normalizeSkillProgress({
    ...progress,
    updatedAt: new Date().toISOString(),
  });

  writeLocalJson(STORAGE_KEYS.PROGRESS, normalized);

  const user = await getCloudUser();
  if (user && supabase) {
    const { data, error } = await supabase
      .from("skill_progress")
      .upsert(
        {
          user_id: user.id,
          listening: normalized.listening,
          speaking: normalized.speaking,
          reading: normalized.reading,
          pronunciation: normalized.pronunciation,
          xp: normalized.xp,
          streak_days: normalized.streakDays,
          last_active_date: normalized.lastActiveDate,
          topic_mastery: normalized.topicMastery,
        },
        { onConflict: "user_id" }
      )
      .select(
        "listening,speaking,reading,pronunciation,xp,streak_days,last_active_date,topic_mastery,updated_at"
      )
      .single();

    if (error) throw error;
    return normalizeSkillProgress(data);
  }

  return normalized;
}

/**
 * Apply a completed activity's skill gain, XP, topic mastery, and daily streak update.
 * @param {{ skillTags?: import("./contracts.js").SkillId[], accuracy?: number, topicId?: import("./contracts.js").TopicId | null, xpDelta?: number }} params
 * @returns {Promise<import("./contracts.js").SkillProgress>}
 */
export async function recordSkillGain({
  skillTags = [],
  accuracy = 0,
  topicId = null,
  xpDelta,
} = {}) {
  const current = await loadSkillProgress();
  const validSkills = Array.isArray(skillTags)
    ? [...new Set(skillTags.filter(isValidSkillId))]
    : [];
  const cleanAccuracy = clampNumber(accuracy, 0, 100);
  const todayKey = toLocalDateKey();

  const next = {
    ...current,
    topicMastery: { ...current.topicMastery },
    streakDays: computeNextStreak(current.lastActiveDate, current.streakDays, todayKey),
    lastActiveDate: todayKey,
    xp:
      current.xp +
      (xpDelta !== undefined
        ? Math.max(0, Math.round(Number(xpDelta) || 0))
        : Math.max(5, Math.round(cleanAccuracy * 0.4 + 10))),
  };

  // Smooth exponential moving average toward recent session accuracy, rewarding steady practice
  for (const skill of validSkills) {
    const prev = Number(current[skill] || 0);
    const updated = prev === 0 ? cleanAccuracy * 0.65 : prev * 0.7 + cleanAccuracy * 0.3 + 2;
    next[skill] = Number(clampNumber(updated, 0, 100).toFixed(2));
  }

  if (isValidTopicId(topicId)) {
    const prevTopic = Number(next.topicMastery[topicId] || 0);
    const updatedTopic =
      prevTopic === 0 ? cleanAccuracy * 0.6 : prevTopic * 0.72 + cleanAccuracy * 0.28 + 3;
    next.topicMastery[topicId] = Number(clampNumber(updatedTopic, 0, 100).toFixed(2));
  }

  return saveSkillProgress(next);
}

// ============================================================================
// Game Sessions / History
// ============================================================================

/**
 * Load recent game sessions, optionally filtered by topicId or gameType.
 * @param {{ limit?: number, topicId?: import("./contracts.js").TopicId, gameType?: string }} [options={}]
 * @returns {Promise<import("./contracts.js").GameResult[]>}
 */
export async function loadGameHistory(options = {}) {
  const limit = Math.max(1, Math.min(200, Math.round(Number(options.limit || 50))));
  const user = await getCloudUser();

  if (user && supabase) {
    try {
      let query = supabase
        .from("game_sessions")
        .select(
          "id,game_type,topic_id,skill_tags,score,max_score,accuracy,duration_seconds,details_json,created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (isValidTopicId(options.topicId)) {
        query = query.eq("topic_id", options.topicId);
      }
      if (options.gameType) {
        query = query.eq("game_type", options.gameType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(normalizeGameResult);
    } catch (err) {
      console.warn("Falling back to local game history:", err?.message);
    }
  }

  const local = readLocalJson(STORAGE_KEYS.SESSIONS, []);
  let list = Array.isArray(local) ? local.map(normalizeGameResult) : [];
  if (isValidTopicId(options.topicId)) {
    list = list.filter((s) => s.topicId === options.topicId);
  }
  if (options.gameType) {
    list = list.filter((s) => s.gameType === options.gameType);
  }
  return list.slice(0, limit);
}

/**
 * Save a completed game/practice session and automatically update skill progress, XP, and streak.
 * @param {Partial<import("./contracts.js").GameResult> & { xpDelta?: number }} resultInput
 * @returns {Promise<{ session: import("./contracts.js").GameResult, progress: import("./contracts.js").SkillProgress }>}
 */
export async function saveGameSession(resultInput) {
  const session = normalizeGameResult(resultInput);
  const user = await getCloudUser();

  let savedSession = session;
  if (user && supabase) {
    const { data, error } = await supabase
      .from("game_sessions")
      .insert({
        id: isValidUuid(session.id) ? session.id : generateId(),
        user_id: user.id,
        game_type: session.gameType,
        topic_id: session.topicId,
        skill_tags: session.skillTags,
        score: session.score,
        max_score: session.maxScore,
        accuracy: session.accuracy,
        duration_seconds: session.durationSeconds,
        details_json: session.details,
      })
      .select(
        "id,game_type,topic_id,skill_tags,score,max_score,accuracy,duration_seconds,details_json,created_at"
      )
      .single();

    if (error) throw error;
    savedSession = normalizeGameResult(data);
  } else {
    const current = readLocalJson(STORAGE_KEYS.SESSIONS, []);
    const list = Array.isArray(current) ? current : [];
    const next = [session, ...list].slice(0, 200);
    writeLocalJson(STORAGE_KEYS.SESSIONS, next);
  }

  const progress = await recordSkillGain({
    skillTags: savedSession.skillTags.length > 0 ? savedSession.skillTags : [],
    accuracy: savedSession.accuracy,
    topicId: savedSession.topicId,
    xpDelta: resultInput?.xpDelta,
  });

  return { session: savedSession, progress };
}

// ============================================================================
// Local Preferences, Sync & Maintenance
// ============================================================================

const DEFAULT_PREFERENCES = Object.freeze({
  autoPlayAudio: false,
  speechRate: 1,
  showEnglishHints: true,
  activeTopicId: "self",
});

/**
 * Load lightweight UI/study preferences from localStorage.
 * @returns {typeof DEFAULT_PREFERENCES & Record<string, any>}
 */
export function loadPreferences() {
  const saved = readLocalJson(STORAGE_KEYS.PREFERENCES, {});
  return { ...DEFAULT_PREFERENCES, ...(saved && typeof saved === "object" ? saved : {}) };
}

/**
 * Merge and save UI/study preferences into localStorage.
 * @param {Record<string, any>} partial
 * @returns {typeof DEFAULT_PREFERENCES & Record<string, any>}
 */
export function savePreferences(partial = {}) {
  const next = { ...loadPreferences(), ...partial };
  writeLocalJson(STORAGE_KEYS.PREFERENCES, next);
  return next;
}

/**
 * Upload localStorage decks and recent sessions into the authenticated Supabase account.
 * Useful right after a local-only learner signs in for the first time.
 * Always mints fresh per-user UUIDs on insert so starter/local IDs never collide across users.
 * @returns {Promise<{ syncedDecks: number, syncedCards: number, syncedSessions: number }>}
 */
export async function syncLocalToCloud() {
  const user = await getCloudUser();
  if (!user || !supabase) {
    return { syncedDecks: 0, syncedCards: 0, syncedSessions: 0 };
  }

  let syncedDecks = 0;
  let syncedCards = 0;
  let syncedSessions = 0;

  const localDecks = (getLocalDecksRaw() || []).filter((deck) => deck.canEdit !== false);
  if (localDecks.length > 0) {
    const { data: existingDecks } = await supabase
      .from("flashcard_decks")
      .select("id,title,is_default,topic_id,flashcards(front_vi)")
      .eq("user_id", user.id);

    const cloudDecks = Array.isArray(existingDecks) ? existingDecks : [];

    for (const deck of localDecks) {
      const localTitleKey = normalizeMatchKey(deck.title);
      const localTopic = deck.topicId || null;

      // Match existing cloud deck (default starter deck by topic/title, or custom deck by id/title+topic)
      const matchedCloudDeck = cloudDecks.find((cloud) => {
        if (cloud.id === deck.id) return true;
        if (deck.isDefault && cloud.is_default) {
          if (localTopic && cloud.topic_id === localTopic) return true;
          return normalizeMatchKey(cloud.title) === localTitleKey;
        }
        if (!deck.isDefault && !cloud.is_default) {
          return (
            normalizeMatchKey(cloud.title) === localTitleKey &&
            (cloud.topic_id || null) === localTopic
          );
        }
        return false;
      });

      if (matchedCloudDeck) {
        const existingFronts = new Set(
          (matchedCloudDeck.flashcards || []).map((c) => normalizeMatchKey(c.front_vi))
        );
        const missingCards = (deck.cards || [])
          .filter((card) => card.frontVi && card.definition && !existingFronts.has(normalizeMatchKey(card.frontVi)))
          .map((card) => {
            const { id: _dropId, deckId: _dropDeckId, ...rest } = card;
            return rest;
          });

        if (missingCards.length > 0) {
          try {
            const added = await addFlashcardsBulk(matchedCloudDeck.id, missingCards);
            syncedCards += added.length;
            matchedCloudDeck.flashcards = [
              ...(matchedCloudDeck.flashcards || []),
              ...added.map((c) => ({ front_vi: c.frontVi })),
            ];
          } catch (err) {
            console.warn("Skipping card sync for deck:", err?.message);
          }
        }
        continue;
      }

      try {
        const created = await createDeck(cloneDeckWithFreshIds(deck));
        syncedDecks += 1;
        syncedCards += created.cards.length;
        cloudDecks.push({
          id: created.id,
          title: created.title,
          is_default: created.isDefault,
          topic_id: created.topicId,
          flashcards: created.cards.map((c) => ({ front_vi: c.frontVi })),
        });
      } catch (err) {
        console.warn("Skipping deck sync:", err?.message);
      }
    }
  }

  const localSessions = readLocalJson(STORAGE_KEYS.SESSIONS, []);
  if (Array.isArray(localSessions) && localSessions.length > 0) {
    const { data: existingSessions } = await supabase
      .from("game_sessions")
      .select("id,game_type,created_at")
      .eq("user_id", user.id);

    const existingIds = new Set((existingSessions || []).map((s) => s.id));
    const existingSignatures = new Set(
      (existingSessions || []).map((s) => `${s.game_type}|${s.created_at}`)
    );

    const toInsert = localSessions
      .map(normalizeGameResult)
      .filter((s) => {
        const sig = `${s.gameType}|${s.createdAt}`;
        return !existingIds.has(s.id) && !existingSignatures.has(sig);
      })
      .map((s) => ({
        id: generateId(),
        user_id: user.id,
        game_type: s.gameType,
        topic_id: s.topicId,
        skill_tags: s.skillTags,
        score: s.score,
        max_score: s.maxScore,
        accuracy: s.accuracy,
        duration_seconds: s.durationSeconds,
        details_json: s.details,
        created_at: s.createdAt,
      }));

    if (toInsert.length > 0) {
      const { error } = await supabase.from("game_sessions").insert(toInsert);
      if (!error) syncedSessions = toInsert.length;
    }
  }

  const localProgress = readLocalJson(STORAGE_KEYS.PROGRESS, null);
  if (localProgress) {
    const cloudProgress = await loadSkillProgress();
    const merged = {
      ...cloudProgress,
      listening: Math.max(cloudProgress.listening, Number(localProgress.listening || 0)),
      speaking: Math.max(cloudProgress.speaking, Number(localProgress.speaking || 0)),
      reading: Math.max(cloudProgress.reading, Number(localProgress.reading || 0)),
      pronunciation: Math.max(cloudProgress.pronunciation, Number(localProgress.pronunciation || 0)),
      xp: Math.max(cloudProgress.xp, Number(localProgress.xp || 0)),
      streakDays: Math.max(cloudProgress.streakDays, Number(localProgress.streakDays || 0)),
      lastActiveDate: cloudProgress.lastActiveDate || localProgress.lastActiveDate || null,
      topicMastery: Object.fromEntries(
        TOPIC_IDS.map((id) => [
          id,
          Math.max(
            Number(cloudProgress.topicMastery?.[id] || 0),
            Number(localProgress.topicMastery?.[id] || 0)
          ),
        ])
      ),
    };
    await saveSkillProgress(merged);
  }

  return { syncedDecks, syncedCards, syncedSessions };
}

/**
 * Clear all locally stored munnn01 data (useful for tests or learner reset).
 * @returns {void}
 */
export function clearLocalStorageData() {
  Object.values(STORAGE_KEYS).forEach(removeLocalKey);
  assignedCardsById.clear();
}

export { SKILL_IDS, TOPIC_IDS };
