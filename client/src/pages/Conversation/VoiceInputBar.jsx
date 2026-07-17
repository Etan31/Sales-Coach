import { useCallback } from 'react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition.js';
import PendingTurnBar from './PendingTurnBar.jsx';
import styles from './VoiceInputBar.module.css';

/**
 * Cold-call mic input for the Conversation screen.
 *
 * The mic stays open across pauses: recognized speech flows into the shared pending turn
 * rather than being sent the moment the seller draws breath. Interim words are shown
 * beside the mic instead of in the composer, since they change several times a second and
 * would fight anyone editing the text.
 *
 * Falls back gracefully - the pending turn's text box is always present, so an
 * unsupported browser simply loses the mic rather than the screen.
 *
 * @param {{
 *   pendingTurn: ReturnType<typeof import('../../hooks/usePendingTurn.js').usePendingTurn>,
 *   language?: string,
 *   autoReply?: boolean,
 *   suspended?: boolean,
 *   disabled?: boolean
 * }} props
 */
function VoiceInputBar({ pendingTurn, language, autoReply = true, suspended = false, disabled = false }) {
  const { appendPart, noteActivity } = pendingTurn;

  const { isSupported, isListening, interimTranscript, error, start, stop } = useSpeechRecognition({
    language,
    suspended,
    onSegment: appendPart,
    onActivity: noteActivity
  });

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  if (!isSupported) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.unsupportedNote}>
          Voice input isn&apos;t supported in this browser. Type your message instead.
        </p>
        <PendingTurnBar pendingTurn={pendingTurn} autoReply={autoReply} disabled={disabled} />
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
            aria-label={isListening ? 'Stop recording' : 'Start recording'}
            aria-pressed={isListening}
          >
            <svg className={styles.micIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" />
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

      <PendingTurnBar
        pendingTurn={pendingTurn}
        autoReply={autoReply}
        disabled={disabled}
        placeholder="Say something, or type it here..."
      />
    </div>
  );
}

export default VoiceInputBar;
