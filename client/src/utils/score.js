/**
 * Score banding, shared by ScoreCard, ScoreDial and the Evaluation hero.
 * Callers pass the raw score plus its own scale (skills are 0-10, overall is 0-100).
 */
export function getScoreBand(score, max = 10) {
  if (!Number.isFinite(score) || !(max > 0)) return 'poor';
  const ratio = Math.min(Math.max(score, 0), max) / max;
  if (ratio >= 0.75) return 'good';
  if (ratio >= 0.5) return 'fair';
  return 'poor';
}

/** The six skills the evaluator scores, in the order they are shown. */
export const SKILLS = [
  { key: 'rapport', label: 'Rapport' },
  { key: 'businessDiscovery', label: 'Business Discovery' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'handlingObjections', label: 'Handling Objections' },
  { key: 'valueSelling', label: 'Value Selling' },
  { key: 'closing', label: 'Closing' }
];

export const SKILL_MAX = 10;
