import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { configApi, sessionApi } from '../../services/api/index.js';
import { AuthError, ServerError } from '../../components/ErrorPage/ErrorPage.jsx';
import { isAuthErrorCode, toErrorPageCode } from '../../utils/apiError.js';
import Button from '../../components/Button/Button.jsx';
import Card from '../../components/Card/Card.jsx';
import SelectField from '../../components/SelectField/SelectField.jsx';
import { PracticeSetupSkeleton } from '../../components/Skeleton/Skeleton.jsx';
import { preloadConversation } from '../../services/preload.js';
import styles from './PracticeSetup.module.css';

/** Practice configuration screen: pick business type, difficulty, contact method, language, then start. */
function PracticeSetup() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selection, setSelection] = useState({
    businessType: '',
    difficulty: '',
    contactMethod: '',
    language: ''
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const result = await configApi.get();
        if (!isMounted) return;
        setConfig(result);
        setSelection({
          businessType: result.businessTypes[0]?.value ?? '',
          difficulty: result.difficulties[0]?.value ?? '',
          contactMethod: result.contactMethods[0]?.value ?? '',
          language: result.languages[0]?.value ?? ''
        });
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
  }, []);

  const handleFieldChange = useCallback((field) => {
    return (event) => {
      const { value } = event.target;
      setSelection((prev) => ({ ...prev, [field]: value }));
    };
  }, []);

  const handleStart = useCallback(
    async (event) => {
      event.preventDefault();
      setCreateError('');
      setCreating(true);
      try {
        const { session } = await sessionApi.create(selection);
        preloadConversation(session.id);
        navigate(`/session/${session.id}`);
      } catch (err) {
        setCreateError(err?.message || 'Unable to start practice. Please try again.');
        setCreating(false);
      }
    },
    [selection, navigate]
  );

  if (loading) return <PracticeSetupSkeleton />;

  if (loadError) {
    const code = toErrorPageCode(loadError);
    return isAuthErrorCode(code) ? <AuthError code={code} /> : <ServerError code={code} />;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>New Practice Session</h1>
      <p className={styles.subtitle}>Choose the scenario you want to practice.</p>

      <Card className={styles.card}>
        {createError && (
          <p className={styles.error} role="alert">
            {createError}
          </p>
        )}

        <form className={styles.form} onSubmit={handleStart}>
          <SelectField
            label="Business Type"
            name="businessType"
            value={selection.businessType}
            onChange={handleFieldChange('businessType')}
            options={config.businessTypes}
          />
          <SelectField
            label="Difficulty"
            name="difficulty"
            value={selection.difficulty}
            onChange={handleFieldChange('difficulty')}
            options={config.difficulties}
          />
          <SelectField
            label="Contact Method"
            name="contactMethod"
            value={selection.contactMethod}
            onChange={handleFieldChange('contactMethod')}
            options={config.contactMethods}
          />
          <SelectField
            label="Language"
            name="language"
            value={selection.language}
            onChange={handleFieldChange('language')}
            options={config.languages}
          />

          <Button type="submit" loading={creating} disabled={creating} className={styles.submit}>
            Start Practice
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default PracticeSetup;
