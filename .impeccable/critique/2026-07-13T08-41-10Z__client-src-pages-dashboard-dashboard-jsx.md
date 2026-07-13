---
target: client/src/pages/Dashboard/Dashboard.jsx
total_score: 22
p0_count: 0
p1_count: 3
timestamp: 2026-07-13T08-41-10Z
slug: client-src-pages-dashboard-dashboard-jsx
---
Method: dual-agent (A: aedd2a4726c26df08 · B: aeef8228eb98f9539)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | A single failed request (`Promise.all([statsApi.get(), sessionApi.history()])`) blanks the whole page, discarding whatever did load; the 20-session cap has no "more exist" signal. |
| 2 | Match Between System and Real World | 3 | Enum labels and dates read naturally throughout; no jargon found. |
| 3 | User Control and Freedom | 2 | On error, the only action is `<a href="/">Go home</a>` — but Dashboard's own route is `/`, so it's a confusing non-retry. |
| 4 | Consistency and Standards | 2 | Average Score and session-row scores render as flat, uncolored numbers, while identical score data gets full band-colored `ScoreDial`/`ScoreCard` treatment on Evaluation and Login. |
| 5 | Error Prevention | 3 | "Clear all" is properly modal-gated with an exact count and "can't be undone" copy; `handleCopyAllTranscripts`'s catch silently resets to idle with no feedback. |
| 6 | Recognition Rather Than Recall | 3 | Labels visible everywhere, no icon-only nav; undercut by the hard 20-session cap making older history unrecoverable. |
| 7 | Flexibility and Efficiency of Use | 1 | No keyboard shortcuts, no sort/filter/search or pagination on session history; only Transcripts gets bulk actions. |
| 8 | Aesthetic and Minimalist Design | 3 | Clean and restrained; the Score Trend card's unlabeled axis leaves a visible dead-space gap. |
| 9 | Error Recovery | 2 | Per-status copy is reasonably specific, but the single action is a generic "Go home" with no distinct Retry and no preserved partial data. |
| 10 | Help and Documentation | 1 | No contextual help anywhere — no explanation of how skill scores are computed, no tooltips. |
| **Total** | | **22/40** | **Acceptable — significant improvements needed before users are happy** |

## Anti-Patterns Verdict

**LLM assessment (Assessment A):** Not slop. `theme.css` is a genuine single-accent system with load-bearing comments explaining *why* choices were made (composited transforms, contrast-driven tinted panels), Space Grotesk + Inter is self-hosted with no Tailwind utility soup, no gradients, no glassmorphism. The composition, though, is the default agentic-dashboard template (stat-row → card-grid → line-chart → list) with no point of view distinguishing it from any other generated dashboard, and the Score Trend chart is where that shows most: a line with dots over a bare, unlabeled axis, `aria-label="line chart"` and nothing else.

**Deterministic scan (Assessment B):** CLI scan of `Dashboard.jsx`/`Dashboard.module.css` in isolation: **clean, 0 findings.** Live browser overlay on the full authenticated page found **1 anti-pattern**: `overused-font` — Space Grotesk (26% of text) + Inter (74% of text) both cross the detector's "commonly overused" threshold. This is a known, already-reviewed exception, not a new problem: this exact rule fired on `theme.css` earlier in this project's redesign work and was deliberately kept (see project memory `frontend-design-direction.md`) because it's the committed, self-hosted, system-wide brand pairing — changing it is out of scope for a single-page redesign per this task's own constraints. It's also likely not Dashboard's own finding at all: the CLI scan of Dashboard's isolated files was clean, so this measurement (which walks the whole rendered page, chrome included) probably originates in shared Layout/global typography, not in anything unique to this page.

**No overlay screenshots to view** (this was a console-log-based overlay check, not a screenshot-diff tool); Assessment A separately captured real screenshots at 1440×900 / 768×1000 / 390×844 for visual reference during its review.

## Overall Impression

The system underneath is genuinely well-built — real tokens, real restraint, real accessibility groundwork (text-labeled badges, a real focus-trapped Modal). What's missing is that the Dashboard doesn't yet *use* its own design system's best asset: the score-banding/`ScoreDial` treatment that makes Evaluation and Login's score displays legible at a glance is entirely absent here, on the one page whose whole job is "show me how I'm doing." The single biggest opportunity is closing that gap — the fix is largely reuse, not invention.

## What's Working

1. **A real token system, not a skin** — single-emerald-accent slate palette, self-hosted variable fonts, CSS comments documenting *why* (compositing, contrast) rather than just *what*.
2. **Correct empty/zero-state handling** — Skill Breakdown and Score Trend don't render until there's real data (`hasSkillAverages`, `trendData.length > 0`); zero-session/zero-transcript states get action-oriented copy with a CTA instead of a blank chart.
3. **Destructive-action handling on Transcripts** — "Clear" is modal-gated with an exact count and "can't be undone" copy, using a `Modal` with a real focus trap, Escape-to-close, and focus restore.

## Priority Issues

**[P1] Score Trend chart is functionally unlabeled**
- **What**: `Chart.jsx` computes a `label` per data point but never renders it; the chart's only accessible name is the generic `aria-label="line chart"` (confirmed live in the DOM).
- **Why it matters**: Score Trend exists to answer "am I improving?" — without axis labels, no user (sighted or screen-reader) can tell which point is which session/date.
- **Fix**: Render x-axis tick labels and replace the generic `aria-label` with a data-driven summary (e.g. "Score trend: 6 sessions from Jul 3 to Jul 13, ranging 40 to 78").
- **Suggested command**: `/impeccable clarify`

**[P1] Dashboard's own score data bypasses the app's score-band system**
- **What**: Average Score renders through plain `StatCard` (flat, uncolored), and each session row's score renders in plain `var(--sc-text)`. The same data type gets full `getScoreBand` color treatment plus a written verdict via `ScoreDial` on Evaluation and even in the Login feature preview.
- **Why it matters**: users can't tell a 40/100 session from a 72/100 session at a glance — the page built for "at a glance" status defeats its own purpose, and it's a direct inconsistency with the app's own established score utilities (`utils/score.js`).
- **Fix**: Route Average Score through `ScoreDial` (or at minimum `getScoreBand` coloring), and color-code each session row's score the same way.
- **Suggested command**: `/impeccable polish`

**[P1] Session history silently caps at 20 with no pagination or signal**
- **What**: `sessionApi.history({ page: 1, pageSize: 20 })` is called once with no follow-up, no "load more," no count shown.
- **Why it matters**: any user with 20+ sessions permanently loses access to older history with zero indication — this punishes the exact frequent-practice users the app is built to retain.
- **Fix**: Wire up real pagination/infinite scroll against the existing `page`/`pageSize` params, show a count ("Showing 20 of 47").
- **Suggested command**: `/impeccable optimize`

**[P2] Full-card hover implies a click target that mostly isn't there**
- **What**: `.sessionCard:hover` raises the entire card, but the only interactive element is the trailing Link — and `status === "abandoned"` rows render no link at all, so they get the clickable-looking hover with nothing to click.
- **Why it matters**: the hover visually promises the whole row is clickable; users will click the business name and get nothing, and abandoned sessions dead-end entirely.
- **Fix**: Make the whole card a real link/button when an action exists; drop hover elevation on rows that have none, or add a "View" action for abandoned sessions.
- **Suggested command**: `/impeccable harden`

**[P2] Partial-failure error handling nukes a working half of the page**
- **What**: `statsApi.get()` and `sessionApi.history()` run in one `Promise.all`; any single rejection replaces the whole Dashboard with a generic error page whose only action is "Go home" — pointing at the same route.
- **Why it matters**: a transient failure in either endpoint destroys a fully working half of the page for no reason.
- **Fix**: Catch the two calls independently and render whichever succeeded; give the failed section its own inline retry.
- **Suggested command**: `/impeccable harden`

## Persona Red Flags

**Alex (Impatient Power User)**
- Reaching "Continue" on an active session requires scrolling past 3 stat cards, a 6-row skill breakdown, and the unlabeled trend chart — the session list starts below the first 1440×900 viewport entirely.
- No sort, filter, or pagination on session history — with the account tested having 10 real sessions and a hardcoded cap of 20, there's no way to know if more exist or find one from a specific business type.
- `handleCopyAllTranscripts` fails completely silently on clipboard error — no visible feedback distinguishing success from failure.
- The only bulk actions anywhere live in the Transcripts panel; the session list, which holds the most items, has none.

**Sam (Accessibility-Dependent User)**
- The Score Trend chart's sole accessible name is "line chart" — a screen reader gets nothing else from this card.
- `StatCard`'s `.hint` text ("out of 100") uses `--sc-text-faint` (#94a3b8) on white — measured contrast ≈2.56:1, well under WCAG AA's 4.5:1 floor.
- A mid-visit auth error's only action is a link labeled "Go home" pointing at the page Sam is already on, with no "Retry"/"Sign in again" semantics for a screen reader to announce.
- Worth noting as a strength: badges are text-labeled (not color-only), and `ScoreCard`'s bar carries proper `role="progressbar"`/`aria-valuenow`.

## Minor Observations

- On 390px, "New Practice" + three stacked stat cards push the session list several screens further down than on desktop.
- `styles[`badge_${item.status}`] ?? ''` silently falls back to a base gray style for any unrecognized status — low risk today, worth a defensive check later.
- "Saved Transcripts" (local-device-only) sits beside "Previous Sessions" (server-backed) with only a copy hint distinguishing them; a user on a second device sees an empty transcript list next to a full session history with no visual cue explaining why.
- `Chart`'s point spacing is a function of data length only, not available width — a 2-point and a 20-point trend use identical per-point spacing logic at different absolute widths.
- Detector: full-page `overused-font` finding (Space Grotesk/Inter) is a pre-existing, deliberately accepted exception — see project memory. Not a Dashboard-scoped finding; likely originates in shared Layout chrome.

## Questions to Consider

- Average Score is the one number that answers "am I getting better?" — why does it get *less* visual weight than a single session's score? What would this page look like if the most important metric got the most attention instead of the least?
- If a user has 50 sessions, what does this page actually do today? Should Dashboard commit to "recent activity only" and point power users to a dedicated history view, instead of implying it shows everything?
- Do Skill Breakdown and Score Trend need full-size real estate on *every* visit before the session list, or are they an occasional-glance widget currently taxing the more common "come back and continue/check a result" visit?
