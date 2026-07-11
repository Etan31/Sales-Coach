# Activity Log

Format: date - summary - decision/outcome. Newest last.

## 2026-07-10 - Project bootstrap

- Initialized pnpm monorepo (client + server workspaces) for the AI Sales Coach app.
- Locked architecture decisions with the user:
  - Auth: Supabase Auth (managed) + `profiles` table + DB trigger. No custom password table.
  - Backend deploy: Vercel serverless (Express app exported from `api/index.js`).
  - Delivery: orchestrated milestones via parallel subagents (Opus orchestrator, Sonnet workers).
  - Language selection controls AI speech + evaluation output only; UI chrome stays English.
- Reconciliations: `/api/auth/*` handled by the frontend Supabase client (no backend proxy);
  RLS enforced via a per-request token-scoped Supabase client; `business_profiles` is a seed
  archetype table while the randomized per-session profile is snapshotted into
  `practice_sessions.business_profile` (jsonb); charts are hand-rolled SVG; Gemini evaluation
  uses schema-enforced JSON with a `GEMINI_MOCK` offline mode.
- Wrote `docs/contracts.md` as the single source of truth for all subagents.

## 2026-07-10 - Wave 2: backend domain + frontend pages

- Backend: implemented the full Express domain per `docs/contracts.md` -- `routes/` ->
  `controllers/` -> `services/` -> `repositories/`, Zod validation (`middleware/validate.js`),
  Supabase admin/user clients (`database/supabaseClient.js`), Supabase JWT auth middleware
  (`middleware/auth.js`), Pino logging, Helmet/CORS/rate limiting (`middleware/security.js`,
  `middleware/rateLimit.js`), and `gemini/geminiService.js` (roleplay + evaluation, both honoring
  `GEMINI_MOCK`). `src/app.js` exports a bare Express app (no `.listen`); `src/index.js` is the
  local dev entry; `api/index.js` re-exports the app as the Vercel serverless handler.
- Database: `supabase/migrations/0001_init.sql` (schema + `handle_new_user` trigger),
  `0002_rls.sql` (RLS on all 5 tables), `supabase/seed/business_profiles.sql` (10 archetypes).
  Documented in `docs/DATABASE.md`.
- Frontend: React Router pages for the full flow (`Login`, `Register`, `Dashboard`,
  `PracticeSetup`, `Conversation`, `Evaluation`, catch-all `NotFound`), `AuthContext` +
  `ProtectedRoute`, `services/api/` typed wrappers over `httpClient.js`, reusable components
  (`Button`, `Card`, `Modal`, `ChatBubble`, `ScoreCard`, `StatCard`, `Chart`, `ErrorPage`, ...),
  CSS Modules throughout.

## 2026-07-10 - Wave 3: tests, CI/CD, docs

- CI/CD: added `.github/workflows/ci.yml` -- single `ubuntu-latest` / Node 20 job: checkout,
  `pnpm/action-setup@v4` (reads the `packageManager` field), `actions/setup-node@v4` with
  `cache: 'pnpm'`, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm -r test` (with dummy
  `SUPABASE_URL`/`SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_MOCK: '1'` so config
  validation and Gemini calls stay offline in CI), then `pnpm --filter ./client build`. Triggers
  on push and PR to `main`; fails the pipeline on any lint/test/build failure.
- Docs: wrote `docs/API.md` (every endpoint from `docs/contracts.md` -- method, path, auth,
  request/response shapes, error codes, in the CLAUDE.md example format; notes that
  registration/login are client-side via the Supabase JS client and the backend only verifies the
  JWT); rewrote the top-level `README.md` (overview, architecture, folder structure, prerequisites,
  setup incl. env var table and DB migration pointer, local dev, testing, deployment, key endpoints
  table linking to `docs/API.md`).
- Noted for follow-up (out of scope for this wave): the checked-in root `.env` defines
  `SUPABASE_SERVICE_KEY`, but `server/src/config/index.js` actually requires
  `SUPABASE_SERVICE_ROLE_KEY` -- the README/API docs document the variable name the code actually
  reads (`SUPABASE_SERVICE_ROLE_KEY`); `.env` itself was left untouched (out of this agent's scope).
  Also, no `.env.example` file exists in this checkout -- README setup steps were written to have
  the user create `.env` directly rather than assume a template that isn't there.

## 2026-07-11 - Wave 3 test suite completed + Wave 4 integration (orchestrator)

- The Wave 3G test subagent hit the account session limit and terminated after creating the jest
  config/setup, `test-helpers/fakeSupabase.js`, and 5 server unit tests (profileGenerator,
  objectionLibrary, mappers, schemas, geminiService). The orchestrator finished the wave directly:
  - Added server service/integration tests: `chatService.test.js`, `evaluationService.test.js`,
    `statisticsService.test.js` (driving real repositories through the `fakeSupabase` chainable
    thenable), and `app.test.js` (supertest against the assembled app: health 200, config 200,
    protected route 401, unknown route 404). Added `import { jest }` to `fakeSupabase.js` for ESM.
  - Added the client test toolchain: `client/jest.config.cjs` (jsdom + babel-jest, CSS Modules ->
    identity-obj-proxy), `client/babel.config.cjs`, `client/src/setupTests.js`, and RTL tests for
    Button, ChatBubble, ErrorPage, Accordion, and the Login page (AuthContext mocked so the
    `import.meta.env` supabase client is never loaded under babel-jest).
- Fixes made during integration:
  - `server/src/config/index.js` now accepts `SUPABASE_SERVICE_KEY` as a fallback for
    `SUPABASE_SERVICE_ROLE_KEY`, resolving the earlier .env var-name mismatch (either name works).
  - `eslint.config.js` gained a `**/*.cjs` block (commonjs + node globals) so the jest/babel
    tooling configs lint cleanly.
- Final verification (all green): `pnpm lint` 0 errors/0 warnings; `pnpm -r test` = 88 passing
  (server 71, client 17); `pnpm --filter ./client build` succeeds. Full app runs offline via
  `GEMINI_MOCK=1`. Not committed (per CLAUDE.md no-auto-commit).

## 2026-07-11 - Migrated AI provider from Google Gemini to Groq

- Root cause of persistent real-Gemini 502/429s: every Google account/project tested (3 separate
  accounts, including a fresh AI Studio Build-published key) returned either
  `generate_content_free_tier_requests limit: 0` or a prepaid-credits-required error, even with
  billing attached and the Generative Language API enabled. Diagnosed as account-level, not
  fixable from code. User chose to switch providers to Groq (genuinely free tier, no prepay, no
  credit card, OpenAI-compatible API).
- Replaced `server/src/gemini/` (client.js, geminiService.js + test) with `server/src/ai/`
  (`client.js` using the `groq-sdk` package's `chat.completions.create`, `aiService.js` with the
  same mock-mode logic and public API unchanged: `generateOwnerReply`, `evaluateConversation`).
  JSON mode uses Groq's `response_format: { type: 'json_object' }` (no fixed-schema enforcement
  like Gemini's `responseSchema` - relies on the existing defensive `normalizeEvaluation()`
  clamping/coercion, which was already schema-agnostic).
- `prompts/roleplay.js`: `buildRoleplayContents` (Gemini `{role,parts}` shape) replaced with
  `buildRoleplayMessages` (OpenAI-compatible `{role,content}`, owner -> `assistant`, seller ->
  `user`); dropped the Gemini-specific "must start with user turn" trim (not required by
  chat-completions, and chatService always seeds history with a seller message first anyway).
- `prompts/evaluation.js`: removed the `@google/generative-ai` `SchemaType` import and the
  `EVALUATION_RESPONSE_SCHEMA` export (Groq has no schema-enforcement equivalent in use here).
- `config/index.js`: renamed `GEMINI_API_KEY/GEMINI_MODEL/GEMINI_MOCK` ->
  `GROQ_API_KEY/GROQ_MODEL/AI_MOCK` (env) and `geminiApiKey/geminiModel/geminiMock` ->
  `groqApiKey/groqModel/aiMock` (config object). Default model: `llama-3.3-70b-versatile`.
  `AI_MOCK` is provider-neutral by design so a future provider swap doesn't need another rename.
  `chatService.js`/`evaluationService.js` import paths updated to `../ai/aiService.js`.
- Updated all references across `jest.setup.js`, `ci.yml`, `docs/contracts.md`, `docs/API.md`,
  `docs/DATABASE.md`, `README.md`, `.env copy.example`. `server/package.json`: removed
  `@google/generative-ai`, added `groq-sdk` (resolved `^0.9.1`). Deleted the leftover temp
  `server/_validate-key.mjs` diagnostic script.
- `.env`: added `GROQ_API_KEY` (placeholder - user pastes their real key directly, not via chat,
  since two prior Gemini keys were already exposed in conversation and flagged for rotation),
  `GROQ_MODEL=llama-3.3-70b-versatile`, left `AI_MOCK=1` as the safe default until the user
  confirms their Groq key works.
- Verification: `pnpm --filter ./server test` and `pnpm lint` both green after the migration (see
  below for exact counts). Not committed (per CLAUDE.md no-auto-commit).

## 2026-07-11 - Cold-Call voice mode + local transcript library (orchestrated, frontend-only)

- Two parallel Sonnet subagents (Opus orchestrating) on disjoint files; no backend/prompt changes.
- Voice (Agent V): browser Web Speech API only, zero added requests (only the existing `/api/chat`
  Groq call per turn). New `client/src/hooks/useSpeechRecognition.js` (`{ language, onResult }` ->
  `{ isSupported, isListening, interimTranscript, error, start, stop, reset }`, callback delivers the
  final utterance since `onend` is event-driven), `useSpeechSynthesis.js` (`speak(text,{language})`,
  `cancel`), and `utils/speechLang.js` (`appLangToBcp47`: english->en-US, tagalog/taglish->fil-PH).
  New `pages/Conversation/VoiceInputBar.jsx` (mic button + live interim transcript + "type instead"
  fallback + unsupported-browser fallback). `Conversation.jsx`: extracted the send logic into a
  reusable `sendMessage(text)` (text form + voice bar share it), branches on
  `session.contactMethod === 'cold_call'`, speaks the owner reply when `!muted`, adds a mute toggle,
  cancels speech on unmount / End Conversation. All Web Speech access via `window.*` to satisfy
  eslint `no-undef`.
- Transcript/library (Agent T): `utils/transcript.js` (`formatTranscript`, `downloadTextFile`),
  `services/localTranscripts.js` (localStorage key `salescoach.transcripts`; `saveTranscript`/
  `getTranscripts`/`getTranscript`/`clearTranscripts`; dedupe by sessionId, newest-first, cap 50,
  all try/catch), `components/TranscriptModal/` (copyable textarea + Copy/Download/Close on the
  shared `Modal`). `Evaluation.jsx` now captures `messages` (was discarded), auto-saves the
  transcript once per session, and offers View/Copy/Download. `Dashboard.jsx` gained a "Saved
  Transcripts" card (count, recent list w/ View, Download all / Copy all / Clear). Nothing saved to
  the server - export/library is local-only per the user's requirement.
- Verification (all green): `pnpm lint` clean; `pnpm -r test` = 112 passing (server 71, client 41 -
  up from 17, +24 new tests incl. VoiceInputBar/useSpeechRecognition, transcript, localTranscripts,
  TranscriptModal); `pnpm --filter ./client build` succeeds. Not committed (per CLAUDE.md).
