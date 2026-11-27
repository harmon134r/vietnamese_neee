/**
 * Shared constants, normalizers, and JSDoc domain contracts for munnn01.
 * Consumed across curriculum data, games, Flashcard Studio, speech engine, and storage.
 */

/** @typedef {"self" | "food" | "routine" | "weather" | "emotions" | "opinions"} TopicId */
/** @typedef {"listening" | "speaking" | "reading" | "pronunciation"} SkillId */

/**
 * @typedef {Object} Flashcard
 * @property {string} id
 * @property {string} deckId
 * @property {string} frontVi - Vietnamese word or phrase shown on the front
 * @property {string} pos - Part of speech (e.g. "danh từ", "động từ", "tính từ", "cụm từ")
 * @property {string} ipa - Phonetic / pronunciation guide (optional)
 * @property {string} definition - Definition / meaning shown on the back
 * @property {string} exampleVi - Natural Vietnamese example sentence
 * @property {string} exampleEn - English translation / hint for the example (optional)
 * @property {string} notes - Cultural, tone, or grammar notes (optional)
 * @property {TopicId | null} topicId
 * @property {number} masteryLevel - 0 (New) to 5 (Mastered)
 * @property {number} reviewCount
 * @property {string | null} lastReviewedAt - ISO timestamp
 * @property {number} position
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 */

/**
 * @typedef {Object} Deck
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {TopicId | null} topicId
 * @property {string} color
 * @property {boolean} isDefault
 * @property {Flashcard[]} cards
 * @property {number} cardCount
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 */

/**
 * @typedef {Object} Topic
 * @property {TopicId} id
 * @property {string} titleVi
 * @property {string} titleEn
 * @property {string} subtitle
 * @property {string} cefrLevel
 * @property {string} accent
 * @property {string} [icon]
 * @property {string} [summary]
 * @property {Array<object>} [vocabulary]
 * @property {Array<object>} [dialogues]
 * @property {Array<object>} [readingPassages]
 * @property {Array<object>} [speakingPrompts]
 * @property {Array<object>} [pronunciationDrills]
 */

/**
 * @typedef {Object} GameResult
 * @property {string} id
 * @property {string} gameType - e.g. "tone_radar" | "listen_match" | "dialogue_builder" | "reading_comprehension" | "shadow_speak" | "pronunciation_lab" | "flashcard_review"
 * @property {TopicId | null} topicId
 * @property {SkillId[]} skillTags
 * @property {number} score
 * @property {number} maxScore
 * @property {number} accuracy - 0..100
 * @property {number} durationSeconds
 * @property {Record<string, any>} details
 * @property {string} createdAt - ISO timestamp
 */

/**
 * @typedef {Object} SkillProgress
 * @property {number} listening - 0..100
 * @property {number} speaking - 0..100
 * @property {number} reading - 0..100
 * @property {number} pronunciation - 0..100
 * @property {number} xp
 * @property {number} streakDays
 * @property {string | null} lastActiveDate - YYYY-MM-DD
 * @property {Record<string, number>} topicMastery - map of TopicId -> 0..100
 * @property {string} updatedAt - ISO timestamp
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} email
 * @property {string} displayName
 * @property {string | null} avatarUrl
 * @property {string} cefrLevel
 * @property {string} nativeLang
 * @property {number} dailyGoalMinutes
 * @property {Record<string, any>} preferences
 */

/** @type {readonly TopicId[]} */
export const TOPIC_IDS = Object.freeze([
  "self",
  "food",
  "routine",
  "weather",
  "emotions",
  "opinions",
]);

/** @type {readonly SkillId[]} */
export const SKILL_IDS = Object.freeze([
  "listening",
  "speaking",
  "reading",
  "pronunciation",
]);

/** @type {Readonly<Record<TopicId, { id: TopicId, titleVi: string, titleEn: string, accent: string }>>} */
export const TOPIC_META = Object.freeze({
  self: {
    id: "self",
    titleVi: "Bản thân",
    titleEn: "Myself & Background",
    accent: "#38bdf8",
  },
  food: {
    id: "food",
    titleVi: "Ẩm thực & Sở thích ăn uống",
    titleEn: "Food & Eating Habits",
    accent: "#f59e0b",
  },
  routine: {
    id: "routine",
    titleVi: "Sinh hoạt hằng ngày",
    titleEn: "Daily Routine",
    accent: "#34d399",
  },
  weather: {
    id: "weather",
    titleVi: "Thời tiết",
    titleEn: "Weather & Seasons",
    accent: "#60a5fa",
  },
  emotions: {
    id: "emotions",
    titleVi: "Cảm xúc",
    titleEn: "Emotions & Reactions",
    accent: "#f472b6",
  },
  opinions: {
    id: "opinions",
    titleVi: "Quan điểm cơ bản",
    titleEn: "Basic Opinions",
    accent: "#a78bfa",
  },
});

/** @type {Readonly<Record<SkillId, { id: SkillId, labelVi: string, labelEn: string, color: string }>>} */
export const SKILL_META = Object.freeze({
  listening: {
    id: "listening",
    labelVi: "Nghe",
    labelEn: "Listening",
    color: "#38bdf8",
  },
  speaking: {
    id: "speaking",
    labelVi: "Nói",
    labelEn: "Speaking",
    color: "#34d399",
  },
  reading: {
    id: "reading",
    labelVi: "Đọc",
    labelEn: "Reading",
    color: "#fbbf24",
  },
  pronunciation: {
    id: "pronunciation",
    labelVi: "Phát âm",
    labelEn: "Pronunciation",
    color: "#f472b6",
  },
});

export const MASTERY_LEVELS = Object.freeze({
  NEW: 0,
  REVIEW: 1,
  FAMILIAR: 2,
  GOOD: 3,
  STRONG: 4,
  MASTERED: 5,
});

export const GAME_TYPES = Object.freeze({
  TONE_RADAR: "tone_radar",
  LISTEN_MATCH: "listen_match",
  DIALOGUE_BUILDER: "dialogue_builder",
  READING_COMPREHENSION: "reading_comprehension",
  SHADOW_SPEAK: "shadow_speak",
  PRONUNCIATION_LAB: "pronunciation_lab",
  FLASHCARD_REVIEW: "flashcard_review",
  SYNONYM_ANTONYM_CHASE: "synonym-antonym-chase",
});

/**
 * Generate a UUID v4 string safely across browsers, Node, and jsdom.
 * @returns {string}
 */
export function generateId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * @param {unknown} value
 * @returns {value is TopicId}
 */
export function isValidTopicId(value) {
  return typeof value === "string" && TOPIC_IDS.includes(/** @type {TopicId} */ (value));
}

/**
 * @param {unknown} value
 * @returns {value is SkillId}
 */
export function isValidSkillId(value) {
  return typeof value === "string" && SKILL_IDS.includes(/** @type {SkillId} */ (value));
}

/**
 * Clamp a number into [min, max].
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clampNumber(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
}

/**
 * Create a fresh default SkillProgress object.
 * @returns {SkillProgress}
 */
export function createEmptySkillProgress() {
  return {
    listening: 0,
    speaking: 0,
    reading: 0,
    pronunciation: 0,
    xp: 0,
    streakDays: 0,
    lastActiveDate: null,
    topicMastery: {
      self: 0,
      food: 0,
      routine: 0,
      weather: 0,
      emotions: 0,
      opinions: 0,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Normalize a Flashcard input (accepting either camelCase or snake_case DB rows).
 * @param {Record<string, any>} raw
 * @param {string} [fallbackDeckId=""]
 * @returns {Flashcard}
 */
export function normalizeFlashcard(raw = {}, fallbackDeckId = "") {
  const now = new Date().toISOString();
  const topicCandidate = raw.topicId ?? raw.topic_id ?? null;

  return {
    id: String(raw.id || generateId()),
    deckId: String(raw.deckId ?? raw.deck_id ?? fallbackDeckId),
    frontVi: String(raw.frontVi ?? raw.front_vi ?? raw.term ?? "").trim(),
    pos: String(raw.pos ?? raw.partOfSpeech ?? raw.part_of_speech ?? "").trim(),
    ipa: String(raw.ipa ?? raw.phonetic ?? "").trim(),
    definition: String(raw.definition ?? raw.meaning ?? "").trim(),
    exampleVi: String(raw.exampleVi ?? raw.example_vi ?? raw.example ?? "").trim(),
    exampleEn: String(raw.exampleEn ?? raw.example_en ?? "").trim(),
    notes: String(raw.notes ?? "").trim(),
    topicId: isValidTopicId(topicCandidate) ? topicCandidate : null,
    masteryLevel: Math.round(clampNumber(raw.masteryLevel ?? raw.mastery_level ?? 0, 0, 5)),
    reviewCount: Math.max(0, Math.round(Number(raw.reviewCount ?? raw.review_count ?? 0) || 0)),
    lastReviewedAt: raw.lastReviewedAt ?? raw.last_reviewed_at ?? null,
    position: Math.max(0, Math.round(Number(raw.position ?? 0) || 0)),
    createdAt: raw.createdAt ?? raw.created_at ?? now,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? now,
  };
}

/**
 * Normalize a Deck input (accepting either camelCase or snake_case DB rows).
 * @param {Record<string, any>} raw
 * @returns {Deck}
 */
export function normalizeDeck(raw = {}) {
  const now = new Date().toISOString();
  const id = String(raw.id || generateId());
  const topicCandidate = raw.topicId ?? raw.topic_id ?? null;
  const rawCards = Array.isArray(raw.cards)
    ? raw.cards
    : Array.isArray(raw.flashcards)
      ? raw.flashcards
      : [];

  const cards = rawCards
    .map((card, index) =>
      normalizeFlashcard({ position: index, ...card }, id)
    )
    .sort((a, b) => a.position - b.position);

  return {
    id,
    title: String(raw.title || "Bộ thẻ mới").trim(),
    description: String(raw.description || "").trim(),
    topicId: isValidTopicId(topicCandidate) ? topicCandidate : null,
    color: String(raw.color || (isValidTopicId(topicCandidate) ? TOPIC_META[topicCandidate].accent : "#38bdf8")),
    isDefault: Boolean(raw.isDefault ?? raw.is_default ?? false),
    cards,
    cardCount: cards.length,
    createdAt: raw.createdAt ?? raw.created_at ?? now,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? now,
  };
}

/**
 * Normalize a GameResult input (accepting either camelCase or snake_case DB rows).
 * @param {Record<string, any>} raw
 * @returns {GameResult}
 */
export function normalizeGameResult(raw = {}) {
  const now = new Date().toISOString();
  const topicCandidate = raw.topicId ?? raw.topic_id ?? null;
  const rawSkills = raw.skillTags ?? raw.skill_tags ?? [];
  const skillTags = Array.isArray(rawSkills)
    ? [...new Set(rawSkills.filter(isValidSkillId))]
    : [];

  const score = Math.max(0, Math.round(Number(raw.score ?? 0) || 0));
  const maxScore = Math.max(score, Math.round(Number(raw.maxScore ?? raw.max_score ?? 0) || 0));
  const computedAccuracy =
    raw.accuracy !== undefined && raw.accuracy !== null
      ? clampNumber(raw.accuracy, 0, 100)
      : maxScore > 0
        ? clampNumber((score / maxScore) * 100, 0, 100)
        : 0;

  return {
    id: String(raw.id || generateId()),
    gameType: String(raw.gameType ?? raw.game_type ?? "practice").trim(),
    topicId: isValidTopicId(topicCandidate) ? topicCandidate : null,
    skillTags,
    score,
    maxScore,
    accuracy: Number(computedAccuracy.toFixed(2)),
    durationSeconds: Math.max(0, Math.round(Number(raw.durationSeconds ?? raw.duration_seconds ?? 0) || 0)),
    details:
      raw.details && typeof raw.details === "object"
        ? raw.details
        : raw.details_json && typeof raw.details_json === "object"
          ? raw.details_json
          : {},
    createdAt: raw.createdAt ?? raw.created_at ?? now,
  };
}
