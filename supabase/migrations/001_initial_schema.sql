-- ============================================================================
-- ViệtFlow — Initial Supabase PostgreSQL Schema
-- Adult Pre-Intermediate (A2-B1) Vietnamese 4-Skill Trainer & Flashcard Studio
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Shared updated_at trigger function
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 1. user_profiles
-- ----------------------------------------------------------------------------
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  cefr_level text not null default 'A2-B1',
  native_lang text not null default 'en',
  daily_goal_minutes integer not null default 15 check (daily_goal_minutes > 0),
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. flashcard_decks
-- ----------------------------------------------------------------------------
create table if not exists public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text not null default '',
  topic_id text check (
    topic_id is null
    or topic_id in ('self', 'food', 'routine', 'weather', 'emotions', 'opinions')
  ),
  color text not null default '#38bdf8',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_flashcard_decks_user_id
  on public.flashcard_decks (user_id, created_at desc);

create index if not exists idx_flashcard_decks_topic_id
  on public.flashcard_decks (topic_id);

drop trigger if exists trg_flashcard_decks_updated_at on public.flashcard_decks;
create trigger trg_flashcard_decks_updated_at
  before update on public.flashcard_decks
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. flashcards
-- ----------------------------------------------------------------------------
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.flashcard_decks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  front_vi text not null check (char_length(trim(front_vi)) > 0),
  pos text not null default '',
  ipa text not null default '',
  definition text not null check (char_length(trim(definition)) > 0),
  example_vi text not null default '',
  example_en text not null default '',
  notes text not null default '',
  topic_id text check (
    topic_id is null
    or topic_id in ('self', 'food', 'routine', 'weather', 'emotions', 'opinions')
  ),
  mastery_level smallint not null default 0 check (mastery_level between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  last_reviewed_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_flashcards_deck_id
  on public.flashcards (deck_id, position asc, created_at asc);

create index if not exists idx_flashcards_user_id
  on public.flashcards (user_id);

create index if not exists idx_flashcards_topic_id
  on public.flashcards (topic_id);

drop trigger if exists trg_flashcards_updated_at on public.flashcards;
create trigger trg_flashcards_updated_at
  before update on public.flashcards
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. game_sessions
-- ----------------------------------------------------------------------------
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  game_type text not null check (char_length(trim(game_type)) > 0),
  topic_id text check (
    topic_id is null
    or topic_id in ('self', 'food', 'routine', 'weather', 'emotions', 'opinions')
  ),
  skill_tags text[] not null default '{}'::text[],
  score integer not null default 0 check (score >= 0),
  max_score integer not null default 0 check (max_score >= 0),
  accuracy numeric(5, 2) not null default 0 check (accuracy >= 0 and accuracy <= 100),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  details_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_game_sessions_user_created
  on public.game_sessions (user_id, created_at desc);

create index if not exists idx_game_sessions_topic_id
  on public.game_sessions (topic_id);

drop trigger if exists trg_game_sessions_updated_at on public.game_sessions;
create trigger trg_game_sessions_updated_at
  before update on public.game_sessions
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. skill_progress
-- ----------------------------------------------------------------------------
create table if not exists public.skill_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  listening numeric(5, 2) not null default 0 check (listening >= 0 and listening <= 100),
  speaking numeric(5, 2) not null default 0 check (speaking >= 0 and speaking <= 100),
  reading numeric(5, 2) not null default 0 check (reading >= 0 and reading <= 100),
  pronunciation numeric(5, 2) not null default 0 check (pronunciation >= 0 and pronunciation <= 100),
  xp integer not null default 0 check (xp >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  last_active_date date,
  topic_mastery jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_skill_progress_updated_at on public.skill_progress;
create trigger trg_skill_progress_updated_at
  before update on public.skill_progress
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Auto-provision user_profiles & skill_progress on auth.users signup
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (user_id) do nothing;

  insert into public.skill_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ----------------------------------------------------------------------------
alter table public.user_profiles enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.game_sessions enable row level security;
alter table public.skill_progress enable row level security;

-- user_profiles policies
drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own"
  on public.user_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own"
  on public.user_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_profiles_delete_own" on public.user_profiles;
create policy "user_profiles_delete_own"
  on public.user_profiles for delete
  using (auth.uid() = user_id);

-- flashcard_decks policies
drop policy if exists "flashcard_decks_select_own" on public.flashcard_decks;
create policy "flashcard_decks_select_own"
  on public.flashcard_decks for select
  using (auth.uid() = user_id);

drop policy if exists "flashcard_decks_insert_own" on public.flashcard_decks;
create policy "flashcard_decks_insert_own"
  on public.flashcard_decks for insert
  with check (auth.uid() = user_id);

drop policy if exists "flashcard_decks_update_own" on public.flashcard_decks;
create policy "flashcard_decks_update_own"
  on public.flashcard_decks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "flashcard_decks_delete_own" on public.flashcard_decks;
create policy "flashcard_decks_delete_own"
  on public.flashcard_decks for delete
  using (auth.uid() = user_id);

-- flashcards policies
drop policy if exists "flashcards_select_own" on public.flashcards;
create policy "flashcards_select_own"
  on public.flashcards for select
  using (auth.uid() = user_id);

drop policy if exists "flashcards_insert_own" on public.flashcards;
create policy "flashcards_insert_own"
  on public.flashcards for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.flashcard_decks d
      where d.id = deck_id and d.user_id = auth.uid()
    )
  );

drop policy if exists "flashcards_update_own" on public.flashcards;
create policy "flashcards_update_own"
  on public.flashcards for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.flashcard_decks d
      where d.id = deck_id and d.user_id = auth.uid()
    )
  );

drop policy if exists "flashcards_delete_own" on public.flashcards;
create policy "flashcards_delete_own"
  on public.flashcards for delete
  using (auth.uid() = user_id);

-- game_sessions policies
drop policy if exists "game_sessions_select_own" on public.game_sessions;
create policy "game_sessions_select_own"
  on public.game_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "game_sessions_insert_own" on public.game_sessions;
create policy "game_sessions_insert_own"
  on public.game_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "game_sessions_update_own" on public.game_sessions;
create policy "game_sessions_update_own"
  on public.game_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "game_sessions_delete_own" on public.game_sessions;
create policy "game_sessions_delete_own"
  on public.game_sessions for delete
  using (auth.uid() = user_id);

-- skill_progress policies
drop policy if exists "skill_progress_select_own" on public.skill_progress;
create policy "skill_progress_select_own"
  on public.skill_progress for select
  using (auth.uid() = user_id);

drop policy if exists "skill_progress_insert_own" on public.skill_progress;
create policy "skill_progress_insert_own"
  on public.skill_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "skill_progress_update_own" on public.skill_progress;
create policy "skill_progress_update_own"
  on public.skill_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "skill_progress_delete_own" on public.skill_progress;
create policy "skill_progress_delete_own"
  on public.skill_progress for delete
  using (auth.uid() = user_id);
