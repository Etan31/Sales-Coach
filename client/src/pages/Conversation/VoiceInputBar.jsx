import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '../../components/Button/Button.jsx';
import useSpeechRecognition from '../../hooks/useSpeechRecognition.js';
import styles from './VoiceInputBar.module.css';

/**
 * Cold-call mic input for the Conversation screen.
 *
 * Wraps `useSpeechRecognition`, which reports the finished utterance through its
 * `onResult(finalText)` callback (recognition completion is async/event-driven, so
 * there's no useful synchronous return value from stop()). When that callback fires we
 * forward the text to `onSend` and reset the recognizer for the next turn.
 *
 * Gracefully degrades: unsupported browsers get a permanent inline text form, and
 * supported browsers get a "Type instead" toggle for the same form.
 */
function VoiceInputBar({ onSend, disabled, language }) {
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [typedDraft, setTypedDraft] = useState('');

  // Holds the latest `reset` from the hook below so `handleFinalResult` (which is
  // itself passed *into* that hook call) can call it without a circular dependency.
  const resetRef = useRef(() => {});

  const handleFinalResult = useCallback(
    (finalText) => {
      if (!finalText) return;
      onSend(finalText);
      resetRef.current();
    },
    [onSend]
  );

  const { isSupported, isListening, interimTranscript, error, start, stop, reset } = useSpeechRecognition({
    language,
    onResult: handleFinalResult
  });

  useEffect(() => {
    resetRef.current = reset;
  }, [reset]);

  const handleMicClick = useCallback(() => {
    if (disabled) return;
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [disabled, isListening, start, stop]);

  const handleTypedSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const trimmed = typedDraft.trim();
      if (!trimmed || disabled) return;
      onSend(trimmed);
      setTypedDraft('');
    },
    [typedDraft, disabled, onSend]
  );

  const typeForm = (
    <form className={styles.typeForm} onSubmit={handleTypedSubmit}>
      <input
        type="text"
        className={styles.typeInput}
        value={typedDraft}
        onChange={(event) => setTypedDraft(event.target.value)}
        placeholder="Type your message..."
        disabled={disabled}
        aria-label="Message"
      />
      <Button type="submit" disabled={disabled || !typedDraft.trim()} loading={disabled}>
        Send
      </Button>
    </form>
  );

  if (!isSupported) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.unsupportedNote}>
          Voice input isn&apos;t supported in this browser. Type your message instead.
        </p>
        {typeForm}
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.micArea}>
        <div className={styles.micButtonWrap}>
          {isListening && <span className={styles.pulse} aria-hidden="true" />}
          <button
            type="button"
            className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
            onClick={handleMicClick}
            disabled={disabled}
            aria-label={isListening ? 'Stop recording' : 'Start recording'}
            aria-pressed={isListening}
          >
            <svg className={styles.micIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z"
              />
              <path
                fill="currentColor"
                d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.07A7 7 0 0 0 19 11Z"
              />
            </svg>
          </button>
        </div>
        <div className={styles.statusArea} role="status">
          {isListening ? interimTranscript || 'Listening...' : !error && 'Tap the mic to speak'}
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="button" className={styles.typeToggle} onClick={() => setShowTypeForm((prev) => !prev)}>
        {showTypeForm ? 'Hide text input' : 'Type instead'}
      </button>

      {showTypeForm && typeForm}
    </div>
  );
}

export default VoiceInputBar;
