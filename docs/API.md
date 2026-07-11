# API Documentation

Base path: **`/api`** (mounted by `server/src/app.js`; served locally by `server/src/index.js` on
`API_PORT`, and in production via the Vercel serverless entry `api/index.js` + `vercel.json`
rewrites).

> **Auth note:** Registration and login are handled entirely **client-side** via the Supabase JS
> client (`supabase.auth.signUp(...)`, `supabase.auth.signInWithPassword(...)` — see
> `client/src/services/auth.js`). There are **no** `POST /api/auth/*` routes on this backend. The
> backend's only job regarding auth is to verify the Supabase-issued JWT on protected routes
> (`middleware/auth.js`, `requireAuth`) and treat it as the source of truth for `req.user`.

## Authentication

Protected routes require:

```
Authorization: Bearer <supabase access token>
```

The token is the `access_token` from the client's current Supabase session
(`supabase.auth.getSession()`). The backend verifies it against Supabase (`auth.getUser(token)`);
on success it sets `req.user = { id, email }` and a token-scoped Supabase client (`req.supabase`)
so all downstream queries are subject to Postgres RLS. An invalid or missing token returns `401`.

## Error envelope

Every error response (any endpoint, any status code) uses the same shape:

```json
{ "error": "Invalid email", "status": 400, "timestamp": "2024-01-10T10:00:00Z" }
```

- `error` — human-readable message (safe to display; no stack traces or internal paths).
- `status` — the HTTP status code, duplicated in the body for convenience.
- `timestamp` — ISO 8601 timestamp of when the error was generated.

## Enum values referenced below

See `docs/contracts.md` for the canonical list. Store the `value`, render the `label` client-side.

| Field | Values |
|---|---|
| `businessType` | `coffee_shop`, `barbershop`, `salon`, `restaurant`, `gym`, `dental_clinic`, `laundry_shop`, `convenience_store`, `hardware_store`, `bakery` |
| `difficulty` | `easy`, `medium`, `hard`, `impossible` |
| `contactMethod` | `walk_in`, `cold_call`, `messenger`, `email` |
| `language` | `english`, `tagalog`, `taglish` |
| session `status` | `active`, `completed`, `abandoned` (default `active`) |
| message `role` | `owner` (AI business owner), `seller` (the user practicing) |

---

## Endpoints

### GET /api/health

```
Auth: Not required
Query: none
Response: { "status": "ok", "timestamp": ISO string }
Errors: 500 (server error)
```

### GET /api/config

```
Auth: Not required
Query: none
Response: {
  "businessTypes": [{ "value", "label" }],
  "difficulties": [{ "value", "label" }],
  "contactMethods": [{ "value", "label" }],
  "languages": [{ "value", "label" }]
}
Errors: 500 (server error)
```

Used by the frontend to populate the Practice Setup form's dropdowns without hardcoding enum
labels on the client.

### GET /api/profile

```
Auth: Required (Supabase JWT)
Query: none
Response: { "profile": { "id", "email", "displayName", "createdAt" } }
Errors: 401 (missing/invalid token), 404 (profile row not found), 500 (server error)
```

### POST /api/session

```
Auth: Required (Supabase JWT)
Body: { "businessType", "difficulty", "contactMethod", "language" }
Response: 201 { "session": <SessionObject> }
Errors: 400 (invalid businessType/difficulty/contactMethod/language), 401 (unauthenticated), 500 (server error)
```

Generates a randomized `business_profile` snapshot server-side (`services/profileGenerator.js`)
based on the requested `businessType` and `difficulty`, and stores it on the new
`practice_sessions` row. The hidden fields (`budget`, `painPoints`, `allowedObjections`) are never
returned to the client — see `SessionObject` below.

### GET /api/session/:id

```
Auth: Required (Supabase JWT)
Params: { "id": session uuid }
Response: { "session": <SessionObject>, "messages": [<MessageObject>], "evaluation": <EvaluationObject> | null }
Errors: 400 (malformed id), 401 (unauthenticated), 404 (not found / not owned by caller), 500 (server error)
```

`evaluation` is `null` until the session has been ended via `POST /api/end-session`.

### POST /api/chat

```
Auth: Required (Supabase JWT), rate-limited
Body: { "sessionId", "message" } (message: 1..2000 chars)
Response: 200 { "message": <MessageObject with role "owner"> }
Errors: 400 (invalid body / message length), 401 (unauthenticated), 404 (session not found), 409 (session not active), 429 (rate limited / AI provider quota exhausted), 500 (server error), 502 (AI upstream failure)
```

Persists the seller's message, calls `ai/aiService.js#generateOwnerReply` (mocked when
`AI_MOCK=1`), persists and returns the generated `owner` reply. Rate-limited per
`config.aiRateLimit` (`AI_RATE_LIMIT_WINDOW_MS` / `AI_RATE_LIMIT_MAX`).

### POST /api/end-session

```
Auth: Required (Supabase JWT), rate-limited
Body: { "sessionId" }
Response: 200 { "evaluation": <EvaluationObject> }
Errors: 400 (invalid body), 401 (unauthenticated), 404 (not found), 409 (already completed / no messages to evaluate), 429 (rate limited / AI provider quota exhausted), 500 (server error), 502 (AI upstream failure)
```

Calls `ai/aiService.js#evaluateConversation` (mocked when `AI_MOCK=1`), writes the
`evaluations` row, and sets `practice_sessions.status = 'completed'` and `ended_at = now()`.

### GET /api/history?page=1&pageSize=20

```
Auth: Required (Supabase JWT)
Query: { "page": number (default 1), "pageSize": number (default 20) }
Response: { "sessions": [<HistoryItem>], "page", "pageSize", "total" }
Errors: 400 (invalid page/pageSize), 401 (unauthenticated), 500 (server error)
```

Ordered newest-first via the `(user_id, created_at desc)` index on `practice_sessions`.

### GET /api/statistics

```
Auth: Required (Supabase JWT)
Query: none
Response: {
  "totalSessions": number, "completedSessions": number, "averageScore": number,
  "skillAverages": { "rapport", "businessDiscovery", "confidence", "handlingObjections", "valueSelling", "closing" },
  "scoreTrend": [{ "date", "overallScore", "sessionId" }]
}
Errors: 401 (unauthenticated), 500 (server error)
```

---

## Response objects

Backend repositories map snake_case DB columns to camelCase before these leave the API.

### SessionObject

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

`businessInfo` is the **public** subset only — `budget`, `painPoints`, and `allowedObjections`
are never sent to the client (they live only in the server-side roleplay prompt).

### MessageObject

```json
{ "id", "role", "content", "sequence", "createdAt" }
```

### HistoryItem

```json
{ "id", "businessType", "difficulty", "contactMethod", "language", "status", "createdAt", "endedAt", "overallScore": "number | null" }
```

### EvaluationObject

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

---

## See also

- `docs/contracts.md` — single source of truth for enums, DB shapes, and backend/frontend module
  contracts that this document mirrors.
- `docs/DATABASE.md` — table definitions, RLS policies, and migration/seed instructions for the
  Supabase Postgres schema backing these endpoints.
