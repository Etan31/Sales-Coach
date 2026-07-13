import styles from './Skeleton.module.css';

function Line({ width = '100%' }) {
  return <span className={styles.line} style={{ '--sc-skeleton-w': width }} aria-hidden="true" />;
}

function Block({ className = '' }) {
  return <span className={`${styles.block} ${className}`} aria-hidden="true" />;
}

function StatSkeleton() {
  return (
    <div className={styles.card}>
      <Line width="44%" />
      <Line width="64%" />
    </div>
  );
}

export function RouteSkeleton({ label = 'Loading page' }) {
  return (
    <main className={`sc-container ${styles.page}`} aria-busy="true" aria-label={label}>
      <div className={styles.header}>
        <div>
          <Line width="180px" />
          <Line width="260px" />
        </div>
        <Block className={styles.button} />
      </div>
      <div className={styles.stats}>
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
      <div className={styles.card}>
        <Line width="160px" />
        <Block className={styles.chart} />
      </div>
    </main>
  );
}

export function DashboardSkeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Loading dashboard">
      <div className={styles.header}>
        <div>
          <Line width="160px" />
          <Line width="280px" />
        </div>
        <Block className={styles.button} />
      </div>
      <div className={styles.stats}>
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
      <div className={styles.card}>
        <Line width="180px" />
        <Block className={styles.chart} />
      </div>
      <div className={styles.stack}>
        <Line width="170px" />
        <Block className={styles.row} />
        <Block className={styles.row} />
        <Block className={styles.row} />
      </div>
    </div>
  );
}

export function PracticeSetupSkeleton() {
  return (
    <div className={`${styles.page} ${styles.narrow}`} aria-busy="true" aria-label="Loading practice options">
      <Line width="260px" />
      <Line width="320px" />
      <div className={styles.card}>
        <Block className={styles.field} />
        <Block className={styles.field} />
        <Block className={styles.field} />
        <Block className={styles.field} />
        <Block className={styles.fullButton} />
      </div>
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className={styles.conversation} aria-busy="true" aria-label="Loading session">
      <aside className={styles.sideCard}>
        <div className={styles.header}>
          <Line width="80px" />
          <Line width="68px" />
        </div>
        <Block className={styles.infoRow} />
        <Block className={styles.infoRow} />
        <Block className={styles.infoRow} />
        <Block className={styles.fullButton} />
      </aside>
      <section className={styles.chatCard}>
        <Block className={styles.chatBubbleLeft} />
        <Block className={styles.chatBubbleRight} />
        <Block className={styles.chatBubbleLeft} />
        <Block className={styles.inputRow} />
      </section>
    </div>
  );
}

export function EvaluationSkeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Loading evaluation">
      <div>
        <Line width="200px" />
        <Line width="280px" />
      </div>
      <div className={styles.scoreLayout}>
        <div className={`${styles.card} ${styles.centerCard}`}>
          <Block className={styles.dial} />
          <Line width="120px" />
        </div>
        <div className={styles.card}>
          <Line width="160px" />
          <div className={styles.skillGrid}>
            <Block className={styles.field} />
            <Block className={styles.field} />
            <Block className={styles.field} />
            <Block className={styles.field} />
          </div>
        </div>
      </div>
      <div className={styles.card}>
        <Line width="100px" />
        <Line width="90%" />
        <Line width="76%" />
      </div>
    </div>
  );
}
