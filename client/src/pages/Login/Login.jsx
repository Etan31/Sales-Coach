import { useCallback, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ChatsCircle, PenNib, Target } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/Button/Button.jsx';
import ChatBubble from '../../components/ChatBubble/ChatBubble.jsx';
import ScoreCard from '../../components/ScoreCard/ScoreCard.jsx';
import ScoreDial from '../../components/ScoreDial/ScoreDial.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import SalesCoachLogo from '../../components/SalesCoachLogo/SalesCoachLogo.jsx';
import styles from './Login.module.css';

const INITIAL_FORM = { email: '', password: '' };

/**
 * The features are previewed with the same components the app renders after sign-in
 * (ChatBubble, ScoreDial, ScoreCard), so the panel shows the real product, not a mockup.
 */
const FEATURES = [
  {
    id: 'roleplay',
    Icon: ChatsCircle,
    title: 'Roleplay a buyer who pushes back',
    body: 'Pick the business, the difficulty, and how you reach them. The owner stalls, haggles, and objects the way a real one does.',
    visual: (
      <>
        <ChatBubble role="owner" content="We already have a guy who does our website. Why would I switch?" />
        <ChatBubble role="seller" content="Fair. What does he charge you when something breaks at 9pm?" />
      </>
    )
  },
  {
    id: 'scored',
    Icon: Target,
    title: 'Scored on six selling skills',
    body: 'Every session is graded on rapport, discovery, confidence, objections, value, and closing. No vague feedback.',
    visual: (
      <div className={styles.scoreVisual}>
        <ScoreDial score={84} size={104} label="Overall score" />
        <div className={styles.scoreBars}>
          <ScoreCard label="Rapport" score={9} flush />
          <ScoreCard label="Value Selling" score={8} flush />
          <ScoreCard label="Handling Objections" score={8} flush />
        </div>
      </div>
    )
  },
  {
    id: 'rewrite',
    Icon: PenNib,
    title: 'See exactly what to say instead',
    body: 'For every reply that cost you ground, you get the line that would have worked, next to the one you used.',
    visual: (
      <div className={styles.rewrite}>
        <p className={styles.rewriteLine}>
          <span className={styles.rewriteLabel}>You said</span>
          So do you want a website or not?
        </p>
        <p className={`${styles.rewriteLine} ${styles.rewriteBetter}`}>
          <span className={styles.rewriteLabel}>Try instead</span>
          What would have to be true for a new site to be worth it this quarter?
        </p>
      </div>
    )
  }
];

/** Email + password sign-in, alongside a scrolling preview of what the product does. */
function Login() {
  const { session, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');
      setSubmitting(true);
      const { error: signInError } = await signIn(form);
      setSubmitting(false);

      if (signInError) {
        setError(signInError.message || 'Unable to sign in. Please try again.');
        return;
      }
      navigate('/', { replace: true });
    },
    [form, signIn, navigate]
  );

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Checking your session..." />
      </div>
    );
  }
  if (session) return <Navigate to="/" replace />;

  return (
    <div className={styles.page}>
      <section className={styles.story} aria-labelledby="story-title">
        <div className={styles.brand}>
          <SalesCoachLogo size={36} />
          <span className={styles.brandName}>Sales Coach</span>
        </div>

        <h1 id="story-title" className={styles.headline}>
          Practice the call before it costs you the deal.
        </h1>
        <p className={styles.lede}>
          Sales Coach puts you in front of a business owner who pushes back, then scores you on what you
          actually said.
        </p>

        <ul className={styles.features}>
          {FEATURES.map(({ id, Icon, title, body, visual }, index) => (
            <li key={id} className={styles.feature} style={{ '--sc-feature-index': index }}>
              <div className={styles.featureText}>
                <span className={styles.featureIcon}>
                  <Icon size={22} weight="regular" aria-hidden="true" />
                </span>
                <h2 className={styles.featureTitle}>{title}</h2>
                <p className={styles.featureBody}>{body}</p>
              </div>
              <div className={styles.featureVisual}>{visual}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.authPane} aria-labelledby="signin-title">
        <div className={styles.authInner}>
          {/* Only rendered below the split, where the story's own lockup sits offscreen. */}
          <div className={styles.authBrand}>
            <SalesCoachLogo size={32} />
            <span className={styles.brandName}>Sales Coach</span>
          </div>

          <h2 id="signin-title" className={styles.title}>
            Welcome back
          </h2>
          <p className={styles.subtitle}>Sign in to keep practicing your sales conversations.</p>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label className={styles.field}>
              <span className={styles.label}>Email</span>
              <input
                type="email"
                name="email"
                className={styles.input}
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={submitting}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Password</span>
              <input
                type="password"
                name="password"
                className={styles.input}
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                disabled={submitting}
              />
            </label>
            <Button type="submit" loading={submitting} disabled={submitting} className={styles.submit}>
              Sign in
            </Button>
          </form>

          <p className={styles.footer}>
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;
