import { useId } from 'react';
import Button from '../../components/Button/Button.jsx';
import {
  PAUSE_ALLOWANCE_MIN_MS,
  PAUSE_ALLOWANCE_MAX_MS,
  PAUSE_ALLOWANCE_STEP_MS
} from '../../services/callPreferences.js';
import styles from './TurnSettings.module.css';

/**
 * Controls for how the seller's turn is handed to the owner: auto-send after a pause
 * versus an explicit send, how long that pause may run, and cold-call voice muting.
 *
 * @param {{
 *   autoReply: boolean,
 *   pauseAllowanceMs: number,
 *   onChange: (patch: { autoReply?: boolean, pauseAllowanceMs?: number }) => void,
 *   onActivity?: () => void,
 *   muted?: boolean,
 *   onToggleMute?: () => void,
 *   showMute?: boolean
 * }} props
 */
function TurnSettings({
  autoReply,
  pauseAllowanceMs,
  onChange,
  onActivity,
  muted = false,
  onToggleMute,
  showMute = false
}) {
  const sliderId = useId();

  const handlePauseChange = (event) => {
    // Adjusting the allowance is itself activity, so a countdown already running is
    // cancelled rather than being cut short by a value it never used.
    onActivity?.();
    onChange({ pauseAllowanceMs: Number(event.target.value) });
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={autoReply}
        onClick={() => onChange({ autoReply: !autoReply })}
      >
        {autoReply ? 'Auto-reply: On' : 'Auto-reply: Off'}
      </button>

      <div className={styles.pauseControl}>
        <label className={styles.pauseLabel} htmlFor={sliderId}>
          Pause allowance
        </label>
        <input
          id={sliderId}
          type="range"
          className={styles.slider}
          min={PAUSE_ALLOWANCE_MIN_MS}
          max={PAUSE_ALLOWANCE_MAX_MS}
          step={PAUSE_ALLOWANCE_STEP_MS}
          value={pauseAllowanceMs}
          onChange={handlePauseChange}
          disabled={!autoReply}
        />
        <output className={styles.pauseValue} htmlFor={sliderId}>
          {(pauseAllowanceMs / 1000).toFixed(1)}s
        </output>
      </div>

      {showMute && (
        <Button
          type="button"
          variant="secondary"
          onClick={onToggleMute}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute voice' : 'Mute voice'}
          className={styles.muteToggle}
        >
          {muted ? 'Unmute voice' : 'Mute voice'}
        </Button>
      )}
    </div>
  );
}

export default TurnSettings;
