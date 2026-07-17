import { useCallback, useEffect, useState } from 'react';
import { getCallPreferences, saveCallPreferences } from '../services/callPreferences.js';

/**
 * Reads the seller's call preferences once at mount and persists every change, so the
 * pause allowance and reply mode survive a reload.
 *
 * @returns {[
 *   { autoReply: boolean, pauseAllowanceMs: number, muted: boolean },
 *   (patch: { autoReply?: boolean, pauseAllowanceMs?: number, muted?: boolean }) => void
 * ]}
 */
export function useCallPreferences() {
  const [preferences, setPreferences] = useState(getCallPreferences);

  const update = useCallback((patch) => {
    setPreferences((previous) => ({ ...previous, ...patch }));
  }, []);

  // Persisted from an effect rather than inside the updater above: updaters must stay
  // pure (StrictMode double-invokes them).
  useEffect(() => {
    saveCallPreferences(preferences);
  }, [preferences]);

  return [preferences, update];
}

export default useCallPreferences;
