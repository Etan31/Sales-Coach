import styles from './SalesCoachLogo.module.css';

/** In-app "S" monogram badge: rounded-square, dark bg + bright accent letter (token-driven). */
function SalesCoachLogo({ size = 32 }) {
  return (
    <svg className={styles.logo} width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Sales Coach logo">
      <rect x="1" y="1" width="30" height="30" rx="9" className={styles.badge} />
      <text x="16" y="17" textAnchor="middle" dominantBaseline="central" className={styles.letter}>
        S
      </text>
    </svg>
  );
}

export default SalesCoachLogo;
