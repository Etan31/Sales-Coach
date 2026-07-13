import styles from './StatCard.module.css';

/** Compact stat tile: label, big value, optional hint. `band` ('good'|'fair'|'poor') colors the value for at-a-glance score legibility. */
function StatCard({ label, value, hint, band }) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.value} ${band ? styles[band] : ''}`}>{value}</span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}

export default StatCard;
