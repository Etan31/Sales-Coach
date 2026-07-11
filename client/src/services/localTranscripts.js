// Local-only transcript library: persists formatted transcripts to localStorage so a
// seller can revisit/copy/download past conversations without any server round-trip.
// Entry shape: { sessionId, businessType, difficulty, contactMethod, endedAt, overallScore, text }

const STORAGE_KEY = 'salescoach.transcripts';
const MAX_ENTRIES = 50;

function readAll() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage unavailable or quota exceeded - silently skip persistence.
  }
}

/**
 * Saves a transcript entry, replacing any existing entry for the same `sessionId`.
 * Newest entries are kept first; the list is capped at the most recent 50. Never throws.
 */
export function saveTranscript(entry) {
  if (!entry?.sessionId) return;
  const deduped = readAll().filter((item) => item?.sessionId !== entry.sessionId);
  const next = [entry, ...deduped].slice(0, MAX_ENTRIES);
  writeAll(next);
}

/** Returns all saved transcripts, newest first. Returns `[]` on any failure. */
export function getTranscripts() {
  return readAll();
}

/** Returns the saved transcript entry for `sessionId`, or `null` if none exists. */
export function getTranscript(sessionId) {
  if (!sessionId) return null;
  const found = readAll().find((item) => item?.sessionId === sessionId);
  return found ?? null;
}

/** Removes all saved transcripts. Never throws. */
export function clearTranscripts() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable - nothing to clear.
  }
}
