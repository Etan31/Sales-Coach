import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSession, onAuthChange, signIn, signOut, signUp } from '../services/auth.js';

const AuthContext = createContext(null);

/**
 * Provides { session, user, loading, signIn, signUp, signOut } to the app.
 * Initializes from the current Supabase session, then stays in sync via onAuthChange.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getSession().then((initialSession) => {
      if (isMounted) {
        setSession(initialSession);
        setLoading(false);
      }
    });

    const unsubscribe = onAuthChange((nextSession) => {
      if (isMounted) setSession(nextSession);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleSignIn = useCallback((credentials) => signIn(credentials), []);
  const handleSignUp = useCallback((payload) => signUp(payload), []);
  const handleSignOut = useCallback(() => signOut(), []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn: handleSignIn,
      signUp: handleSignUp,
      signOut: handleSignOut
    }),
    [session, loading, handleSignIn, handleSignUp, handleSignOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the current auth state and actions. Must be used within AuthProvider. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
