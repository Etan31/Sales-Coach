import { useCallback, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/Button/Button.jsx';
import Card from '../../components/Card/Card.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import SalesCoachLogo from '../../components/SalesCoachLogo/SalesCoachLogo.jsx';
import styles from './Register.module.css';

const INITIAL_FORM = { displayName: '', email: '', password: '' };

/** Sign-up form. Handles both "instant session" and "confirm your email" Supabase flows. */
function Register() {
  const { session, loading, signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');
      setSubmitting(true);
      const { data, error: signUpError } = await signUp(form);
      setSubmitting(false);

      if (signUpError) {
        setError(signUpError.message || 'Unable to create your account. Please try again.');
        return;
      }

      if (data?.session) {
        navigate('/', { replace: true });
        return;
      }

      // Email confirmation required: Supabase returns a user but no session yet.
      setConfirmationPending(true);
    },
    [form, signUp, navigate]
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

        {confirmationPending ? (
          <>
            <h1 className={styles.title}>Check your email</h1>
            <p className={styles.subtitle}>
              We sent a confirmation link to <strong>{form.email}</strong>. Confirm your email, then sign in to start
              practicing.
            </p>
            <Link to="/login" className={styles.backLink}>
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>Practice real sales conversations with an AI business owner.</p>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <label className={styles.field}>
                <span className={styles.label}>Display name</span>
                <input
                  type="text"
                  name="displayName"
                  className={styles.input}
                  value={form.displayName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                  disabled={submitting}
                />
              </label>
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
                  autoComplete="new-password"
                  minLength={6}
                  required
                  disabled={submitting}
                />
              </label>
              <Button type="submit" loading={submitting} disabled={submitting} className={styles.submit}>
                Create account
              </Button>
            </form>

            <p className={styles.footer}>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}

export default Register;
