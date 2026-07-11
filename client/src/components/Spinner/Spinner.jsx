import styles from './Spinner.module.css';

/** Loading spinner. size: 'sm' | 'md' | 'lg'. */
function Spinner({ size = 'md', label = 'Loading...' }) {
  const sizeClass = styles[size] || styles.md;
  return (
    <div className={`${styles.spinner} ${sizeClass}`} role="status">
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

export default Spinner;
