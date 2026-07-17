// Call preferences: persists how the seller wants their turn handed to the AI owner.
// `autoReply` picks between an auto-send countdown and an explicit send click;
// `pauseAllowanceMs` is how long a speaking/typing pause may run before an auto-send
// fires; `muted` mirrors the cold-call voice toggle.
// Shape: { autoReply: boolean, pauseAllowanceMs: number, muted: boolean }

const STORAGE_KEY = 'salescoach.callPrefs';

export const PAUSE_ALLOWANCE_MIN_MS = 1000;
export const PAUSE_ALLOWANCE_MAX_MS = 10000;
export const PAUSE_ALLOWANCE_STEP_MS = 500;

export const DEFAULT_CALL_PREFERENCES = {
  autoReply: true,
  pauseAllowanceMs: 3000,
  muted: false
};

function readRaw() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeRaw(prefs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage unavailable or quota exceeded - silently skip persistence.
  }
}

function toBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback;
}

// A non-numeric allowance would poison the countdown deadline arithmetic (NaN compares
// false against every bound, so the turn would fire on its first tick). Note this gate
// is `typeof` rather than `Number(value)`: coercion maps null to 0, which would clamp up
// to the minimum instead of falling back, and JSON.stringify writes NaN out as null.
function toPauseAllowance(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_CALL_PREFERENCES.pauseAllowanceMs;
  }
  return Math.min(PAUSE_ALLOWANCE_MAX_MS, Math.max(PAUSE_ALLOWANCE_MIN_MS, value));
}

function sanitize(raw) {
  return {
    autoReply: toBoolean(raw?.autoReply, DEFAULT_CALL_PREFERENCES.autoReply),
    pauseAllowanceMs: toPauseAllowance(raw?.pauseAllowanceMs),
    muted: toBoolean(raw?.muted, DEFAULT_CALL_PREFERENCES.muted)
  };
}

/**
 * Reads saved call preferences merged over the defaults. Unset, malformed, and
 * out-of-range values fall back to their default. Never throws.
 *
 * @returns {{ autoReply: boolean, pauseAllowanceMs: number, muted: boolean }}
 */
export function getCallPreferences() {
  return sanitize(readRaw());
}

/**
 * Merges `patch` into the saved preferences and persists the result. Never throws.
 *
 * @param {{ autoReply?: boolean, pauseAllowanceMs?: number, muted?: boolean }} patch
 * @returns {{ autoReply: boolean, pauseAllowanceMs: number, muted: boolean }} the saved preferences
 */
export function saveCallPreferences(patch) {
  const next = sanitize({ ...getCallPreferences(), ...patch });
  writeRaw(next);
  return next;
}
