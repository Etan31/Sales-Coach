import styles from './ScoreCard.module.css';

function getBand(ratio) {
  if (ratio >= 0.75) return 'good';
  if (ratio >= 0.5) return 'fair';
  return 'poor';
}

/** Skill score with a proportional bar, colored by band (good/fair/poor). */
function ScoreCard({ label, score, max = 10 }) {
  const clamped = Math.min(Math.max(score, 0), max);
  const ratio = max > 0 ? clamped / max : 0;
  const band = getBand(ratio);
  const percent = Math.round(ratio * 100);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.score}>
          {score}/{max}
        </span>
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.bar} ${styles[band]}`}
          style={{ width: `${percent}%` }}
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
