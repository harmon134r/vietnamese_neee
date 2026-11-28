-- ============================================================================
-- munnn01 — Initial Cloudflare D1 (SQLite) Schema
-- Idempotent DDL for flashcard decks, cards, student progress, game sessions,
-- and 4-skill progress (5 tables + 6 indexes).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. flashcard_decks
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flashcard_decks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT NOT NULL DEFAULT '',
  topic_id TEXT CHECK (
    topic_id IS NULL
    OR topic_id IN ('self', 'food', 'routine', 'weather', 'emotions', 'opinions')
  ),
  color TEXT NOT NULL DEFAULT '#38bdf8',
  is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  is_assigned INTEGER NOT NULL DEFAULT 0 CHECK (is_assigned IN (0, 1)),
  teacher_name TEXT NOT NULL DEFAULT '',
  assigned_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_id
  ON flashcard_decks (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_flashcard_decks_assigned
  ON flashcard_decks (is_assigned, assigned_at DESC, created_at DESC)
  WHERE is_assigned = 1;

-- ----------------------------------------------------------------------------
-- 2. flashcards
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flashcards (
  id TEXT PRIMARY KEY,
  deck_id TEXT NOT NULL REFERENCES flashcard_decks (id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  front_vi TEXT NOT NULL CHECK (length(trim(front_vi)) > 0),
  pos TEXT NOT NULL DEFAULT '',
  ipa TEXT NOT NULL DEFAULT '',
  definition TEXT NOT NULL CHECK (length(trim(definition)) > 0),
  example_vi TEXT NOT NULL DEFAULT '',
  example_en TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  topic_id TEXT CHECK (
    topic_id IS NULL
    OR topic_id IN ('self', 'food', 'routine', 'weather', 'emotions', 'opinions')
  ),
  mastery_level INTEGER NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  last_reviewed_at TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id
  ON flashcards (deck_id, position ASC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_flashcards_user_id
  ON flashcards (user_id);

-- ----------------------------------------------------------------------------
-- 3. student_card_progress
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_card_progress (
  user_id TEXT NOT NULL,
  card_id TEXT NOT NULL REFERENCES flashcards (id) ON DELETE CASCADE,
  deck_id TEXT NOT NULL REFERENCES flashcard_decks (id) ON DELETE CASCADE,
  mastery_level INTEGER NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  last_reviewed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (user_id, card_id)
);

CREATE INDEX IF NOT EXISTS idx_student_card_progress_user_deck
  ON student_card_progress (user_id, deck_id);

-- ----------------------------------------------------------------------------
-- 4. game_sessions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS game_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  game_type TEXT NOT NULL CHECK (length(trim(game_type)) > 0),
  topic_id TEXT CHECK (
    topic_id IS NULL
    OR topic_id IN ('self', 'food', 'routine', 'weather', 'emotions', 'opinions')
  ),
  skill_tags TEXT NOT NULL DEFAULT '[]',
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
  max_score INTEGER NOT NULL DEFAULT 0 CHECK (max_score >= 0),
  accuracy REAL NOT NULL DEFAULT 0 CHECK (accuracy >= 0 AND accuracy <= 100),
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_created
  ON game_sessions (user_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 5. skill_progress
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skill_progress (
  user_id TEXT PRIMARY KEY,
  listening REAL NOT NULL DEFAULT 0 CHECK (listening >= 0 AND listening <= 100),
  speaking REAL NOT NULL DEFAULT 0 CHECK (speaking >= 0 AND speaking <= 100),
  reading REAL NOT NULL DEFAULT 0 CHECK (reading >= 0 AND reading <= 100),
  pronunciation REAL NOT NULL DEFAULT 0 CHECK (pronunciation >= 0 AND pronunciation <= 100),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  streak_days INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  last_active_date TEXT,
  topic_mastery TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
