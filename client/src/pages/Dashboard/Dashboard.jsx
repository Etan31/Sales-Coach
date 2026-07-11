import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sessionApi, statsApi } from '../../services/api/index.js';
import { AuthError, ServerError } from '../../components/ErrorPage/ErrorPage.jsx';
import { isAuthErrorCode, toErrorPageCode } from '../../utils/apiError.js';
import Button from '../../components/Button/Button.jsx';
import Card from '../../components/Card/Card.jsx';
import StatCard from '../../components/StatCard/StatCard.jsx';
import Chart from '../../components/Chart/Chart.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import TranscriptModal from '../../components/TranscriptModal/TranscriptModal.jsx';
import { downloadTextFile } from '../../utils/transcript.js';
import { getTranscripts, clearTranscripts } from '../../services/localTranscripts.js';
import styles from './Dashboard.module.css';

const TRANSCRIPT_DIVIDER = `\n\n${'='.repeat(40)}\n\n`;
const RECENT_TRANSCRIPT_LIMIT = 5;

// Static enum -> label maps (docs/contracts.md); Dashboard does not fetch /config.
const BUSINESS_LABELS = {
  coffee_shop: 'Coffee Shop',
  barbershop: 'Barbershop',
  salon: 'Salon',
  restaurant: 'Restaurant',
  gym: 'Gym',
  dental_clinic: 'Dental Clinic',
  laundry_shop: 'Laundry Shop',
  convenience_store: 'Convenience Store',
  hardware_store: 'Hardware Store',
  bakery: 'Bakery'
};

const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard', impossible: 'Impossible' };

const CONTACT_METHOD_LABELS = {
  walk_in: 'Walk-in',
  cold_call: 'Cold Call',
  messenger: 'Facebook Messenger',
  email: 'Email'
};

const STATUS_LABELS = { active: 'Active', completed: 'Completed', abandoned: 'Abandoned' };

function formatDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Landing page after sign-in: stats overview, score trend, and session history. */
function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [statsResult, historyResult] = await Promise.all([
          statsApi.get(),
          sessionApi.history({ page: 1, pageSize: 20 })
        ]);
        if (!isMounted) return;
        setStats(statsResult);
        setHistory(historyResult);
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const trendData = useMemo(() => {
    const trend = stats?.scoreTrend ?? [];
    return trend.map((point) => ({ label: formatDate(point.date), value: point.overallScore }));
  }, [stats]);

  const [transcripts, setTranscripts] = useState([]);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [viewingTranscript, setViewingTranscript] = useState(null);
  const [copyAllStatus, setCopyAllStatus] = useState('idle');

  useEffect(() => {
    setTranscripts(getTranscripts());
  }, []);

  const recentTranscripts = useMemo(() => transcripts.slice(0, RECENT_TRANSCRIPT_LIMIT), [transcripts]);

  function handleDownloadAllTranscripts() {
    const text = transcripts.map((entry) => entry.text).join(TRANSCRIPT_DIVIDER);
    downloadTextFile('sales-coach-transcripts.txt', text);
  }

  async function handleCopyAllTranscripts() {
    const text = transcripts.map((entry) => entry.text).join(TRANSCRIPT_DIVIDER);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(text);
      setCopyAllStatus('copied');
    } catch {
      setCopyAllStatus('idle');
      return;
    }
    window.setTimeout(() => setCopyAllStatus('idle'), 2000);
  }

  function handleClearTranscripts() {
    clearTranscripts();
    setTranscripts([]);
    setConfirmClearOpen(false);
  }

  if (loading) return <Spinner label="Loading your dashboard..." />;

  if (error) {
    const code = toErrorPageCode(error);
    return isAuthErrorCode(code) ? <AuthError code={code} /> : <ServerError code={code} />;
  }

  const sessions = history?.sessions ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Track your practice sessions and skill progress.</p>
        </div>
        <Button onClick={() => navigate('/practice/new')}>New Practice</Button>
      </div>

      <div className={styles.statsRow}>
        <StatCard label="Total Sessions" value={stats?.totalSessions ?? 0} />
        <StatCard label="Completed" value={stats?.completedSessions ?? 0} />
        <StatCard label="Average Score" value={stats?.averageScore ?? 0} hint="out of 100" />
      </div>

      {trendData.length > 0 && (
        <Card className={styles.trendCard}>
          <h2 className={styles.sectionTitle}>Score Trend</h2>
          <Chart type="line" data={trendData} max={100} />
        </Card>
      )}

      <section>
        <h2 className={styles.sectionTitle}>Previous Sessions</h2>
        {sessions.length === 0 ? (
          <Card className={styles.emptyCard}>
            <p className={styles.emptyText}>No practice sessions yet - start your first one.</p>
            <Button onClick={() => navigate('/practice/new')}>Start Practicing</Button>
          </Card>
        ) : (
          <ul className={styles.sessionList}>
            {sessions.map((item) => (
              <li key={item.id}>
                <Card className={styles.sessionCard}>
                  <div className={styles.sessionInfo}>
                    <span className={styles.sessionBusiness}>{BUSINESS_LABELS[item.businessType] ?? item.businessType}</span>
                    <span className={styles.sessionMeta}>
                      {DIFFICULTY_LABELS[item.difficulty] ?? item.difficulty} &middot;{' '}
                      {CONTACT_METHOD_LABELS[item.contactMethod] ?? item.contactMethod} &middot; {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <div className={styles.sessionAction}>
                    <span className={`${styles.badge} ${styles[`badge_${item.status}`] ?? ''}`}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                    {item.status === 'completed' && item.overallScore !== null && (
                      <span className={styles.score}>{item.overallScore}/100</span>
                    )}
                    {item.status === 'completed' && (
                      <Link to={`/session/${item.id}/evaluation`} className={styles.sessionLink}>
                        View results
                      </Link>
                    )}
                    {item.status === 'active' && (
                      <Link to={`/session/${item.id}`} className={styles.sessionLink}>
                        Continue
                      </Link>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Saved Transcripts</h2>
        <Card className={styles.transcriptsCard}>
          {transcripts.length === 0 ? (
            <p className={styles.emptyText}>No transcripts saved locally yet - finish a session to save one.</p>
          ) : (
            <>
              <p className={styles.transcriptsCount}>{transcripts.length} saved locally</p>
              <ul className={styles.transcriptsList}>
                {recentTranscripts.map((entry) => (
                  <li key={entry.sessionId} className={styles.transcriptItem}>
                    <span className={styles.transcriptMeta}>
                      {BUSINESS_LABELS[entry.businessType] ?? entry.businessType} &middot;{' '}
                      {DIFFICULTY_LABELS[entry.difficulty] ?? entry.difficulty} &middot; {formatDate(entry.endedAt)}
                      {typeof entry.overallScore === 'number' ? ` · ${entry.overallScore}/100` : ''}
                    </span>
                    <Button variant="ghost" onClick={() => setViewingTranscript(entry)}>
                      View
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className={styles.transcriptsActions}>
            <Button variant="secondary" disabled={transcripts.length === 0} onClick={handleDownloadAllTranscripts}>
              Download all
            </Button>
            <Button variant="secondary" disabled={transcripts.length === 0} onClick={handleCopyAllTranscripts}>
              Copy all
            </Button>
            <Button variant="danger" disabled={transcripts.length === 0} onClick={() => setConfirmClearOpen(true)}>
              Clear
            </Button>
            {copyAllStatus === 'copied' && <span className={styles.copyHint}>Copied!</span>}
          </div>
        </Card>
      </section>

      <Modal isOpen={confirmClearOpen} onClose={() => setConfirmClearOpen(false)} title="Clear saved transcripts?">
        <p className={styles.confirmText}>
          This deletes all {transcripts.length} transcript{transcripts.length === 1 ? '' : 's'} saved locally on this
          device. This can&apos;t be undone.
        </p>
        <div className={styles.confirmActions}>
          <Button variant="secondary" onClick={() => setConfirmClearOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleClearTranscripts}>
            Clear all
          </Button>
        </div>
      </Modal>

      <TranscriptModal
        isOpen={Boolean(viewingTranscript)}
        onClose={() => setViewingTranscript(null)}
        transcript={viewingTranscript?.text || ''}
        filename={viewingTranscript ? `sales-coach-${viewingTranscript.sessionId}.txt` : 'transcript.txt'}
      />
    </div>
  );
}

export default Dashboard;
