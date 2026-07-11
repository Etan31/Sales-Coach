# AI Sales Coach

Practice selling websites to a small business owner without the risk of a real pitch going wrong.
The app roleplays an AI business owner (coffee shop, barbershop, salon, restaurant, gym, and more)
with a randomized personality, budget, and set of objections, then — once you end the session —
runs a second AI pass that scores your performance and returns structured, actionable coaching
feedback as JSON (rapport, business discovery, confidence, handling objections, value selling,
closing, plus strengths/weaknesses/missed opportunities/better responses/next practice focus).

## Tech stack & architecture

- **Monorepo:** pnpm workspaces — `client/` (React + Vite) and `server/` (Node + Express),
  managed from the root `package.json`.
- **Frontend:** React 18, React Router, Vite, CSS Modules. Talks to Supabase directly for
  auth and to the backend for everything else.
- **Backend:** Express (ES Modules), thin controllers -> `services/` -> `repositories/`,
  Zod validation, Pino logging, Helmet + CORS + rate limiting. Exported as a plain `app`
  (no `.listen`) so it can run locally (`server/src/index.js`) or as a single Vercel
  serverless function (`api/index.js`).
- **Database & Auth:** Supabase (Postgres with Row Level Security on every table, and
  Supabase Auth for signup/login/session management).
- **AI:** Google Gemini, used in two distinct modes:
  1. **Roleplay mode** — generates the AI business owner's in-character reply during the chat.
  2. **Evaluation mode** — generates the structured JSON coaching evaluation once a session ends.
  Both modes support `GEMINI_MOCK=1` to return canned responses with no network call or API key,
  for offline development and CI.

```
Browser (React) --Supabase JS client--> Supabase Auth (signup/login/session)
       |
       |--HTTP (Bearer <supabase JWT>)--> Express API --> Supabase Postgres (RLS)
                                              |
                                              +--> Google Gemini (roleplay / evaluation)
```

## Folder structure

```
Sales_Coach/
  api/index.js              Vercel serverless entry (re-exports the Express app)
  client/                   React + Vite frontend
    src/
      pages/                Login, Register, Dashboard, PracticeSetup, Conversation, Evaluation
      components/           Reusable UI (Button, Card, Modal, ScoreCard, Chart, ErrorPage, ...)
      services/              supabaseClient, auth, httpClient, services/api (typed API calls)
      context/               AuthContext
  server/                  Express backend
    src/
      app.js                 Configured Express app (no .listen)
      index.js                Local dev entry (app.listen)
      config/                 Validated env config
      routes/ controllers/    Thin HTTP layer
      services/ repositories/ Business logic + Supabase data access
      gemini/ prompts/         Gemini client + roleplay/evaluation prompt builders
      middleware/               auth, validate, rateLimit, security, errorHandler
  supabase/
    migrations/               0001_init.sql (schema), 0002_rls.sql (RLS policies)
    seed/                     business_profiles.sql (10 business-type archetypes)
  docs/
    contracts.md              Single source of truth for shapes/enums used across the app
    DATABASE.md               Schema, RLS policies, migration/seed instructions
    API.md                    Full endpoint reference
    activity-log.md            Dated project history
  .github/workflows/ci.yml   Lint + test + build pipeline
  vercel.json                 Build/output config + API rewrites for Vercel
  .env                        Root env file (gitignored) shared by server + client (see below)
```

## Prerequisites

- Node.js >= 20
- pnpm (version pinned via the root `package.json` `packageManager` field)
- A [Supabase](https://supabase.com) project (Postgres + Auth) — or skip Gemini setup entirely
  and still exercise the DB layer against a real Supabase project
- A Google Gemini API key — **or** set `GEMINI_MOCK=1` to run the whole app (and the test suite)
  fully offline with canned AI responses

## Setup

1. Install dependencies from the repo root:

   ```bash
   pnpm install
   ```

2. Create a root `.env` file (this checkout does not ship a `.env.example` template — create
   `.env` directly using the variable list below) and fill in real values:

   ```bash
   # from the repo root
   New-Item .env -ItemType File   # Windows PowerShell
   # touch .env                   # macOS/Linux
   ```

   The server loads a single root `.env` via `dotenv`; Vite also reads it (`envDir: ".."` in
   `client/vite.config.js`) and exposes only the `VITE_`-prefixed keys to the browser bundle.
   Never commit `.env` — it's already in `.gitignore`.

   | Variable | Used by | Notes |
   |---|---|---|
   | `NODE_ENV` | server | `development` / `production` / `test` |
   | `API_PORT` | server | local dev port for Express (default `3001`) |
   | `CORS_ORIGIN` | server | allowed origin for the frontend (e.g. `http://localhost:5173`) |
   | `SUPABASE_URL` | server | Supabase project URL |
   | `SUPABASE_ANON_KEY` | server | Supabase anon/public key — used to build a token-scoped, RLS-respecting client per request |
   | `SUPABASE_SERVICE_ROLE_KEY` | server | Supabase service-role key — admin client, server-only, **never** exposed to the client |
   | `GEMINI_API_KEY` | server | Google Gemini API key (not required when `GEMINI_MOCK=1`) |
   | `GEMINI_MODEL` | server | Gemini model name (e.g. `gemini-2.0-flash`) |
   | `GEMINI_MOCK` | server | `1` to bypass real Gemini calls and use canned roleplay/evaluation responses |
   | `AI_RATE_LIMIT_WINDOW_MS` / `AI_RATE_LIMIT_MAX` | server | Rate limit window/max for `/api/chat` and `/api/end-session` |
   | `VITE_SUPABASE_URL` | client (public) | Same Supabase project URL, exposed to the browser |
   | `VITE_SUPABASE_ANON_KEY` | client (public) | Supabase anon key — safe to expose; RLS enforces access control, not secrecy of this key |
   | `VITE_API_BASE_URL` | client (public) | Base URL the frontend calls, e.g. `http://localhost:3001/api` |

   Any `VITE_`-prefixed variable ships to the browser bundle — never put a secret there. Server
   secrets (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) must only ever appear in the
   non-`VITE_` section.

3. Run the database migrations and seed data against your Supabase project — see
   **[docs/DATABASE.md](docs/DATABASE.md)** for the full step-by-step (SQL Editor or Supabase CLI
   options), table/RLS reference, and idempotency notes. In short:

   ```bash
   # via Supabase CLI, from the repo root
   supabase link --project-ref <your-project-ref>
   supabase db push
   supabase db execute --file supabase/seed/business_profiles.sql
   ```

## Running locally

```bash
pnpm dev            # runs client + server together
pnpm dev:client      # client only (Vite dev server)
pnpm dev:server      # server only (nodemon)
```

- Client: http://localhost:5173
- Server: http://localhost:3001 (API mounted at `/api`, e.g. http://localhost:3001/api/health)

Ports are fixed (`strictPort: true` in `client/vite.config.js`, `API_PORT` in `.env`) to avoid
monorepo dev-server collisions.

### Offline / no Gemini key

Set `GEMINI_MOCK=1` in `.env` to run the full roleplay + evaluation flow with canned Gemini
responses — no network call, no API key required. This is also how CI runs the test suite (see
below).

## Testing

```bash
pnpm test            # runs every workspace's tests (pnpm -r test)
pnpm test:server      # server only (Jest, ES Modules via NODE_OPTIONS=--experimental-vm-modules)
pnpm test:client      # client only (Jest + React Testing Library)
```

Client also has Playwright e2e specs (`pnpm --filter ./client e2e`). Lint everything with
`pnpm lint` (`pnpm lint:fix` to auto-fix).

## Deployment

Deployed as a single [Vercel](https://vercel.com) project:

- **Frontend:** static build of `client/` (`pnpm --filter ./client build` -> `client/dist`),
  served as the Vercel project's output directory.
- **Backend:** the Express app is exported as a single serverless function from `api/index.js`
  (`export default app` — Express apps are valid `(req, res)` handlers). `vercel.json` rewrites
  `/api/*` to `api/index.js` and everything else to `client/dist/index.html` (SPA fallback).
- **Database & Auth:** Supabase hosts Postgres and Auth — nothing database-related runs on
  Vercel; the serverless function only talks to Supabase over the network. No local-disk state
  is used anywhere in the backend, since the serverless filesystem is ephemeral.

Required environment variables on Vercel (Project Settings -> Environment Variables) — same
names/purposes as the local `.env` table above: `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_MOCK`, `CORS_ORIGIN`,
`AI_RATE_LIMIT_WINDOW_MS`, `AI_RATE_LIMIT_MAX`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`VITE_API_BASE_URL` (pointed at the deployed origin, e.g. `https://your-app.vercel.app/api`).

See **[docs/API.md](docs/API.md)** for the full endpoint reference and
**[docs/DATABASE.md](docs/DATABASE.md)** for the schema/RLS/migrations this deployment depends on.

CI (`.github/workflows/ci.yml`) runs on every push/PR to `main`: install, lint, test (with
`GEMINI_MOCK=1` and dummy Supabase env vars so config validation passes without real secrets),
then build the client. The pipeline fails the build if any of those steps fail.

## Key API endpoints

Full detail (auth, request/response shapes, error codes) in **[docs/API.md](docs/API.md)**.
Registration/login are **not** backend routes — they go through the Supabase JS client directly;
the backend only verifies the resulting Supabase JWT.

| Method & Path | Auth | Purpose |
|---|---|---|
| `GET /api/health` | No | Liveness check |
| `GET /api/config` | No | Enum options for the Practice Setup form |
| `GET /api/profile` | Yes | Current user's profile |
| `POST /api/session` | Yes | Start a new practice session (generates a business profile) |
| `GET /api/session/:id` | Yes | Session detail + messages + evaluation (if ended) |
| `POST /api/chat` | Yes (rate-limited) | Send a seller message, get the AI owner's reply |
| `POST /api/end-session` | Yes (rate-limited) | End the session, get the AI coaching evaluation |
| `GET /api/history` | Yes | Paginated list of past sessions |
| `GET /api/statistics` | Yes | Aggregate skill averages + score trend |
