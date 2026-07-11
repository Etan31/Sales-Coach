import { getAdminClient, getUserClient } from '../database/supabaseClient.js';
import { UnauthorizedError } from '../utils/errors.js';

// Verifies the Supabase access token and attaches req.user + a token-scoped req.supabase client.
export default async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedError('Missing bearer token');
    }

    const { data, error } = await getAdminClient().auth.getUser(token);

    if (error || !data?.user) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    req.user = { id: data.user.id, email: data.user.email };
    req.supabase = getUserClient(token);

    next();
  } catch (err) {
    next(err);
  }
}
