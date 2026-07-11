import styles from './StatCard.module.css';

/** Compact stat tile: label, big value, optional hint. */
function StatCard({ label, value, hint }) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}

export default StatCard;
