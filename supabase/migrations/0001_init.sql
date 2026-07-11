-- 0001_init.sql
-- Core schema for the AI Sales Coach app: extensions, tables, constraints, indexes,
-- and the handle_new_user trigger that keeps public.profiles in sync with auth.users.
-- See docs/contracts.md for the authoritative shapes and docs/DATABASE.md for the full writeup.

-- pgcrypto provides gen_random_uuid(), used as the default for every uuid primary key below.
create extension if not exists pgcrypto;

-- profiles: one row per auth.users row. Populated automatically by the handle_new_user
-- trigger (see below); never inserted directly by the app in normal operation.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

-- practice_sessions: one roleplay session belonging to a user. business_profile stores the
-- full snapshot (including hidden budget/painPoints/allowedObjections) used server-side only;
-- the API only ever exposes the public "businessInfo" subset derived from it.
create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_type text not null check (business_type in (
    'coffee_shop', 'barbershop', 'salon', 'restaurant', 'gym',
    'dental_clinic', 'laundry_shop', 'convenience_store', 'hardware_store', 'bakery'
  )),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard', 'impossible')),
  contact_method text not null check (contact_method in ('walk_in', 'cold_call', 'messenger', 'email')),
  language text not null check (language in ('english', 'tagalog', 'taglish')),
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  business_profile jsonb not null,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

-- Supports GET /api/history (per-user listing, newest first).
create index if not exists practice_sessions_user_id_created_at_idx
  on public.practice_sessions (user_id, created_at desc);

-- messages: one conversation turn (owner or seller) inside a practice_sessions.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  role text not null check (role in ('owner', 'seller')),
  content text not null,
  sequence int not null,
  created_at timestamptz not null default now()
);

-- Supports GET /api/session/:id (ordered conversation replay).
create index if not exists messages_session_id_sequence_idx
  on public.messages (session_id, sequence);

-- evaluations: exactly one scoring/feedback record per completed practice_sessions.
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.practice_sessions(id) on delete cascade,
  overall_score int not null,
  rapport int not null,
  business_discovery int not null,
  confidence int not null,
  handling_objections int not null,
  value_selling int not null,
  closing int not null,
  summary text not null,
  strengths jsonb not null,
  weaknesses jsonb not null,
  missed_opportunities jsonb not null,
  better_responses jsonb not null,
  next_practice_focus jsonb not null,
  created_at timestamptz not null default now()
);

-- The UNIQUE(session_id) constraint above already creates a unique btree index on session_id,
-- which satisfies the evaluations(session_id) lookup index -- no separate index is added here
-- to avoid a redundant duplicate index (see docs/DATABASE.md).

-- business_profiles: seed archetype templates (not per-session data). services/profileGenerator.js
-- reads a row for the requested business_type and randomizes budget/pain_points/objections within
-- it (harder difficulty -> lower budget / more objections / more skeptical personality) to produce
-- the per-session business_profile jsonb snapshot stored on practice_sessions.
create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  business_type text not null check (business_type in (
    'coffee_shop', 'barbershop', 'salon', 'restaurant', 'gym',
    'dental_clinic', 'laundry_shop', 'convenience_store', 'hardware_store', 'bakery'
  )),
  personality text not null,
  technology_level text not null,
  budget int not null,
  pain_points jsonb not null,
  marketing_channels jsonb not null,
  allowed_objections jsonb not null,
  created_at timestamptz not null default now()
);

-- handle_new_user: auto-creates a public.profiles row whenever a new auth.users row is inserted
-- (i.e. on every Supabase Auth signup). SECURITY DEFINER is required because this runs during
-- the signup transaction before any RLS-friendly session context exists for public.profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
