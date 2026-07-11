import styles from './Button.module.css';

/** Button with primary/secondary/ghost/danger variants plus loading + disabled states. */
function Button({ variant = 'primary', loading = false, disabled = false, type = 'button', className = '', children, ...rest }) {
  const variantClass = styles[variant] || styles.primary;
  const classes = [styles.button, variantClass, loading ? styles.loading : '', className].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading} {...rest}>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </button>
  );
}

export default Button;
