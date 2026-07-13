import styles from './SalesCoachLogo.module.css';

/** In-app "S" monogram badge: rounded hexagon (score/level-badge shape), dark bg + bright accent letter (token-driven). */
function SalesCoachLogo({ size = 40, className = '' }) {
  return (
    <svg
      className={`${styles.logo} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Sales Coach logo"
    >
      <path
        d="M24.5,6.474 L28.5,13.402 Q30,16 28.5,18.598 L24.5,25.526 Q23,28.124 20,28.124 L12,28.124 Q9,28.124 7.5,25.526 L3.5,18.598 Q2,16 3.5,13.402 L7.5,6.474 Q9,3.876 12,3.876 L20,3.876 Q23,3.876 24.5,6.474 Z"
        className={styles.badge}
      />
      <text x="16" y="17" textAnchor="middle" dominantBaseline="central" className={styles.letter}>
        S
      </text>
    </svg>
  );
}

export default SalesCoachLogo;
