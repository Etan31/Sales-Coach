# CLAUDE.md — Full Stack

Guidance for Claude Code working with code in this repository.

## Stack

- **Frontend:** React, Vite, HTML/CSS
- **Backend:** Node, Express
- **Database:** Supabase (Postgres + Auth)
- **Testing:** Jest (unit/integration), Playwright (e2e)
- **Infra / tooling:** pnpm, GitHub Actions
- **Hosting:** Vercel (frontend), Fly.io / AWS Amplify (backend/services)

Always use `pnpm` (not `npm` or `yarn`). Check `package.json` before adding any dependency.

## General Principles

- Generate concise, short solutions for new modules or code.
- KISS principle: Keep it simple, stupid.
- Watch for over-engineering and oversized files needing refactor.
- Watch for syntax/style mismatching the rest of the codebase.
- Watch for obvious bugs and logical flaws.
- Prioritize concise, precise code and documentation changes.
- No emojis or special characters in comments.
- Write activity-log.md in /docs to refer back if confused.
- Create a to-do list and run major changes by user first.
- Review existing files before refactoring or major changes.
- Markdown files use kebab naming (e.g., some-description-changes.md).
- Don't auto-commit activity logs and docs.

## Code Quality

### General Standards

- Use right data structures and algorithms for the problem.
- Don't expose data needlessly (least privilege principle).
- No external libraries unless absolutely necessary; check package.json for versions.
- Avoid redundancy unless it improves usability or maintainability.
- Comments: one-liner describing what the code does, keep it direct and actionable.
- No `console.log()` in production code; use proper logging (e.g., Winston, Pino).

### Backend (Express/Node.js)

- Organize code: `controllers/`, `routes/`, `models/`, `middleware/`, `services/`, `config/`, `utils/`.
- One controller per resource; keep controllers thin (delegate logic to services).
- Use async/await, not callbacks or `.then()` chains.
- Validate all inputs (query, params, body) before processing.
- Return consistent JSON responses with status codes and error messages.
- Use environment variables for all config (database URL, API keys, port, etc.).
- Error handling: catch errors in middleware, return meaningful error messages (avoid stack traces in production).
- Database queries: use the Supabase client with parameterized/query-builder calls (never string-concatenated SQL). All tables must have RLS (Row Level Security) enabled.

### Frontend (React + Vite)

- Organize code: `components/`, `pages/`, `hooks/`, `utils/`, `services/`, `assets/`, `validators/`, `helpers/`.
- One component per file; break large components into smaller, reusable pieces.
- Prefer functional components with hooks over class components.
- Memoize expensive computations and callbacks (`useMemo`, `useCallback`).
- Lazy load heavy components using `React.lazy()` and `Suspense`.
- Avoid prop drilling; use Context API for shared state (not Redux unless truly needed).
- Minimize re-renders: use dependency arrays correctly, avoid inline object/function creation in render.
- CSS: use CSS Modules; avoid inline styles.
- Use Vite env conventions: client-exposed vars must be prefixed `VITE_`; never put secrets in `VITE_` vars (they ship to the browser).
- No unused imports or dead code.

### Supabase Auth (Frontend + Backend)

- Frontend gets the session from the Supabase client; never hand-roll token parsing.
- Guard protected routes on the session state; render an inline auth error (401/403) when missing.
- Backend verifies the Supabase JWT on every protected route before trusting `user.id`.
- Never rely on client-side checks alone for authorization — enforce with RLS on the data layer.

### Error Pages & Status Codes

Reusable error/auth pages. Document the contract here so they get reused, not re-implemented.

For each project record:
- **Import path(s)** and convenience wrappers (`NotFound`, `ServerError`, `AuthError`).
- **Props / API** — prefer a single `code` prop so one component renders any status: `<ErrorPage code={404} />`.
- **Styling approach** — CSS Modules (`ErrorPage.module.css`) vs global CSS (`errors.css`); pick one per app and stay consistent.
- **Animation** — `motion/react` or `framer-motion` stagger entrance.

**Status codes to support (8):**

| Code | Name | Use Case |
|------|------|----------|
| 400 | Bad Request | Invalid form input, malformed requests |
| 401 | Unauthorized | Missing/expired Supabase session (render inline when auth fails) |
| 403 | Forbidden | User lacks permission / RLS denies (render inline when permission check fails) |
| 404 | Not Found | Route doesn't exist (auto-renders via catch-all route) |
| 500 | Server Error | Unhandled exceptions (catch in error boundary) |
| 502 | Bad Gateway | Upstream service down (API failure handler) |
| 503 | Service Unavailable | Maintenance mode (graceful shutdown) |
| 504 | Gateway Timeout | Request timeout (API response timeout) |

**Rendering patterns:**

404 (auto-routed):
```jsx
// Navigate to any non-existent route -> catch-all renders NotFound
```

401/403 (inline in components):
```jsx
if (!session) return <AuthError code={401} />
if (!permissions.includes('admin')) return <AuthError code={403} />
```

500/502/503/504 (error boundaries or API handlers):
```jsx
catch (error) {
  if (error.status === 503) return <ServerError code={503} />
  return <ServerError code={500} /> // fallback
}
```

### Logo & Favicon

Default theme for any new project's logo/favicon: a single-letter monogram badge, not an
abstract icon or mascot. Document the contract here so it's reused, not reinvented per project.

**Pattern:**
- **Shape:** a rounded-square "box" (not a circle), one letter — the project's initial —
  centered inside it. Corner radius roughly 25-30% of the box side (a squircle/app-icon feel,
  not a subtle rounded rect).
- **Colors:** near-black background with a visible hue cast (not pure black/gray — pick the
  brand's primary hue and darken it toward black), with the letter rendered in a bright
  accent/highlight color from the palette so it pops against the dark box. Avoid plain
  white-on-brand-color or brand-color-on-white; the dark-box-plus-highlight-letter combo reads
  as more premium and matches the reference apps this convention is based on.
- **Font:** use the project's single body/heading font (see the Fonts rule above), bold weight
  (700-800), not a hand-drawn vector glyph — a real `<text>` element renders more legibly at
  favicon sizes and stays consistent with the rest of the UI's type.
- **Two render targets, same design:**
  1. `public/favicon.svg` (or equivalent), referenced from `index.html`'s `<link rel="icon">`.
     This file renders **outside the page's CSS cascade** — it cannot use `var(--*)` custom
     properties or the page's `@font-face`. Hardcode the color values (snapshot the tokens) and
     use a safe system-font stack (e.g. `Arial, Helvetica, sans-serif`) instead of the webfont.
     **XML/SVG comments cannot contain a double hyphen (`--`) anywhere in them** — this silently
     breaks the file (invalid XML), which browsers handle by falling back to a default/blank
     icon with no visible error. If a comment needs to reference a CSS custom property, spell
     it out ("the nx accent token") rather than writing `var(--nx-accent)` literally in the
     comment.
  2. An in-app logo component (sidebar/header), which *does* run inside the page — use the real
     `var(--*)` tokens and the real webfont here so it's the source of truth and stays in sync
     with future palette changes automatically. The favicon is a manually-kept-in-sync snapshot
     of this component's design, not the other way around.
- **Contrast check both places:** if the app has a dark sidebar/header, make sure the badge's
  background is distinguishably darker or lighter than that surface — an identical dark shade
  will make the box's edges disappear and only the letter will read.
- **Favicon caching:** after changing `favicon.svg`, a normal or hard refresh often won't show
  the new icon — browsers cache favicons separately from the page. Verify by hitting the SVG's
  URL directly in a new tab, or an incognito window, before concluding a code change failed.

**Nexus Employee Portal (this project) — implemented record:**

- **Files:** `client/public/favicon.svg` (standalone, hardcoded hex) and
  `client/src/components/NexusLogo/NexusLogo.jsx` (in-app, `var(--nx-*)` tokens) — both draw
  the same "N" monogram and must be kept visually in sync by hand.
- **Colors:** background is `--nx-logo-bg` (`#060a18`, theme.css) — a new token scoped to the
  logo only (not a general surface color; do not reuse elsewhere). Letter is `--nx-accent`
  (`#38bdf8`), the existing highlight/accent token.
- **Font:** in-app uses `'Plus Jakarta Sans', sans-serif` (the app's one loaded font) at
  `font-weight: 800`; the standalone favicon falls back to `Arial, Helvetica, sans-serif` bold
  since it can't load the webfont outside the page context.
- **Shape:** `rx="9"` rounded rect on a 30x30 box inside a 32x32 viewBox (roughly 30% corner
  radius), letter centered via `text-anchor="middle"` + `dominant-baseline="middle"`.
- **Title:** `index.html`'s `<title>` was also updated to `Nexus Employee Portal` (was the
  generic scaffold default `employee-portal`) so the browser tab reads correctly next to the
  new favicon.

### Database (Supabase / Postgres)

- Use migrations for schema changes; never alter production directly.
- Index heavily-queried columns and foreign keys.
- Enable RLS (Row Level Security) on every table; write explicit policies for read/write per role.
- Avoid N+1 queries; use Supabase nested selects / joins or batch queries where possible.
- Keep relationships normalized; avoid storing redundant data.
- Use transactions (or Postgres functions/RPC) for multi-step operations.

## Documentation

### Code Comments

- One-line comments above complex logic explaining the "why," not the "what."
- JSDoc for public functions, exported components, and utilities.
- No documentation for obvious code (e.g., `const user = getUser();`).

### README

- Clear setup instructions (Node version, `pnpm install`, environment variables).
- How to start dev servers (frontend + backend) and run tests.
- Architecture overview (tech stack, folder structure).
- Key endpoints (API) and main features (frontend).

### API Documentation

- Document all endpoints: method, path, authentication, request body, response structure.
- Include example requests and responses.
- Document status codes: 200, 400, 401, 403, 404, 500, etc.
- Use comments in route files or maintain a separate `API.md`.

Example format:
```
POST /api/users
Auth: Required (Supabase JWT)
Body: { name, email, password }
Response: { id, name, email, createdAt }
Errors: 400 (invalid email), 409 (email exists), 500 (server error)
```

### Database Schema

- Maintain a `DATABASE.md` or inline comments in migration files.
- Document tables, columns, relationships, constraints, and indexes.
- Explain each RLS policy (who can read/write, under what condition).

## API Security & Endpoints

### Authentication & Authorization

- Use Supabase Auth (JWT); store the session via the Supabase client, not hand-rolled cookies.
- Validate the JWT on every protected backend route.
- Rely on Supabase refresh-token rotation for long-lived sessions.
- Never expose sensitive data in tokens (passwords, API keys, service-role key).
- Use role-based access control (RBAC), enforced with RLS policies.

### Input Validation

- Validate and sanitize all user inputs (query, params, body).
- Use Zod for schema validation (shared schemas between frontend validators and backend where practical).
- Reject requests with missing or malformed data early.
- Limit request payload size to prevent DoS attacks.

### Data Protection

- Use HTTPS only; reject HTTP requests.
- Let Supabase Auth handle password hashing; never store plaintext.
- Keep the Supabase service-role key server-side only — never ship it to the client or a `VITE_` var.
- Use RLS to prevent unauthorized data access.
- Encrypt sensitive fields at rest if needed (e.g., SSN, payment info).
- Set secure headers: `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`.

### Rate Limiting & DoS Prevention

- Implement rate limiting on auth endpoints (login, signup, password reset).
- Use middleware (e.g., express-rate-limit) to throttle requests.
- Set reasonable limits: 5 attempts per 15 minutes for login, etc.

### API Response Standards

- Return consistent error responses:
```json
{ "error": "Invalid email", "status": 400, "timestamp": "2024-01-10T10:00:00Z" }
```
- Never expose internal server paths, database structure, or stack traces.
- Use generic error messages for production (log details server-side).

## Frontend Efficiency

### Performance

- Lazy load routes using `React.lazy()` and Vite code splitting.
- Use dynamic imports for heavy libraries.
- Minimize bundle size: audit with `pnpm why <pkg>` / bundle analyzer, remove unused packages.
- Cache API responses with appropriate headers (e.g., `Cache-Control: max-age=300`).
- Optimize images: compress, use WebP, lazy load with `loading="lazy"`.

### State Management

- Keep state as close as possible to where it's used (local > Context > external store).
- Use Context for global state (auth session, theme, language) only.
- Avoid unnecessary state updates; use immutable updates.

### Network Requests

- Use a single HTTP client instance (Axios or Fetch with interceptors) that attaches the Supabase session token.
- Set request timeouts (default 10-30 seconds).
- Retry failed requests (with exponential backoff) for idempotent operations.
- Cache GET requests; invalidate on mutations.
- Show loading states and error messages to users.

### Rendering Optimization

- Use `React.memo()` for components that receive same props.
- Split large lists into paginated or virtualized components.
- Avoid large inline styles or object creation in render.
- Use `key` prop correctly in lists (never use index).

## Testing

### Backend (Jest)

- Unit tests for services and utilities.
- Integration tests for API endpoints (request to response validation).
- Test error cases and edge cases.
- Mock the Supabase client in unit tests; use a dedicated test project/schema for integration tests.
- Minimum coverage: 70% for critical paths.

### Frontend (Jest + React Testing Library)

- Unit tests for components and hooks.
- Test user interactions, not implementation details.
- Test error boundaries and fallback UIs.
- Avoid testing third-party library behavior.

### End-to-End (Playwright)

- Cover critical user flows (signup/login, core create-read-update-delete paths, checkout/booking, etc.).
- Run against a seeded test environment, not production.
- Keep e2e tests independent and idempotent; reset state between runs.
- Wire Playwright into CI (GitHub Actions) on PRs to main.

### Test File Naming

- Colocate unit tests: `component.test.jsx` next to `component.jsx`.
- Keep Playwright specs in a top-level `e2e/` (or `tests/e2e/`) directory.
- Use descriptive test names: `should render error message when API fails`.

## Environment & Deployment

### Environment Variables

- Define in `.env.example` (without sensitive values).
- Never commit `.env` to Git.
- Use different env files: `.env.local`, `.env.test`, `.env.production`.
- Client vars must be `VITE_`-prefixed and non-secret; secrets stay server-side.
- Required env vars: `NODE_ENV`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `API_PORT`.

### Local Development

- Provide setup instructions in README (`pnpm install`, then run each app).
- Keep each app's dev-server port fixed with `strictPort: true` in `vite.config` (avoids monorepo port collisions).
- Use nodemon or similar for backend auto-restart on changes.

### Production Deployment

- Frontend deploys to Vercel; backend/services to Fly.io or AWS Amplify.
- Validate all environment variables at startup.
- Use a health check endpoint (`GET /health`).
- Never store state on local disk for Fly.io / serverless targets — the filesystem is wiped on redeploy; persist to Supabase.
- Log errors and monitor uptime.
- CI/CD via GitHub Actions: run lint, Jest, and Playwright before deploying to main.

## Version Control

### Commits

- Commit after significant changes with clear, atomic messages.
- Use imperative mood: "Add user authentication" not "Added authentication".
- Reference issues: "Fix #42: Resolve login timeout".
- Keep commits focused; one feature or fix per commit.
- No auto-push; always review before pushing.

### Branches

- Use feature branches: `feature/user-auth`, `fix/login-timeout`, `docs/api-guide`.
- Keep branches short-lived (1-3 days).
- Require PR review before merging to main.

## AI Restrictions

### Data Privacy

- No customer personal data: names, emails, phone numbers, account numbers, transactions (unless approved exemption or mock data).
- No authentication credentials: passwords, API keys, tokens, connection strings, OAuth secrets, Supabase service-role key.
- No internal documentation or business logic that's confidential.

### Security

- Never hardcode secrets; always use environment variables.
- Don't generate code that bypasses security checks or RLS.
- Sanitize and validate all user inputs before storage or processing.
- Don't expose error messages that leak system information.

## Lessons Learned (Recurring Pitfalls)

Mined from `/docs/activity-log.md`. Each one already cost real time or a user-visible bug once — check against these before repeating the pattern.

### Third-party animation params don't always mean what they sound like
CountUp's `duration` prop was fed into a `useSpring` damping/stiffness formula — it shapes the physics but does **not** bound wall-clock time (springs are asymptotic, not time-bounded). Cutting the number twice didn't reliably shorten the visible finish time; the user had to report "still too long" twice before the real fix.
- **Recognize:** the user gives a hard numeric constraint ("under 1.5s total", "exactly N", "no more than X") for anything animated.
- **Instead:** before tuning a knob, check what it actually controls (read the type signature / library source). If the user's constraint is a hard bound, use a mechanism with a provable bound (a duration-based tween, e.g. `animate()`) instead of an approximated one (a spring). Do the arithmetic for the worst case (last staggered item, slowest branch) and state the guaranteed number back to the user.

### A "zero matches" search result is not proof of absence
The first emoji sweep used a Unicode-range regex that silently failed to match an astral-plane character (📞, U+1F4DE) in two files. Reported clean, then the user found one anyway.
- **Recognize:** you're about to declare a codebase-wide sweep "clean" (no more emoji, no more instances of X, no remaining references) based on a single regex/grep pass — especially involving Unicode, generated code, or anything the user has already caught you missing once.
- **Instead:** corroborate with a second, differently-shaped check (a broader range, a plain-text keyword search, or just reading the remaining candidate files directly) before reporting completeness. Astral-plane emoji specifically need a range like `\x{1F000}-\x{1FFFF}`, not just the BMP dingbat/symbol blocks.

### CSS Modules leak across pages via shared class names
Lazy-loaded page CSS persists after navigation. A generic class name defined in two different page stylesheets creates a load-order-dependent conflict, not a source-order one. One audit found dual `.badge`, dual `.filter-bar`, and a `.compact { min-width: 900px }` rule leaking onto an unrelated `.toggle-row.compact` because whichever page's CSS chunk loaded last won.
- **Recognize:** about to add or edit a CSS Modules rule with a short/generic class name (`.icon`, `.strip`, `.badge`, `.compact`, `.card`, `.dot`...) in a page-specific stylesheet.
- **Instead:** grep sibling page CSS files for the same class name first. If it's genuinely shared, put the rule in the shared stylesheet (`ui.css`/`global.css`, or `index.css`) instead of letting two page files each define their own version. When delegating this to a subagent, require it to search other pages for the same selector before assuming a fix is page-local.

### Refactors leave dead CSS and dead controls behind, silently
`.hours-row button` rules kept targeting elements that no longer existed after a refactor to time inputs — CSS doesn't error on a selector that matches nothing, it just quietly stops applying.
- **Recognize:** just changed an element's tag or structure (e.g., `<button>` → `<input>`, removed a wrapper div) in JSX.
- **Instead:** grep the paired CSS file for selectors referencing the old element/class immediately after the JSX change, not as an afterthought during some later unrelated audit.

### Ephemeral hosting breaks local-disk state assumptions
An OAuth token stored in `token.json` on local disk was invisible until an App Runner deployment plan surfaced that the filesystem is wiped on every redeploy.
- **Recognize:** any `fs.writeFileSync`/`readFileSync` used for state that must outlive a single process, on a target that is Fly.io, App Runner, Lambda, Amplify, or any other ephemeral/serverless host.
- **Instead:** move that state to Supabase (or equivalent) before it becomes a deploy-day surprise, not after.

### Don't auto-install a package whose identity you inferred yourself
Tried `npx ui-ux-pro-max-cli init` for a skill the user named but wasn't installed — the sandbox correctly blocked it because the exact package identity came from my own web search, not from the user.
- **Recognize:** about to run `pnpm dlx`/`npx`/`pip install`/similar for a tool the user referenced by a general name, where you had to search to find the actual package name.
- **Instead:** ask the user to confirm/run it themselves (`! <command>`), or fall back to a read-only equivalent (fetch its published docs) and say plainly that the real thing isn't installed.

### Monorepo dev servers need fixed, non-colliding ports
Two Vite apps both defaulted to port 5173; whichever grabbed it first silently served the other app's requests, producing a confusing "No routes matched" React Router error that looked like a routing bug.
- **Recognize:** debugging a routing/navigation error in a monorepo with multiple Vite/dev-server apps, especially a "route that should obviously exist doesn't match."
- **Instead:** check which app is actually listening on the port before touching routing code. Keep each app's port fixed and `strictPort: true` in its dev config.

### Resuming interrupted parallel subagents
A session-limit hit interrupted 5 of 6 parallel background subagents mid-edit. Resuming each with an explicit "re-check current file state before continuing" instruction (rather than just "continue") avoided duplicate or conflicting edits — every agent correctly detected what it had already applied. Keep doing this on any future multi-agent resume.

## Activity Log

- Record significant changes, decisions, and blockers in `/docs/activity-log.md`.
- Format: date, summary, decision/outcome.
- Reference this when returning to the codebase after gaps.
