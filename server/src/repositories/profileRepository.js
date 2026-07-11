// All functions take a request-scoped Supabase client (RLS-enforced) as the first arg.

const TABLE = 'profiles';

export async function getProfile(sb, userId) {
  const { data, error } = await sb.from(TABLE).select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data ?? null;
}
