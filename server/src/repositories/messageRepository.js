// All functions take a request-scoped Supabase client (RLS-enforced) as the first arg.

const TABLE = 'messages';

export async function addMessage(sb, { sessionId, role, content, sequence }) {
  const { data, error } = await sb
    .from(TABLE)
    .insert({ session_id: sessionId, role, content, sequence })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listMessages(sb, sessionId) {
  const { data, error } = await sb
    .from(TABLE)
    .select('*')
    .eq('session_id', sessionId)
    .order('sequence', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function countMessages(sb, sessionId) {
  const { count, error } = await sb
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId);

  if (error) throw error;
  return count ?? 0;
}
