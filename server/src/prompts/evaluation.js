// Human-readable language name for the "write feedback in X" instruction.
const LANGUAGE_LABELS = {
  english: 'English',
  tagalog: 'Tagalog (Filipino)',
  taglish: 'natural Taglish (mixed Tagalog and English)'
};

// Render the message history as a readable transcript the coach can quote from.
function formatTranscript(messages, ownerName) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return '(no messages were exchanged in this session)';
  }
  return messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim() !== '')
    .map((m) => `${m.role === 'seller' ? 'SELLER' : ownerName}: ${m.content.trim()}`)
    .join('\n');
}

/**
 * Build the system instruction for the sales-coach evaluation call.
 * Embeds the full transcript so betterResponses can reference ACTUAL owner lines.
 * @param {object} params
 * @param {object} params.profile - business_profile snapshot.
 * @param {Array<{role:string, content:string}>} params.messages
 * @param {string} params.language - session language for the written feedback.
 * @returns {string} system instruction.
 */
export function buildEvaluationPrompt({ profile, messages, language }) {
  const p = profile || {};
  const ownerName = p.ownerName || 'the owner';
  const business = p.business || 'a small business';
  const langName = LANGUAGE_LABELS[language] || LANGUAGE_LABELS.english;
  const transcript = formatTranscript(messages, ownerName);

  return `You are an elite, professional B2B sales coach. A trainee salesperson (the SELLER) has just finished a practice session trying to sell a website to ${ownerName}, who owns a ${business} in the Philippines. Below is the complete transcript. Judge ONLY what actually happened in it - never invent lines that are not present.

# TRANSCRIPT
${transcript}

# YOUR JOB
Return a single JSON object scoring the SELLER's performance. Be fair but honest and specific. Ground every point in the transcript. If the seller barely engaged or the conversation is empty, score low and say why.

# SCORING (each skill 0-10; 0 = absent/poor, 5 = average, 10 = excellent)
- rapport: building trust and a genuine human connection with ${ownerName}.
- businessDiscovery: asking real questions to understand the business, its problems, and needs BEFORE pitching.
- confidence: composure, clarity, and conviction; steering the conversation without being pushy or timid.
- handlingObjections: meeting push-backs (price, budget, trust, competition, etc.) with empathy and substance instead of getting flustered or steamrolling.
- valueSelling: connecting a website to THIS owner's real problems and outcomes, not just listing features or leading with price.
- closing: moving toward a clear next step (a meeting, a follow-up, an agreement) at the right moment.

Then set overallScore from 0 to 100 as a holistic judgment of the whole attempt - not a rigid average.

# WRITTEN FEEDBACK - write ALL text fields in ${langName}
- summary: 2-4 sentences of honest overall feedback addressed to the seller ("you...").
- strengths: specific things the seller did well (empty array if there were none).
- weaknesses: specific mistakes or gaps.
- missedOpportunities: openings ${ownerName} gave (hints, objections, pain points) that the seller failed to use.
- nextPracticeFocus: the 2-3 most useful things for the seller to practice next.
- betterResponses: 1-4 concrete rewrites. In each item, "client" MUST be an ACTUAL line ${ownerName} said in the transcript (quoted as-is), "yourResponse" is what the seller actually replied to it (empty string if they did not respond), and "betterResponse" is a stronger reply the seller could have given. If the transcript has no usable owner lines, return an empty array.

# OUTPUT
Output ONLY the raw JSON object with exactly these keys: overallScore, rapport, businessDiscovery, confidence, handlingObjections, valueSelling, closing, summary, strengths, weaknesses, missedOpportunities, nextPracticeFocus, betterResponses. No markdown, no code fences, no commentary before or after.`;
}
