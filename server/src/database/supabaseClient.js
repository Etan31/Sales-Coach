import { createClient } from '@supabase/supabase-js';
import config from '../config/index.js';

const baseAuthOptions = { persistSession: false, autoRefreshToken: false };

let adminClient;

// Service-role client: server-only, bypasses RLS. Never expose to the client.
export function getAdminClient() {
  if (!adminClient) {
    adminClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: baseAuthOptions
    });
  }
  return adminClient;
}

// Anon-key client scoped to a user's access token so RLS policies apply.
export function getUserClient(accessToken) {
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: baseAuthOptions,
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });
}
