import { useCallback, useEffect, useRef, useState } from 'react';

const TICK_MS = 100;
const HOLD_RETRY_MS = 400;

/**
 * Holds the seller's turn while they are still assembling it, then commits it as a
 * single message.
 *
 * The backend persists exactly one seller message per POST /chat and answers it
 * immediately, so a turn the seller is still adding to has to be composed here on the
 * client and handed over once. That makes this hook the shared state machine behind both
 * input modes, which differ only in what signals "still going" and "done":
 *
 *   |            | voice                 | text            |
 *   | still going| interim speech result | keystroke       |
 *   | done       | finalized speech      | Enter           |
 *
 * In auto mode a finished part arms a countdown (the pause allowance) that any further
 * activity cancels and re-arms, so pausing mid-thought never sends. In manual mode no
 * timer is ever created and only `commitNow` sends.
 *
 * @param {{
 *   autoReply?: boolean,
 *   pauseAllowanceMs?: number,
 *   canCommit?: boolean,
 *   onCommit: (text: string) => void
 * }} options
 * @returns {{
 *   draft: string,
 *   setDraft: (next: string) => void,
 *   appendPart: (text: string, options?: { separator?: string }) => void,
 *   requestCommit: () => void,
 *   noteActivity: () => void,
 *   commitNow: () => void,
 *   discard: () => void,
 *   isArmed: boolean,
 *   secondsRemaining: number | null
 * }}
 */
export function usePendingTurn({ autoReply = true, pauseAllowanceMs = 3000, canCommit = true, onCommit } = {}) {
  const [draft, setDraftState] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(null);

  // `draft` is mirrored into a ref so commits can read it synchronously; see commitNow.
  const draftRef = useRef('');
  const autoReplyRef = useRef(autoReply);
  const pauseAllowanceRef = useRef(pauseAllowanceMs);
  const canCommitRef = useRef(canCommit);
  const onCommitRef = useRef(onCommit);
  const commitNowRef = useRef(() => {});

  useEffect(() => {
    autoReplyRef.current = autoReply;
    pauseAllowanceRef.current = pauseAllowanceMs;
    canCommitRef.current = canCommit;
    onCommitRef.current = onCommit;
  });

  const arm = useCallback(() => {
    setDeadline(Date.now() + pauseAllowanceRef.current);
  }, []);

  const disarm = useCallback(() => {
    setDeadline(null);
  }, []);

  const commitNow = useCallback(() => {
    setDeadline(null);
    const text = draftRef.current.trim();
    if (!text || !canCommitRef.current) return;
    // Cleared before onCommit and without waiting for a re-render: a double click, or a
    // second interval tick landing before React repaints, would otherwise read the stale
    // ref and send the same turn twice.
    draftRef.current = '';
    setDraftState('');
    onCommitRef.current?.(text);
  }, []);

  useEffect(() => {
    commitNowRef.current = commitNow;
  }, [commitNow]);

  // Turning auto-reply off means "nothing sends unless I say so", which has to include a
  // countdown that was already running when the seller flipped it.
  useEffect(() => {
    if (!autoReply) setDeadline(null);
  }, [autoReply]);

  // One interval against an absolute deadline: re-arming is a plain setDeadline (which
  // rebuilds this effect), the countdown cannot drift, and unmounting mid-countdown
  // clears the timer before it can ever commit.
  useEffect(() => {
    if (deadline === null) {
      setSecondsRemaining(null);
      return undefined;
    }

    const tick = () => {
      const remaining = deadline - Date.now();
      if (remaining > 0) {
        setSecondsRemaining(Math.ceil(remaining / 1000));
        return;
      }
      // Hold rather than drop: committing while a reply is in flight would be swallowed
      // by the caller's guard and lose the seller's words outright. Report 0 rather than
      // a re-rounded 1s, so the turn reads as due instead of perpetually one second away.
      if (!canCommitRef.current) {
        setSecondsRemaining(0);
        setDeadline(Date.now() + HOLD_RETRY_MS);
        return;
      }
      setDeadline(null);
      commitNowRef.current();
    };

    tick();
    const intervalId = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [deadline]);

  const appendPart = useCallback(
    (text, { separator = ' ' } = {}) => {
      const part = String(text ?? '').trim();
      if (!part) return;
      draftRef.current = draftRef.current ? `${draftRef.current}${separator}${part}` : part;
      setDraftState(draftRef.current);
      if (autoReplyRef.current) arm();
    },
    [arm]
  );

  // Enter finishes the seller's line; it does not decide when the owner answers. In
  // manual mode that decision is the seller's click alone, so an accidental Enter stages
  // the turn harmlessly and can still be added to.
  const requestCommit = useCallback(() => {
    if (autoReplyRef.current) arm();
  }, [arm]);

  const setDraft = useCallback(
    (next) => {
      draftRef.current = String(next ?? '');
      setDraftState(draftRef.current);
      disarm();
    },
    [disarm]
  );

  const discard = useCallback(() => {
    draftRef.current = '';
    setDraftState('');
    disarm();
  }, [disarm]);

  return {
    draft,
    setDraft,
    appendPart,
    requestCommit,
    noteActivity: disarm,
    commitNow,
    discard,
    isArmed: deadline !== null,
    secondsRemaining
  };
}

export default usePendingTurn;
