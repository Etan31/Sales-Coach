import { useEffect, useRef, useState } from 'react';
import styles from './Timer.module.css';

function formatElapsed(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Counts up and formats mm:ss. Pass `startTime` (Date/timestamp) to measure since a fixed
 * moment, or `running` (boolean) to accumulate elapsed time only while active.
 */
function Timer({ startTime, running = true }) {
  const [now, setNow] = useState(() => Date.now());
  const accumulatedRef = useRef(0);
  const runStartRef = useRef(running ? Date.now() : null);

  useEffect(() => {
    if (!running) return undefined;
    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [running]);

  useEffect(() => {
    if (running) {
      runStartRef.current = Date.now();
    } else if (runStartRef.current !== null) {
      accumulatedRef.current += Date.now() - runStartRef.current;
      runStartRef.current = null;
    }
  }, [running]);

  let elapsedMs;
  if (startTime) {
    elapsedMs = now - new Date(startTime).getTime();
  } else {
    elapsedMs = accumulatedRef.current + (running && runStartRef.current ? now - runStartRef.current : 0);
  }

  return (
    <span className={styles.timer} role="timer">
      {formatElapsed(elapsedMs / 1000)}
    </span>
  );
}

export default Timer;
