import { useCallback, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/Button/Button.jsx';
import Card from '../../components/Card/Card.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import SalesCoachLogo from '../../components/SalesCoachLogo/SalesCoachLogo.jsx';
import styles from './Login.module.css';

const INITIAL_FORM = { email: '', password: '' };

/** Email + password sign-in. Redirects home if already authenticated. */
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

  if (loading) return <Spinner label="Checking your session..." />;
  if (session) return <Navigate to="/" replace />;

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <div className={styles.brand}>
          <SalesCoachLogo />
          <span className={styles.brandName}>Sales Coach</span>
        </div>
        <h1 className={styles.title}>Welcome back</h1>
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
      </Card>
    </div>
  );
}

export default Login;
