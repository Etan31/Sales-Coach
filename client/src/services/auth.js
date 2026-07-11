import supabase from './supabaseClient.js';

/** Create an account; stores displayName in the Supabase user's metadata. */
export async function signUp({ email, password, displayName }) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } }
  });
}

/** Sign in with email + password. */
export async function signIn({ email, password }) {
  return supabase.auth.signInWithPassword({ email, password });
}

/** Sign out the current user. */
export async function signOut() {
  return supabase.auth.signOut();
}

/** Resolve the current session (or null) from the Supabase client. */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Subscribe to auth state changes. Returns an unsubscribe function. */
export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}
