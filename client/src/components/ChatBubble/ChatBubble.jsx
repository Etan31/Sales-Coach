import styles from './ChatBubble.module.css';

function formatTimestamp(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Chat message bubble. role 'seller' aligns right (seller tokens), 'owner' aligns left (owner tokens). */
function ChatBubble({ role, content, timestamp }) {
  const isSeller = role === 'seller';
  const formattedTime = formatTimestamp(timestamp);

  return (
    <div className={`${styles.row} ${isSeller ? styles.rowSeller : styles.rowOwner}`}>
      <div className={`${styles.bubble} ${isSeller ? styles.seller : styles.owner}`}>
        <p className={styles.content}>{content}</p>
        {formattedTime && <time className={styles.timestamp}>{formattedTime}</time>}
      </div>
    </div>
  );
}

export default ChatBubble;
