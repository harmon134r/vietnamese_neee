-- ============================================================================
-- munnn01 — Explicit Public Schema Table, Sequence & Function Grants
-- Ensures anon, authenticated, and service_role have SQL privileges alongside RLS
-- ============================================================================

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
