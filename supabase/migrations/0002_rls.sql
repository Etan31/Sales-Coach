-- 0002_rls.sql
-- Enables Row Level Security on every table created in 0001_init.sql and defines the
-- explicit per-table policies that enforce per-user data isolation. See docs/DATABASE.md
-- for a plain-language explanation of each policy.

alter table public.profiles enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.messages enable row level security;
alter table public.evaluations enable row level security;
alter table public.business_profiles enable row level security;

-- profiles: a user may only read/update their own row. Rows are normally created by the
-- handle_new_user trigger (SECURITY DEFINER, bypasses RLS); the insert policy below is kept
-- for completeness / any direct insert run under the user's own session.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles for insert
  with check (id = auth.uid());

-- practice_sessions: full CRUD restricted to the owning user (auth.uid() = user_id).
drop policy if exists practice_sessions_select_own on public.practice_sessions;
create policy practice_sessions_select_own
  on public.practice_sessions for select
  using (user_id = auth.uid());

drop policy if exists practice_sessions_insert_own on public.practice_sessions;
create policy practice_sessions_insert_own
  on public.practice_sessions for insert
  with check (user_id = auth.uid());

drop policy if exists practice_sessions_update_own on public.practice_sessions;
create policy practice_sessions_update_own
  on public.practice_sessions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists practice_sessions_delete_own on public.practice_sessions;
create policy practice_sessions_delete_own
  on public.practice_sessions for delete
  using (user_id = auth.uid());

-- messages: readable/insertable only through a practice_sessions row the caller owns.
-- Messages are append-only from the API (POST /api/chat writes both the seller turn and the
-- generated owner reply); no update/delete policy is defined, so those operations are denied
-- by default once RLS is enabled.
drop policy if exists messages_select_via_session on public.messages;
create policy messages_select_via_session
  on public.messages for select
  using (
    exists (
      select 1 from public.practice_sessions s
      where s.id = messages.session_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists messages_insert_via_session on public.messages;
create policy messages_insert_via_session
  on public.messages for insert
  with check (
    exists (
      select 1 from public.practice_sessions s
      where s.id = messages.session_id
        and s.user_id = auth.uid()
    )
  );

-- evaluations: readable/insertable only through a practice_sessions row the caller owns.
-- Evaluations are created once by POST /api/end-session and never edited afterward; no
-- update/delete policy is defined, so those operations are denied by default.
drop policy if exists evaluations_select_via_session on public.evaluations;
create policy evaluations_select_via_session
  on public.evaluations for select
  using (
    exists (
      select 1 from public.practice_sessions s
      where s.id = evaluations.session_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists evaluations_insert_via_session on public.evaluations;
create policy evaluations_insert_via_session
  on public.evaluations for insert
  with check (
    exists (
      select 1 from public.practice_sessions s
      where s.id = evaluations.session_id
        and s.user_id = auth.uid()
    )
  );

-- business_profiles: read-only reference data for any authenticated user. No insert/update/delete
-- policy is defined -- the seed data is loaded via the service-role key (see supabase/seed/), which
-- bypasses RLS entirely, so the app itself never needs write access to this table.
drop policy if exists business_profiles_select_authenticated on public.business_profiles;
create policy business_profiles_select_authenticated
  on public.business_profiles for select
  using (auth.role() = 'authenticated');
