# Shared Contracts (Single Source of Truth)

Every subagent MUST follow these exact shapes. Do not invent alternative field names,
enum values, or response envelopes. If something is missing here, prefer the closest
existing convention over inventing a new one.

## Conventions

- ES Modules everywhere (`type: module`). Backend uses `async/await`, no `.then()` chains.
- Backend: controllers are thin; logic in `services/`; DB access in `repositories/`.
- Logging via Pino (`utils/logger.js`). No `console.log` in production code.
- Validation via Zod in `middleware/validate.js` + per-route schemas.
- Frontend: CSS Modules (`Component.module.css`), functional components, one per file.
- No secrets in `VITE_` vars. Server secrets stay server-side.

## Enum values (store the `value`, render the `label`)

| Field | Values |
|---|---|
| businessType | `coffee_shop` Coffee Shop, `barbershop` Barbershop, `salon` Salon, `restaurant` Restaurant, `gym` Gym, `dental_clinic` Dental Clinic, `laundry_shop` Laundry Shop, `convenience_store` Convenience Store, `hardware_store` Hardware Store, `bakery` Bakery |
| difficulty | `easy`, `medium`, `hard`, `impossible` |
| contactMethod | `walk_in` Walk-in, `cold_call` Cold Call, `messenger` Facebook Messenger, `email` Email |
| language | `english`, `tagalog`, `taglish` |
| session status | `active`, `completed`, `abandoned` (default `active`) |
| message role | `owner` (AI business owner), `seller` (the user practicing) |

Language controls only the AI's speech + the evaluation output language. App UI stays English.

## Database (Supabase / Postgres) — snake_case columns, RLS on every table

- `profiles`: `id uuid PK -> auth.users.id`, `email text`, `display_name text`, `created_at timestamptz`.
  RLS: user reads/updates own row. Auto-created by `handle_new_user` trigger on `auth.users` insert.
- `practice_sessions`: `id uuid PK`, `user_id uuid -> auth.users.id`, `business_type text`,
  `difficulty text`, `contact_method text`, `language text`, `status text default 'active'`,
  `business_profile jsonb` (full snapshot, see below), `created_at timestamptz`, `ended_at timestamptz null`.
  RLS: `auth.uid() = user_id` for all ops. Index `(user_id, created_at desc)`.
- `messages`: `id uuid PK`, `session_id uuid -> practice_sessions`, `role text check in ('owner','seller')`,
  `content text`, `sequence int`, `created_at timestamptz`. RLS via `EXISTS (session owned by auth.uid())`.
  Index `(session_id, sequence)`.
- `evaluations`: `id uuid PK`, `session_id uuid UNIQUE -> practice_sessions`, `overall_score int`,
  `rapport int`, `business_discovery int`, `confidence int`, `handling_objections int`,
  `value_selling int`, `closing int`, `summary text`, `strengths jsonb`, `weaknesses jsonb`,
  `missed_opportunities jsonb`, `better_responses jsonb`, `next_practice_focus jsonb`,
  `created_at timestamptz`. RLS via parent session ownership.
- `business_profiles` (SEED archetypes, not per-session): `id uuid PK`, `business_type text`,
  `personality text`, `technology_level text`, `budget int`, `pain_points jsonb`,
  `marketing_channels jsonb`, `allowed_objections jsonb`. RLS: read to any authenticated user, no writes.

### `business_profile` jsonb snapshot (stored on practice_sessions)

```json
{
  "business": "Coffee Shop",
  "ownerName": "Carlos",
  "ownerAge": 43,
  "personality": "Busy",
  "technologyLevel": "Low",
  "budget": 12000,
  "website": false,
  "facebook": true,
  "marketing": ["Facebook", "Word of Mouth"],
  "painPoints": ["Few repeat customers", "Walk-ins only", "Missed inquiries"],
  "allowedObjections": ["budget", "facebook", "trust", "maintenance"],
  "emotion": "Busy"
}
```

`budget`, `painPoints`, `allowedObjections` are HIDDEN from the client (they are what a good
salesperson must discover). They live in the jsonb + are used server-side in the roleplay prompt only.

## REST API — base path `/api`

Error envelope (all failures): `{ "error": string, "status": number, "timestamp": ISOstring }`.
Success envelopes are named objects as below. Auth = `Authorization: Bearer <supabase access token>`.

### GET /api/health  (no auth)
`{ "status": "ok", "timestamp": ISO }`

### GET /api/config  (no auth)
`{ "businessTypes": [{value,label}], "difficulties": [{value,label}], "contactMethods": [{value,label}], "languages": [{value,label}] }`

### GET /api/profile  (auth)
`{ "profile": { "id", "email", "displayName", "createdAt" } }`

### POST /api/session  (auth)
Body: `{ "businessType", "difficulty", "contactMethod", "language" }`
201: `{ "session": <SessionObject> }`

### GET /api/session/:id  (auth)
`{ "session": <SessionObject>, "messages": [<MessageObject>], "evaluation": <EvaluationObject> | null }`

### POST /api/chat  (auth, rate-limited)
Body: `{ "sessionId", "message" }` (message: 1..2000 chars)
200: `{ "message": <MessageObject with role "owner"> }`
Errors: 400 invalid, 404 not found, 409 session not active, 429 rate limited.

### POST /api/end-session  (auth, rate-limited)
Body: `{ "sessionId" }`
200: `{ "evaluation": <EvaluationObject> }`  (sets session.status = 'completed', ended_at)
Errors: 404 not found, 409 already completed / no messages.

### GET /api/history?page=1&pageSize=20  (auth)
`{ "sessions": [<HistoryItem>], "page", "pageSize", "total" }`

### GET /api/statistics  (auth)
```json
{
  "totalSessions": 12, "completedSessions": 9, "averageScore": 74,
  "skillAverages": { "rapport": 7.2, "businessDiscovery": 6.1, "confidence": 7.8,
                     "handlingObjections": 6.9, "valueSelling": 6.4, "closing": 5.7 },
  "scoreTrend": [{ "date": "2026-07-01", "overallScore": 68, "sessionId": "..." }]
}
```

### Response objects (camelCase to the client; repositories map snake_case -> camelCase)

SessionObject:
```json
{
  "id", "businessType", "difficulty", "contactMethod", "language",
  "status", "createdAt", "endedAt",
  "businessInfo": {
    "business": "Coffee Shop", "ownerName": "Carlos", "ownerAge": 43,
    "personality": "Busy", "technologyLevel": "Low", "hasWebsite": false, "hasFacebook": true
  }
}
```
`businessInfo` is the PUBLIC subset only (never budget/painPoints/allowedObjections).

MessageObject: `{ "id", "role", "content", "sequence", "createdAt" }`

HistoryItem: `{ "id", "businessType", "difficulty", "contactMethod", "language", "status", "createdAt", "endedAt", "overallScore": number|null }`

EvaluationObject:
```json
{
  "id", "sessionId", "overallScore",
  "rapport", "businessDiscovery", "confidence", "handlingObjections", "valueSelling", "closing",
  "summary",
  "strengths": ["..."], "weaknesses": ["..."], "missedOpportunities": ["..."],
  "betterResponses": [{ "client", "yourResponse", "betterResponse" }],
  "nextPracticeFocus": ["..."],
  "createdAt"
}
```

## Backend module contracts

- `src/app.js` default-exports a configured Express `app` (NO `.listen`). Mounts routes at `/api`,
  security headers, CORS, pino-http, rate limiters, and the central error handler LAST.
- `src/index.js` imports `app` and calls `app.listen(config.port)` for local dev.
- `config/index.js` default-exports a validated config object (loads root `.env` via dotenv):
  `{ nodeEnv, port, corsOrigin, supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey,
     geminiApiKey, geminiModel, geminiMock (bool), aiRateLimit: { windowMs, max } }`.
- `middleware/auth.js` `requireAuth`: verify Supabase JWT (admin client `auth.getUser(token)`),
  set `req.user = { id, email }` and `req.supabase` = token-scoped client (RLS enforced). 401 on failure.
- `database/supabaseClient.js`: `getAdminClient()` (service role, server-only) and
  `getUserClient(accessToken)` (anon key + Authorization header so RLS applies).
- `gemini/geminiService.js` exports:
  - `generateOwnerReply({ profile, messages, difficulty, language, contactMethod }) -> string`
  - `evaluateConversation({ profile, messages, language }) -> EvaluationObject (minus id/sessionId/createdAt)`
  Both honor `config.geminiMock` (return canned data, no network). `messages` are `{ role, content }`.
- `services/profileGenerator.js` `generateBusinessProfile(businessType, difficulty) -> business_profile jsonb`
  (randomized within the seed archetype for that businessType; harder difficulty -> lower budget / more
  objections / more skeptical personality).
- `services/objectionLibrary.js` exports the categorized EN/Tagalog objection bank keyed by category
  (`budget, facebook, trust, competition, need, maintenance, time, previous_experience, authority, price, risk`).

## Frontend service contracts (`client/src/services`)

- `supabaseClient.js`: `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)` default export.
- `auth.js`: `signUp({email,password,displayName})`, `signIn({email,password})`, `signOut()`,
  `getSession()`, `onAuthChange(cb)` — thin wrappers over the Supabase client.
- `httpClient.js`: `http.get(path, { params })`, `http.post(path, body)`. Reads base URL from
  `VITE_API_BASE_URL`. Attaches the current Supabase access token. Timeout ~30s. Throws
  `ApiError { status, message }`. Retries idempotent GETs once on network error.
- `services/api/`: `configApi.get()`, `profileApi.get()`, `sessionApi.create(payload)`,
  `sessionApi.get(id)`, `sessionApi.history({page,pageSize})`, `chatApi.send({sessionId,message})`,
  `sessionApi.end({sessionId})`, `statsApi.get()`.

## Frontend routes

`/login`, `/register`, `/` (Dashboard), `/practice/new` (PracticeSetup), `/session/:id` (Conversation),
`/session/:id/evaluation` (Evaluation), `*` (NotFound). Protected routes render `<AuthError code={401} />`
inline when there is no session. Root error boundary renders `<ServerError code={500} />`.
