import { getScoreBand } from '../../utils/score.js';
import styles from './ScoreCard.module.css';

/**
 * Skill score with a proportional bar, colored by band (good/fair/poor).
 * `flush` drops the box so the score can sit as a row inside a parent panel.
 */
function ScoreCard({ label, score, max = 10, flush = false }) {
  const clamped = Math.min(Math.max(score, 0), max);
  const ratio = max > 0 ? clamped / max : 0;
  const band = getScoreBand(clamped, max);
  const percent = Math.round(ratio * 100);

  return (
    <div className={`${styles.card} ${flush ? styles.flush : ''}`}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.score}>
          {score}/{max}
        </span>
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.bar} ${styles[band]}`}
          style={{ transform: `translateX(${percent - 100}%)` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
    </div>
  );
}

export default ScoreCard;
