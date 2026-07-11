import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { sessionApi } from '../../services/api/index.js';
import { AuthError, ServerError } from '../../components/ErrorPage/ErrorPage.jsx';
import { isAuthErrorCode, toErrorPageCode } from '../../utils/apiError.js';
import Button from '../../components/Button/Button.jsx';
import Card from '../../components/Card/Card.jsx';
import ScoreCard from '../../components/ScoreCard/ScoreCard.jsx';
import Chart from '../../components/Chart/Chart.jsx';
import Accordion from '../../components/Accordion/Accordion.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import TranscriptModal from '../../components/TranscriptModal/TranscriptModal.jsx';
import { formatTranscript, downloadTextFile } from '../../utils/transcript.js';
import { saveTranscript } from '../../services/localTranscripts.js';
import styles from './Evaluation.module.css';

const SKILLS = [
  { key: 'rapport', label: 'Rapport' },
  { key: 'businessDiscovery', label: 'Business Discovery' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'handlingObjections', label: 'Handling Objections' },
  { key: 'valueSelling', label: 'Value Selling' },
  { key: 'closing', label: 'Closing' }
];

function getScoreBand(score) {
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

function StringList({ items }) {
  if (!items || items.length === 0) {
    return <p className={styles.emptyList}>Nothing recorded.</p>;
  }
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function BetterResponsesList({ items }) {
  if (!items || items.length === 0) {
    return <p className={styles.emptyList}>Nothing recorded.</p>;
  }
  return (
    <div className={styles.responseList}>
      {items.map((item) => (
        <div className={styles.responseItem} key={`${item.client}|${item.yourResponse}`}>
          <p className={styles.responseLine}>
            <span className={styles.responseLabel}>Client said:</span> {item.client}
          </p>
          <p className={styles.responseLine}>
            <span className={styles.responseLabel}>You said:</span> {item.yourResponse}
          </p>
          <p className={styles.responseBetter}>
            <span className={styles.responseLabel}>Try instead:</span> {item.betterResponse}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Post-session results: overall score, six skill breakdowns, and coaching feedback. */
function Evaluation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState('idle');
  const savedTranscriptIdRef = useRef(null);
  const copyResetTimeoutRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const result = await sessionApi.get(id);
        if (!isMounted) return;
        setSession(result.session);
        setMessages(result.messages || []);
        setEvaluation(result.evaluation);
      } catch (err) {
        if (isMounted) setLoadError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(
    () => () => {
      if (copyResetTimeoutRef.current) window.clearTimeout(copyResetTimeoutRef.current);
    },
    []
  );

  const transcriptText = useMemo(() => (session ? formatTranscript(session, messages) : ''), [session, messages]);
  const transcriptFilename = useMemo(() => (session ? `sales-coach-${session.id}.txt` : 'transcript.txt'), [session]);

  // Save the formatted transcript to the local library exactly once per session, as soon as
  // both the session and its evaluation have loaded.
  useEffect(() => {
    if (!session || !evaluation) return;
    if (savedTranscriptIdRef.current === session.id) return;
    saveTranscript({
      sessionId: session.id,
      businessType: session.businessType,
      difficulty: session.difficulty,
      contactMethod: session.contactMethod,
      endedAt: session.endedAt,
      overallScore: evaluation.overallScore,
      text: transcriptText
    });
    savedTranscriptIdRef.current = session.id;
  }, [session, evaluation, transcriptText]);

  async function handleCopyTranscript() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(transcriptText);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('idle');
      return;
    }
    if (copyResetTimeoutRef.current) window.clearTimeout(copyResetTimeoutRef.current);
    copyResetTimeoutRef.current = window.setTimeout(() => setCopyStatus('idle'), 2000);
  }

  function handleDownloadTranscript() {
    downloadTextFile(transcriptFilename, transcriptText);
  }

  const skillChartData = useMemo(() => {
    if (!evaluation) return [];
    return SKILLS.map((skill) => ({ label: skill.label, value: evaluation[skill.key] }));
  }, [evaluation]);

  const accordionSections = useMemo(() => {
    if (!evaluation) return [];
    return [
      { id: 'strengths', title: 'Strengths', content: <StringList items={evaluation.strengths} /> },
      { id: 'weaknesses', title: 'Weaknesses', content: <StringList items={evaluation.weaknesses} /> },
      { id: 'missed', title: 'Missed Opportunities', content: <StringList items={evaluation.missedOpportunities} /> },
      { id: 'focus', title: 'Next Practice Focus', content: <StringList items={evaluation.nextPracticeFocus} /> },
      { id: 'better', title: 'Better Responses', content: <BetterResponsesList items={evaluation.betterResponses} /> }
    ];
  }, [evaluation]);

  if (loading) return <Spinner label="Loading your evaluation..." />;

  if (loadError) {
    const code = toErrorPageCode(loadError);
    return isAuthErrorCode(code) ? <AuthError code={code} /> : <ServerError code={code} />;
  }

  if (!evaluation) {
    return (
      <div className={styles.page}>
        <Card className={styles.emptyCard}>
          <h1 className={styles.title}>Not evaluated yet</h1>
          <p className={styles.subtitle}>
            This session doesn&apos;t have an evaluation yet. End the conversation to generate one.
          </p>
          <div className={styles.actions}>
            {session?.status === 'active' && (
              <Button onClick={() => navigate(`/session/${id}`)}>Continue Conversation</Button>
            )}
            <Link to="/" className={styles.backLink}>
              Back to Dashboard
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const band = getScoreBand(evaluation.overallScore);

  return (
    <div className={styles.page}>
      <Card className={`${styles.hero} ${styles[`hero_${band}`]}`}>
        <span className={styles.heroLabel}>Overall Score</span>
        <span className={styles.heroScoreRow}>
          <span className={styles.heroScore}>{evaluation.overallScore}</span>
          <span className={styles.heroMax}>/ 100</span>
        </span>
      </Card>

      <div className={styles.scoreGrid}>
        {SKILLS.map((skill) => (
          <ScoreCard key={skill.key} label={skill.label} score={evaluation[skill.key]} />
        ))}
      </div>

      {evaluation.summary && (
        <Card className={styles.summaryCard}>
          <h2 className={styles.sectionTitle}>Summary</h2>
          <p className={styles.summaryText}>{evaluation.summary}</p>
        </Card>
      )}

      <Card className={styles.chartCard}>
        <h2 className={styles.sectionTitle}>Skill Breakdown</h2>
        <Chart type="bar" data={skillChartData} max={10} />
      </Card>

      <Card>
        <Accordion sections={accordionSections} />
      </Card>

      <Card className={styles.transcriptCard}>
        <div className={styles.transcriptHeader}>
          <h2 className={styles.sectionTitle}>Transcript</h2>
          {copyStatus === 'copied' && <span className={styles.copyHint}>Copied!</span>}
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => setTranscriptModalOpen(true)}>
            View transcript
          </Button>
          <Button variant="secondary" onClick={handleCopyTranscript}>
            Copy
          </Button>
          <Button variant="secondary" onClick={handleDownloadTranscript}>
            Download
          </Button>
        </div>
      </Card>

      <TranscriptModal
        isOpen={transcriptModalOpen}
        onClose={() => setTranscriptModalOpen(false)}
        transcript={transcriptText}
        filename={transcriptFilename}
      />

      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
        <Button onClick={() => navigate('/practice/new')}>Practice Again</Button>
      </div>
    </div>
  );
}

export default Evaluation;
