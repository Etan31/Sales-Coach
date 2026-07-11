import * as sessionRepository from '../repositories/sessionRepository.js';

// [camelCase output key, snake_case evaluations column]
const SKILL_KEYS = [
  ['rapport', 'rapport'],
  ['businessDiscovery', 'business_discovery'],
  ['confidence', 'confidence'],
  ['handlingObjections', 'handling_objections'],
  ['valueSelling', 'value_selling'],
  ['closing', 'closing']
];

function round1(value) {
  return Math.round(value * 10) / 10;
}

// Normalizes the embedded evaluations join (object or one-item array) to a single row or null.
function extractEvaluation(row) {
  const evaluations = row.evaluations;
  if (!evaluations) return null;
  return Array.isArray(evaluations) ? evaluations[0] ?? null : evaluations;
}

export async function getStatistics(sb) {
  const sessions = await sessionRepository.listSessionsWithEvaluations(sb);

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.status === 'completed').length;

  const evaluatedCompleted = sessions
    .filter((s) => s.status === 'completed')
    .map((s) => ({ session: s, evaluation: extractEvaluation(s) }))
    .filter((s) => s.evaluation);

  const averageScore = evaluatedCompleted.length
    ? Math.round(
        evaluatedCompleted.reduce((sum, s) => sum + s.evaluation.overall_score, 0) / evaluatedCompleted.length
      )
    : 0;

  const skillAverages = SKILL_KEYS.reduce((acc, [camel, snake]) => {
    acc[camel] = evaluatedCompleted.length
      ? round1(evaluatedCompleted.reduce((sum, s) => sum + (s.evaluation[snake] ?? 0), 0) / evaluatedCompleted.length)
      : 0;
    return acc;
  }, {});

  // Sessions come from the repository ordered by created_at ascending, so this stays ascending.
  const scoreTrend = evaluatedCompleted.map(({ session, evaluation }) => ({
    date: new Date(session.created_at).toISOString().slice(0, 10),
    overallScore: evaluation.overall_score,
    sessionId: session.id
  }));

  return { totalSessions, completedSessions, averageScore, skillAverages, scoreTrend };
}
