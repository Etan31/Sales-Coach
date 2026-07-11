// All functions take a request-scoped Supabase client (RLS-enforced) as the first arg.

const TABLE = 'practice_sessions';

export async function createSession(sb, { userId, businessType, difficulty, contactMethod, language, businessProfile }) {
  const { data, error } = await sb
    .from(TABLE)
    .insert({
      user_id: userId,
      business_type: businessType,
      difficulty,
      contact_method: contactMethod,
      language,
      business_profile: businessProfile
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSessionById(sb, id) {
  const { data, error } = await sb.from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

// Paginated listing for GET /api/history, joined with each session's overall_score.
export async function listSessions(sb, { page, pageSize }) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await sb
    .from(TABLE)
    .select(
      'id, business_type, difficulty, contact_method, language, status, created_at, ended_at, evaluations(overall_score)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function updateSessionStatus(sb, id, { status, endedAt }) {
  const patch = { status };
  if (endedAt !== undefined) patch.ended_at = endedAt;

  const { data, error } = await sb.from(TABLE).update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// All sessions with their evaluation scores (if any), for statistics aggregation.
export async function listSessionsWithEvaluations(sb) {
  const { data, error } = await sb
    .from(TABLE)
    .select(
      'id, status, created_at, evaluations(overall_score, rapport, business_discovery, confidence, handling_objections, value_selling, closing)'
    )
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}
