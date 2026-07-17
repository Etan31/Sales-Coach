import { useCallback, useEffect, useRef } from 'react';
import Button from '../../components/Button/Button.jsx';
import styles from './PendingTurnBar.module.css';

const MAX_COMPOSER_PX = 160;

/**
 * The seller's turn while they are still assembling it, shared by the voice and text
 * paths. Spoken text lands here as it is recognized and stays editable, so a
 * mis-transcription can be fixed and a late thought typed in before the turn is sent.
 *
 * Enter sends and Shift+Enter inserts a newline, which is why this is a textarea: the
 * single-line input it replaces could not hold a newline, so every Enter submitted.
 *
 * @param {{
 *   pendingTurn: ReturnType<typeof import('../../hooks/usePendingTurn.js').usePendingTurn>,
 *   autoReply?: boolean,
 *   disabled?: boolean,
 *   placeholder?: string
 * }} props
 */
function PendingTurnBar({ pendingTurn, autoReply = true, disabled = false, placeholder = 'Type your message...' }) {
  const { draft, setDraft, requestCommit, commitNow, discard, isArmed, secondsRemaining } = pendingTurn;
  const textareaRef = useRef(null);

  useEffect(() => {
    const element = textareaRef.current;
    // jsdom reports 0 here, which would otherwise collapse the box to 0px under test.
    if (!element || !element.scrollHeight) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, MAX_COMPOSER_PX)}px`;
  }, [draft]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key !== 'Enter') return;
      if (event.shiftKey) return;
      // An Enter that closes an IME candidate list is choosing a word, not sending.
      if (event.nativeEvent?.isComposing || event.keyCode === 229) return;
      event.preventDefault();
      requestCommit();
    },
    [requestCommit]
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      commitNow();
    },
    [commitNow]
  );

  const hasDraft = Boolean(draft.trim());

  return (
    <form className={styles.wrapper} onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        rows={1}
        className={styles.composer}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Message"
      />

      <div className={styles.actions}>
        {isArmed && (
          <span className={styles.countdown} aria-hidden="true">
            {secondsRemaining > 0 ? `Sending in ${secondsRemaining}s` : 'Sending...'}
          </span>
        )}
        {/* Mounted unconditionally so the region exists before its text changes, which is
            what assistive tech needs in order to announce at all. The ticking number is
            kept out of it: re-reading every second makes a screen reader unusable. */}
        <span className="visually-hidden" role="status">
          {isArmed ? 'Your turn is staged and will send automatically.' : ''}
        </span>
        <Button variant="ghost" onClick={discard} disabled={!hasDraft || disabled}>
          Clear
        </Button>
        <Button type="submit" disabled={!hasDraft || disabled} loading={disabled}>
          {isArmed ? 'Send now' : 'Send to coach'}
        </Button>
      </div>

      <p className={styles.hint}>
        {autoReply ? 'Enter sends' : 'Enter stages your turn, then click Send'} &middot; Shift + Enter adds a line
      </p>
    </form>
  );
}

export default PendingTurnBar;
