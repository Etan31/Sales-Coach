import styles from './TypingIndicator.module.css';

/** Three animated dots indicating the AI owner is composing a reply. */
function TypingIndicator() {
  return (
    <div className={styles.wrapper} role="status">
      <span className="visually-hidden">Typing...</span>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.dot} aria-hidden="true" />
    </div>
  );
}

export default TypingIndicator;
