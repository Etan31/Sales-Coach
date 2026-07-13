import { getScoreBand } from '../../utils/score.js';
import styles from './ScoreDial.module.css';

const STROKE = 10;

/** Radial score gauge. The arc sweeps from 12 o'clock and is colored by band (good/fair/poor). */
function ScoreDial({ score, max = 100, size = 168, label = 'Overall score' }) {
  const clamped = Math.min(Math.max(score, 0), max);
  const band = getScoreBand(clamped, max);
  const center = size / 2;
  const radius = center - STROKE / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / max);

  return (
    <div className={styles.dial} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label}: ${score} out of ${max}`}
      >
        <circle className={styles.track} cx={center} cy={center} r={radius} strokeWidth={STROKE} />
        <circle
          className={`${styles.arc} ${styles[band]}`}
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={STROKE}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ '--sc-dial-empty': circumference }}
        />
      </svg>
      <p className={styles.readout} aria-hidden="true">
        <span className={styles.score}>{score}</span>
        <span className={styles.max}>/{max}</span>
      </p>
    </div>
  );
}

export default ScoreDial;
