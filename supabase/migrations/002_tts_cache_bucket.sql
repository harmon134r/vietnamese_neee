-- ============================================================================
-- ViệtFlow — Shared Vietnamese TTS Audio Cache Bucket (Supabase Storage)
-- Stores deterministic SHA-256 WAV/MP3 clips synthesized by VieNeu-TTS-v3-Turbo
-- so repeated playback across learners returns in ~80ms without hitting HF.
-- ============================================================================

-- 1. Idempotently create / configure public `tts-cache` bucket (4 MiB max per clip)
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'tts-cache',
  'tts-cache',
  true,
  4194304,
  array['audio/wav', 'audio/x-wav', 'audio/mpeg']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Public read access for cached TTS audio objects
drop policy if exists "tts_cache_public_select" on storage.objects;
create policy "tts_cache_public_select"
  on storage.objects for select
  to public
  using (bucket_id = 'tts-cache');

-- 3. Immutable write-once INSERT for anon & authenticated clients/serverless proxy,
--    strictly matching deterministic `v1/<voice>/<sha256>.(wav|mp3)` paths.
--    No UPDATE or DELETE policies are created so cached clips are immutable.
drop policy if exists "tts_cache_immutable_insert" on storage.objects;
create policy "tts_cache_immutable_insert"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'tts-cache'
    and name ~ '^v1/[a-z0-9_-]+/[a-f0-9]{64}\.(wav|mp3)$'
  );
