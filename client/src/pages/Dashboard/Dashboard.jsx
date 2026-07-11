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
import styles from './Dashboard.module.css';

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
    </div>
  );
}

export default Dashboard;
