// All functions take a request-scoped Supabase client (RLS-enforced) as the first arg.

const TABLE = 'evaluations';

export async function createEvaluation(sb, evaluation) {
  const {
    sessionId,
    overallScore,
    rapport,
    businessDiscovery,
    confidence,
    handlingObjections,
    valueSelling,
    closing,
    summary,
    strengths,
    weaknesses,
    missedOpportunities,
    betterResponses,
    nextPracticeFocus
  } = evaluation;

  const { data, error } = await sb
    .from(TABLE)
    .insert({
      session_id: sessionId,
      overall_score: overallScore,
      rapport,
      business_discovery: businessDiscovery,
      confidence,
      handling_objections: handlingObjections,
      value_selling: valueSelling,
      closing,
      summary,
      strengths,
      weaknesses,
      missed_opportunities: missedOpportunities,
      better_responses: betterResponses,
      next_practice_focus: nextPracticeFocus
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBySessionId(sb, sessionId) {
  const { data, error } = await sb.from(TABLE).select('*').eq('session_id', sessionId).maybeSingle();
  if (error) throw error;
  return data ?? null;
}
