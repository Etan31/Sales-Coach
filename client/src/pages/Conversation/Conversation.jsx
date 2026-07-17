import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chatApi, sessionApi } from '../../services/api/index.js';
import { ApiError } from '../../services/httpClient.js';
import { AuthError, ServerError } from '../../components/ErrorPage/ErrorPage.jsx';
import { isAuthErrorCode, toErrorPageCode } from '../../utils/apiError.js';
import Button from '../../components/Button/Button.jsx';
import ChatBubble from '../../components/ChatBubble/ChatBubble.jsx';
import TypingIndicator from '../../components/TypingIndicator/TypingIndicator.jsx';
import Timer from '../../components/Timer/Timer.jsx';
import Modal from '../../components/Modal/Modal.jsx';
import { ConversationSkeleton } from '../../components/Skeleton/Skeleton.jsx';
import VoiceInputBar from './VoiceInputBar.jsx';
import PendingTurnBar from './PendingTurnBar.jsx';
import TurnSettings from './TurnSettings.jsx';
import useSpeechSynthesis from '../../hooks/useSpeechSynthesis.js';
import usePendingTurn from '../../hooks/usePendingTurn.js';
import useCallPreferences from '../../hooks/useCallPreferences.js';
import { preloadSessionResult } from '../../services/preload.js';
import styles from './Conversation.module.css';

const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard', impossible: 'Impossible' };

function createLocalId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}-${Math.random()}`;
}

/** Core roleplay screen: business sidebar + live chat with the AI business owner. */
function Conversation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [awaitingReply, setAwaitingReply] = useState(false);
  const [sendError, setSendError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState('');

  const [preferences, updatePreferences] = useCallPreferences();
  const { autoReply, pauseAllowanceMs, muted } = preferences;
  const { speak, cancel, isSpeaking } = useSpeechSynthesis();

  const messagesEndRef = useRef(null);

  const isColdCall = session?.contactMethod === 'cold_call';

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const result = await sessionApi.get(id);
        if (!isMounted) return;
        if (result.session.status !== 'active') {
          navigate(`/session/${id}/evaluation`, { replace: true });
          return;
        }
        setSession(result.session);
        setMessages(result.messages);
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
  }, [id, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, awaitingReply]);

  // Stop any in-progress spoken reply if the user navigates away.
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || awaitingReply) return;

      const optimisticMessage = {
        id: createLocalId(),
        role: 'seller',
        content: trimmed,
        sequence: messages.length,
        createdAt: new Date().toISOString()
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setSendError('');
      setAwaitingReply(true);

      try {
        const { message } = await chatApi.send({ sessionId: id, message: trimmed });
        setMessages((prev) => [...prev, message]);
        if (isColdCall && !muted) {
          speak(message.content, { language: session.language });
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          navigate(`/session/${id}/evaluation`, { replace: true });
          return;
        }
        setSendError(err?.message || 'Failed to send your message. Please try again.');
      } finally {
        setAwaitingReply(false);
      }
    },
    [awaitingReply, messages.length, id, navigate, isColdCall, muted, session, speak]
  );

  const pendingTurn = usePendingTurn({
    autoReply,
    pauseAllowanceMs,
    canCommit: !awaitingReply && !ending,
    onCommit: sendMessage
  });

  const { noteActivity } = pendingTurn;

  // Confirming the end of a session should not race an auto-send; the staged draft
  // survives if the seller backs out.
  useEffect(() => {
    if (modalOpen) noteActivity();
  }, [modalOpen, noteActivity]);

  const handleEndConfirm = useCallback(async () => {
    cancel();
    setEnding(true);
    setEndError('');
    try {
      await sessionApi.end({ sessionId: id });
      preloadSessionResult(id);
      navigate(`/session/${id}/evaluation`);
    } catch (err) {
      setEndError(err?.message || 'Unable to end the conversation. Please try again.');
      setEnding(false);
    }
  }, [id, navigate, cancel]);

  const handleToggleMute = useCallback(() => {
    const next = !muted;
    if (next) cancel();
    updatePreferences({ muted: next });
  }, [cancel, muted, updatePreferences]);

  const businessInfo = session?.businessInfo;

  const contactMethodBadges = useMemo(() => {
    if (!businessInfo) return [];
    const badges = [];
    if (businessInfo.hasWebsite) badges.push('Website');
    if (businessInfo.hasFacebook) badges.push('Facebook');
    return badges;
  }, [businessInfo]);

  if (loading) return <ConversationSkeleton />;

  if (loadError) {
    const code = toErrorPageCode(loadError);
    return isAuthErrorCode(code) ? <AuthError code={code} /> : <ServerError code={code} />;
  }

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={`${styles.difficultyBadge} ${styles[`difficulty_${session.difficulty}`] ?? ''}`}>
            {DIFFICULTY_LABELS[session.difficulty] ?? session.difficulty}
          </span>
          <Timer startTime={session.createdAt} />
        </div>

        {businessInfo && (
          <dl className={styles.infoList}>
            <div className={styles.infoRow}>
              <dt>Business</dt>
              <dd>{businessInfo.business}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Owner</dt>
              <dd>
                {businessInfo.ownerName}, {businessInfo.ownerAge}
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Personality</dt>
              <dd>{businessInfo.personality}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Tech Level</dt>
              <dd>{businessInfo.technologyLevel}</dd>
            </div>
            {contactMethodBadges.length > 0 && (
              <div className={styles.infoRow}>
                <dt>Online Presence</dt>
                <dd>{contactMethodBadges.join(', ')}</dd>
              </div>
            )}
          </dl>
        )}

        <Button variant="danger" onClick={() => setModalOpen(true)} className={styles.endButton}>
          End Conversation
        </Button>
      </aside>

      <main className={styles.chat}>
        <div className={styles.messages}>
          {messages.length === 0 && !awaitingReply && (
            <p className={styles.hint}>Walk up and start the conversation.</p>
          )}
          {messages.map((message) => (
            <ChatBubble key={message.id} role={message.role} content={message.content} timestamp={message.createdAt} />
          ))}
          {awaitingReply && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {sendError && (
          <p className={styles.error} role="alert">
            {sendError}
          </p>
        )}

        <div className={styles.inputArea}>
          {isColdCall ? (
            <VoiceInputBar
              pendingTurn={pendingTurn}
              language={session.language}
              autoReply={autoReply}
              // Park the mic while the owner is replying, so the reply being read aloud
              // is not transcribed back as the seller's next turn.
              suspended={awaitingReply || isSpeaking}
              disabled={awaitingReply}
            />
          ) : (
            <PendingTurnBar pendingTurn={pendingTurn} autoReply={autoReply} disabled={awaitingReply} />
          )}

          <TurnSettings
            autoReply={autoReply}
            pauseAllowanceMs={pauseAllowanceMs}
            onChange={updatePreferences}
            onActivity={noteActivity}
            muted={muted}
            onToggleMute={handleToggleMute}
            showMute={isColdCall}
          />
        </div>
      </main>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="End this conversation?">
        <p className={styles.modalText}>
          Ending now will finalize this session and generate your evaluation. You won&apos;t be able to send more messages.
        </p>
        {endError && (
          <p className={styles.error} role="alert">
            {endError}
          </p>
        )}
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={ending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleEndConfirm} loading={ending} disabled={ending}>
            End Conversation
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Conversation;
