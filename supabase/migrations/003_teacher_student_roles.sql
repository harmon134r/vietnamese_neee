-- ============================================================================
-- munnn01 — Teacher & Student Roles + Teacher-Assigned Flashcard Decks
-- Idempotent PostgreSQL migration with Row Level Security (RLS)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Add role column to public.user_profiles
-- ----------------------------------------------------------------------------
alter table public.user_profiles
  add column if not exists role text not null default 'student';

alter table public.user_profiles
  drop constraint if exists user_profiles_role_check;

alter table public.user_profiles
  add constraint user_profiles_role_check
  check (role in ('student', 'teacher'));

-- ----------------------------------------------------------------------------
-- 2. Add teacher-assignment columns & partial index to public.flashcard_decks
-- ----------------------------------------------------------------------------
alter table public.flashcard_decks
  add column if not exists is_assigned boolean not null default false,
  add column if not exists teacher_name text not null default '',
  add column if not exists assigned_at timestamptz;

create index if not exists idx_flashcard_decks_assigned
  on public.flashcard_decks (is_assigned, assigned_at desc)
  where is_assigned = true;

-- ----------------------------------------------------------------------------
-- 3. Create public.student_card_progress for per-student mastery on shared decks
-- ----------------------------------------------------------------------------
create table if not exists public.student_card_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id uuid not null references public.flashcards (id) on delete cascade,
  deck_id uuid not null references public.flashcard_decks (id) on delete cascade,
  mastery_level smallint not null default 0 check (mastery_level between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  last_reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

create index if not exists idx_student_card_progress_user_deck
  on public.student_card_progress (user_id, deck_id);

drop trigger if exists trg_student_card_progress_updated_at on public.student_card_progress;
create trigger trg_student_card_progress_updated_at
  before update on public.student_card_progress
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Helper function: public.is_teacher(check_uid uuid)
-- ----------------------------------------------------------------------------
create or replace function public.is_teacher(check_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where user_id = check_uid
      and role = 'teacher'
  );
$$;

-- ----------------------------------------------------------------------------
-- 5. Update public.handle_new_user() trigger for verified teacher signup
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := 'student';
begin
  if lower(trim(coalesce(new.raw_user_meta_data ->> 'role', ''))) = 'teacher'
     and upper(trim(coalesce(new.raw_user_meta_data ->> 'teacher_code', ''))) = 'MUNNN01-GV' then
    v_role := 'teacher';
  end if;

  insert into public.user_profiles (user_id, display_name, role)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    v_role
  )
  on conflict (user_id) do nothing;

  insert into public.skill_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 6. Prevent non-teachers from self-escalating user_profiles.role
-- ----------------------------------------------------------------------------
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_teacher(auth.uid()) then
    raise exception 'Role self-escalation is not permitted'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_user_profiles_prevent_role_escalation on public.user_profiles;
create trigger trg_user_profiles_prevent_role_escalation
  before update on public.user_profiles
  for each row
  execute function public.prevent_role_self_escalation();

-- ----------------------------------------------------------------------------
-- 7. Row Level Security (RLS) Policies
-- ----------------------------------------------------------------------------

-- user_profiles: disallow direct client self-insert with teacher role
drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own"
  on public.user_profiles for insert
  with check (auth.uid() = user_id and role = 'student');

-- flashcard_decks: public/student read of assigned decks
drop policy if exists "flashcard_decks_select_assigned_public" on public.flashcard_decks;
create policy "flashcard_decks_select_assigned_public"
  on public.flashcard_decks for select
  to anon, authenticated
  using (is_assigned = true);

-- flashcard_decks: only teachers can create or publish assigned decks
drop policy if exists "flashcard_decks_insert_own" on public.flashcard_decks;
create policy "flashcard_decks_insert_own"
  on public.flashcard_decks for insert
  with check (
    auth.uid() = user_id
    and (is_assigned = false or public.is_teacher(auth.uid()))
  );

drop policy if exists "flashcard_decks_update_own" on public.flashcard_decks;
create policy "flashcard_decks_update_own"
  on public.flashcard_decks for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (is_assigned = false or public.is_teacher(auth.uid()))
  );

-- flashcards: public/student read of cards inside assigned decks
drop policy if exists "flashcards_select_assigned_public" on public.flashcards;
create policy "flashcards_select_assigned_public"
  on public.flashcards for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.flashcard_decks d
      where d.id = deck_id and d.is_assigned = true
    )
  );

-- student_card_progress: own-row CRUD + teacher read
alter table public.student_card_progress enable row level security;

drop policy if exists "student_card_progress_select_own" on public.student_card_progress;
create policy "student_card_progress_select_own"
  on public.student_card_progress for select
  using (auth.uid() = user_id);

drop policy if exists "student_card_progress_select_teacher" on public.student_card_progress;
create policy "student_card_progress_select_teacher"
  on public.student_card_progress for select
  using (public.is_teacher(auth.uid()));

drop policy if exists "student_card_progress_insert_own" on public.student_card_progress;
create policy "student_card_progress_insert_own"
  on public.student_card_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "student_card_progress_update_own" on public.student_card_progress;
create policy "student_card_progress_update_own"
  on public.student_card_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "student_card_progress_delete_own" on public.student_card_progress;
create policy "student_card_progress_delete_own"
  on public.student_card_progress for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 8. Explicit Public Schema Grants & PostgREST Schema Reload
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

grant select on table
  public.flashcard_decks,
  public.flashcards
  to anon;

grant select, insert, update, delete on table
  public.user_profiles,
  public.flashcard_decks,
  public.flashcards,
  public.student_card_progress,
  public.game_sessions,
  public.skill_progress
  to authenticated;

grant all on table
  public.user_profiles,
  public.flashcard_decks,
  public.flashcards,
  public.student_card_progress,
  public.game_sessions,
  public.skill_progress
  to service_role;

grant usage, select on all sequences in schema public to anon, authenticated, service_role;

grant execute on function public.is_teacher(uuid) to anon, authenticated, service_role;
grant execute on function public.set_updated_at() to authenticated, service_role;
grant execute on function public.prevent_role_self_escalation() to authenticated, service_role;

notify pgrst, 'reload schema';
