// Maps snake_case DB rows to the camelCase API shapes in docs/contracts.md.

// Pulls the overall_score out of an embedded evaluations join, whichever shape
// PostgREST returned it as (single object or one-item array), or a flattened column.
function extractOverallScore(row) {
  if (row.overall_score !== undefined && row.overall_score !== null) return row.overall_score;
  const evaluations = row.evaluations;
  if (!evaluations) return null;
  const single = Array.isArray(evaluations) ? evaluations[0] : evaluations;
  return single?.overall_score ?? null;
}

// Builds the PUBLIC businessInfo subset only -- never budget/painPoints/allowedObjections.
function toBusinessInfo(profile) {
  const p = profile || {};
  return {
    business: p.business ?? null,
    ownerName: p.ownerName ?? null,
    ownerAge: p.ownerAge ?? null,
    personality: p.personality ?? null,
    technologyLevel: p.technologyLevel ?? null,
    hasWebsite: Boolean(p.website),
    hasFacebook: Boolean(p.facebook)
  };
}

export function toSessionObject(row) {
  return {
    id: row.id,
    businessType: row.business_type,
    difficulty: row.difficulty,
    contactMethod: row.contact_method,
    language: row.language,
    status: row.status,
    createdAt: row.created_at,
    endedAt: row.ended_at ?? null,
    businessInfo: toBusinessInfo(row.business_profile)
  };
}

export function toMessageObject(row) {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    sequence: row.sequence,
    createdAt: row.created_at
  };
}

export function toEvaluationObject(row) {
  return {
    id: row.id,
    sessionId: row.session_id,
    overallScore: row.overall_score,
    rapport: row.rapport,
    businessDiscovery: row.business_discovery,
    confidence: row.confidence,
    handlingObjections: row.handling_objections,
    valueSelling: row.value_selling,
    closing: row.closing,
    summary: row.summary,
    strengths: row.strengths ?? [],
    weaknesses: row.weaknesses ?? [],
    missedOpportunities: row.missed_opportunities ?? [],
    betterResponses: row.better_responses ?? [],
    nextPracticeFocus: row.next_practice_focus ?? [],
    createdAt: row.created_at
  };
}

export function toHistoryItem(row) {
  return {
    id: row.id,
    businessType: row.business_type,
    difficulty: row.difficulty,
    contactMethod: row.contact_method,
    language: row.language,
    status: row.status,
    createdAt: row.created_at,
    endedAt: row.ended_at ?? null,
    overallScore: extractOverallScore(row)
  };
}
