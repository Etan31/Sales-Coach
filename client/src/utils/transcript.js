// Pure helpers for building and exporting a plain-text session transcript.
// No React, no localStorage - see services/localTranscripts.js for persistence.

/** Turns a snake_case enum value into a readable label, e.g. "walk_in" -> "Walk In". */
function formatEnumLabel(value) {
  if (!value || typeof value !== 'string') return '';
  return value
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Builds a readable, plain-text transcript for a practice session: a header block
 * (business, difficulty, contact method, date) followed by one line per message in
 * `sequence` order (`You: ...` for the seller, `<ownerName>: ...` for the owner).
 * Pure and defensive - never throws on missing/empty `session`/`messages`.
 */
export function formatTranscript(session, messages) {
  const business = session?.businessInfo?.business || 'Unknown Business';
  const ownerName = session?.businessInfo?.ownerName || 'Owner';
  const difficulty = formatEnumLabel(session?.difficulty) || 'Unknown';
  const contactMethod = formatEnumLabel(session?.contactMethod) || 'Unknown';
  const date = formatDate(session?.createdAt);

  const metaParts = [`Difficulty: ${difficulty}`, `Contact Method: ${contactMethod}`];
  if (date) metaParts.push(`Date: ${date}`);

  const header = [`Sales Coach Transcript - ${business}`, metaParts.join('  |  ')].join('\n');

  const sortedMessages = Array.isArray(messages)
    ? [...messages].sort((a, b) => (a?.sequence ?? 0) - (b?.sequence ?? 0))
    : [];

  if (sortedMessages.length === 0) {
    return `${header}\n\nNo messages recorded.`;
  }

  const lines = sortedMessages.map((message) => {
    const speaker = message?.role === 'seller' ? 'You' : ownerName;
    return `${speaker}: ${message?.content ?? ''}`;
  });

  return `${header}\n\n${lines.join('\n')}`;
}

/** Triggers a browser download of `text` as a file named `filename` (defensive: never throws). */
export function downloadTextFile(filename, text) {
  try {
    const blob = new window.Blob([text ?? ''], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'transcript.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch {
    // Browser API unavailable (e.g. no Blob/URL support) - nothing we can do locally.
  }
}
