import { useEffect, useRef, useState } from 'react';
import Modal from '../Modal/Modal.jsx';
import Button from '../Button/Button.jsx';
import { downloadTextFile } from '../../utils/transcript.js';
import styles from './TranscriptModal.module.css';

/**
 * Reusable, copyable transcript viewer built on the shared Modal: a read-only,
 * selectable textarea plus Copy / Download / Close actions.
 */
function TranscriptModal({ isOpen, onClose, title = 'Conversation transcript', transcript, filename = 'transcript.txt' }) {
  const [copyState, setCopyState] = useState('idle'); // 'idle' | 'copied' | 'manual'
  const textareaRef = useRef(null);
  const resetTimeoutRef = useRef(null);

  useEffect(
    () => () => {
      if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
    },
    []
  );

  function scheduleReset() {
    if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = window.setTimeout(() => setCopyState('idle'), 2000);
  }

  async function handleCopy() {
    const text = transcript || '';
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
    } catch {
      textareaRef.current?.select();
      setCopyState('manual');
    }
    scheduleReset();
  }

  function handleDownload() {
    downloadTextFile(filename, transcript || '');
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={transcript || ''}
        readOnly
        aria-label="Transcript text"
      />
      <div className={styles.actions}>
        <Button variant="secondary" onClick={handleCopy}>
          Copy
        </Button>
        <Button variant="secondary" onClick={handleDownload}>
          Download
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        {copyState === 'copied' && <span className={styles.hint}>Copied!</span>}
        {copyState === 'manual' && <span className={styles.hint}>Press Ctrl+C</span>}
      </div>
    </Modal>
  );
}

export default TranscriptModal;
