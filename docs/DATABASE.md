# Database Schema (Supabase / Postgres)

Source of truth for shapes: `docs/contracts.md`. This document explains the tables, relationships,
constraints, indexes, RLS policies, and how to run the migrations/seed. Schema files live in:

- `supabase/migrations/0001_init.sql` -- extensions, tables, indexes, `handle_new_user` trigger.
- `supabase/migrations/0002_rls.sql` -- `enable row level security` + policies for all 5 tables.
- `supabase/seed/business_profiles.sql` -- archetype rows for `business_profiles` (10 business types).

## Extensions

- `pgcrypto` -- provides `gen_random_uuid()`, used as the default for every `uuid` primary key.

## Tables

### `profiles`

One row per Supabase Auth user. Auto-created by the `handle_new_user` trigger (see below); the
app does not insert into this table directly in normal operation.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, `references auth.users(id) on delete cascade` |
| `email` | `text` | not null |
| `display_name` | `text` | nullable |
| `created_at` | `timestamptz` | not null, default `now()` |

Relationships: `profiles.id -> auth.users.id` (cascade delete: deleting the auth user deletes the profile).

### `practice_sessions`

One roleplay session belonging to a user.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `uuid` | not null, `references auth.users(id) on delete cascade` |
| `business_type` | `text` | not null, `check in ('coffee_shop','barbershop','salon','restaurant','gym','dental_clinic','laundry_shop','convenience_store','hardware_store','bakery')` |
| `difficulty` | `text` | not null, `check in ('easy','medium','hard','impossible')` |
| `contact_method` | `text` | not null, `check in ('walk_in','cold_call','messenger','email')` |
| `language` | `text` | not null, `check in ('english','tagalog','taglish')` |
| `status` | `text` | not null, default `'active'`, `check in ('active','completed','abandoned')` |
| `business_profile` | `jsonb` | not null -- full snapshot (business, ownerName, ownerAge, personality, technologyLevel, budget, website, facebook, marketing, painPoints, allowedObjections, emotion). `budget`/`painPoints`/`allowedObjections` are hidden from the client; only used server-side in the roleplay prompt. |
| `created_at` | `timestamptz` | not null, default `now()` |
| `ended_at` | `timestamptz` | nullable -- set when the session completes |

Relationships: `practice_sessions.user_id -> auth.users.id` (cascade delete).

Index: `practice_sessions_user_id_created_at_idx` on `(user_id, created_at desc)` -- serves
`GET /api/history` (per-user session list, newest first).

### `messages`

One conversation turn (owner or seller) inside a `practice_sessions`.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `session_id` | `uuid` | not null, `references practice_sessions(id) on delete cascade` |
| `role` | `text` | not null, `check in ('owner','seller')` |
| `content` | `text` | not null (length 1..2000 enforced by Zod at the API layer, not the DB) |
| `sequence` | `int` | not null -- monotonic per-session ordering |
| `created_at` | `timestamptz` | not null, default `now()` |

Relationships: `messages.session_id -> practice_sessions.id` (cascade delete).

Index: `messages_session_id_sequence_idx` on `(session_id, sequence)` -- serves
`GET /api/session/:id` (ordered conversation replay).

### `evaluations`

Exactly one scoring/feedback record per completed `practice_sessions`.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `session_id` | `uuid` | not null, **unique**, `references practice_sessions(id) on delete cascade` |
| `overall_score` | `int` | not null |
| `rapport` | `int` | not null |
| `business_discovery` | `int` | not null |
| `confidence` | `int` | not null |
| `handling_objections` | `int` | not null |
| `value_selling` | `int` | not null |
| `closing` | `int` | not null |
| `summary` | `text` | not null |
| `strengths` | `jsonb` | not null (array of strings) |
| `weaknesses` | `jsonb` | not null (array of strings) |
| `missed_opportunities` | `jsonb` | not null (array of strings) |
| `better_responses` | `jsonb` | not null (array of `{client, yourResponse, betterResponse}`) |
| `next_practice_focus` | `jsonb` | not null (array of strings) |
| `created_at` | `timestamptz` | not null, default `now()` |

Relationships: `evaluations.session_id -> practice_sessions.id` (cascade delete, 1:1 via UNIQUE).

Index: the `unique (session_id)` constraint already creates a unique btree index on `session_id`,
which is what the `evaluations(session_id)` lookup needs -- no separate duplicate index is added.

### `business_profiles`

Seed archetype templates (not per-session data). `services/profileGenerator.js` reads a row for
the requested `business_type` and randomizes it (budget, pain points, objections, personality
tone) per session -- harder difficulty skews budget down and objections/skepticism up.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `business_type` | `text` | not null, `check in (...)` -- same 10 slugs as `practice_sessions.business_type` |
| `personality` | `text` | not null, free text (no enum -- not listed as an enum field in contracts.md) |
| `technology_level` | `text` | not null, free text. Seed uses `low`/`medium`/`high` for consistency; no CHECK enforced since contracts.md does not list it as an enum field. |
| `budget` | `int` | not null |
| `pain_points` | `jsonb` | not null (array of strings) |
| `marketing_channels` | `jsonb` | not null (array of strings) |
| `allowed_objections` | `jsonb` | not null (array of objection category keys: `budget`, `facebook`, `trust`, `competition`, `need`, `maintenance`, `time`, `previous_experience`, `authority`, `price`, `risk`) |
| `created_at` | `timestamptz` | not null, default `now()` |

No FK -- this table is independent reference data, not linked to any user or session.

> **Assumption:** contracts.md's `business_profiles` column list does not explicitly mention
> `created_at`, but the task's general rule ("uuid PKs default gen_random_uuid(), created_at
> timestamptz default now()") applies to all 5 tables, so it was added here too for consistency.

## Enum / CHECK constraints summary

Only the columns contracts.md defines as enums get a `CHECK`, using the value slug (not the label):

- `practice_sessions.business_type`, `business_profiles.business_type` -- 10 business type slugs.
- `practice_sessions.difficulty` -- `easy`, `medium`, `hard`, `impossible`.
- `practice_sessions.contact_method` -- `walk_in`, `cold_call`, `messenger`, `email`.
- `practice_sessions.language` -- `english`, `tagalog`, `taglish`.
- `practice_sessions.status` -- `active`, `completed`, `abandoned` (default `active`).
- `messages.role` -- `owner`, `seller`.

Numeric score columns on `evaluations` (`overall_score`, `rapport`, etc.) are plain `int` with no
range CHECK -- their valid ranges are an application/scoring concern (Gemini evaluation output),
not specified as an enum in contracts.md, so no range was invented here.

## `handle_new_user` trigger

Defined in `0001_init.sql` (grouped with schema/table setup, since it's tied to the lifecycle of
the `profiles` table rather than to any RLS policy):

```sql
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- Fires **after insert** on `auth.users` -- i.e. every time someone signs up via Supabase Auth.
- `security definer` is required: at signup time there is no RLS-friendly session for
  `public.profiles` yet, so the function must run with the privileges of its owner (bypassing RLS)
  to perform the insert.
- `display_name` falls back to the local part of the email (`split_part(email, '@', 1)`) when the
  client didn't pass `raw_user_meta_data->>'display_name'` at signup.

## Row Level Security (RLS)

RLS is enabled on all 5 tables in `0002_rls.sql`. Policies, in plain language:

### `profiles`
- **Select** (`profiles_select_own`): a user can read only the profile row whose `id` equals
  their own `auth.uid()`.
- **Update** (`profiles_update_own`): a user can update only their own row (`id = auth.uid()`
  both to find the row and to validate the new row).
- **Insert** (`profiles_insert_own`): a user can insert only a row where `id = auth.uid()`. In
  practice this path is rarely exercised because `handle_new_user` (SECURITY DEFINER) already
  creates the row; kept for completeness / manual inserts under a user's own session.

### `practice_sessions`
- **Select / Insert / Update / Delete** (`practice_sessions_*_own`): all four operations require
  `user_id = auth.uid()` -- a user can only see or modify their own sessions. Insert also
  validates the new row's `user_id` matches the caller via `with check`.

### `messages`
- **Select** (`messages_select_via_session`): allowed when a row exists in `practice_sessions`
  with `id = messages.session_id` and `user_id = auth.uid()` -- i.e. the caller owns the parent
  session.
- **Insert** (`messages_insert_via_session`): same ownership check, applied via `with check` to
  the row being inserted.
- No update/delete policy is defined -- messages are append-only from the API
  (`POST /api/chat` writes both the seller turn and the generated owner reply), so those
  operations are denied by default once RLS is enabled.

### `evaluations`
- **Select** (`evaluations_select_via_session`) / **Insert** (`evaluations_insert_via_session`):
  same "owns the parent session" pattern as `messages`, via `exists (select 1 from
  practice_sessions s where s.id = evaluations.session_id and s.user_id = auth.uid())`.
- No update/delete policy -- an evaluation is created once by `POST /api/end-session` and never
  edited afterward.

### `business_profiles`
- **Select** (`business_profiles_select_authenticated`): any authenticated caller
  (`auth.role() = 'authenticated'`) can read all rows -- this is shared reference data, not
  scoped per user.
- No insert/update/delete policy exists for any role. The seed data is loaded through a
  service-role connection (see below), which bypasses RLS entirely, so the app never needs (and
  is never granted) write access to this table.

## Running migrations + seed

### Option A -- Supabase SQL Editor (dashboard)

1. Open the project in the [Supabase dashboard](https://supabase.com/dashboard) -> **SQL Editor**.
2. Paste the contents of `supabase/migrations/0001_init.sql`, run it.
3. Paste the contents of `supabase/migrations/0002_rls.sql`, run it.
4. Paste the contents of `supabase/seed/business_profiles.sql`, run it. The SQL Editor runs as a
   privileged role, so it can write to `business_profiles` even though the app's anon/authenticated
   roles cannot.

### Option B -- Supabase CLI

```bash
# from the repo root, with the Supabase CLI installed and logged in
supabase link --project-ref <your-project-ref>

# apply pending migrations in supabase/migrations/ (0001 then 0002, in filename order)
supabase db push

# run the seed file against the linked project (service role, bypasses RLS)
supabase db execute --file supabase/seed/business_profiles.sql
```

If running fully locally (`supabase start`), `supabase/seed/business_profiles.sql` can also be
referenced from a top-level `supabase/seed.sql` (or run directly) so `supabase db reset` re-seeds
it automatically -- not configured here since only the 4 files in this task's scope were created.

Both migrations and the seed script are idempotent (`create table if not exists`, `create index
if not exists`, `drop policy if exists` + recreate, `on conflict (id) do update` for the seed
rows), so they are safe to re-run.
