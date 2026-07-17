import { useCallback, useEffect, useRef, useState } from 'react';
import { appLangToBcp47 } from '../utils/speechLang.js';

const RESTART_DELAY_MS = 250;
const RESTART_WINDOW_MS = 10000;
const MAX_RESTARTS_PER_WINDOW = 5;

// Errors that mean the engine will never work this session, so restarting is pointless.
const FATAL_ERRORS = new Set(['not-allowed', 'service-not-allowed', 'audio-capture']);
// Routine in continuous mode: the engine reports these across ordinary pauses and
// whenever we abort it ourselves. Surfacing them would flag normal speech as a failure.
const IGNORED_ERRORS = new Set(['no-speech', 'aborted']);

function getRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function friendlyErrorFor(code) {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access was denied. Please allow microphone access and try again.';
    case 'network':
      return 'A network error interrupted voice recognition. Please try again.';
    case 'audio-capture':
      return 'No microphone was found. Please check your device and try again.';
    default:
      return 'Voice recognition failed. Please try again.';
  }
}

/**
 * Wraps the browser SpeechRecognition API (`window.SpeechRecognition` /
 * `window.webkitSpeechRecognition`) as a long-lived transcription source.
 *
 * The engine runs in continuous mode and is restarted whenever the browser ends it on
 * its own, so an ordinary pause mid-sentence never ends the seller's turn. Deciding when
 * a turn is finished is therefore *not* this hook's job: it reports speech as it arrives
 * and leaves turn-taking to the consumer (see `usePendingTurn`).
 *
 * - `onSegment(text)` fires once per finalized chunk of speech.
 * - `onActivity()` fires on every result, interim ones included, i.e. "still talking".
 * - `suspended` declaratively parks the engine (used while the AI speaks, so its own
 *   voice is not transcribed back) without clearing the seller's mic intent.
 *
 * Note `interimTranscript` holds only un-finalized words. Finalized text is delivered
 * through `onSegment` and accumulated in `transcript` - a consumer that reads both
 * `transcript` and `onSegment` will double-count.
 *
 * @param {{
 *   language?: string,
 *   suspended?: boolean,
 *   silenceMs?: number,
 *   onSegment?: (text: string) => void,
 *   onActivity?: () => void
 * }} options
 * @returns {{
 *   isSupported: boolean,
 *   isListening: boolean,
 *   isCapturing: boolean,
 *   transcript: string,
 *   interimTranscript: string,
 *   error: string,
 *   start: () => void,
 *   stop: () => void,
 *   reset: () => void
 * }}
 */
export function useSpeechRecognition({
  language,
  suspended = false,
  silenceMs = 1500,
  onSegment,
  onActivity
} = {}) {
  const RecognitionCtor = typeof window !== 'undefined' ? getRecognitionCtor() : null;
  const isSupported = Boolean(RecognitionCtor);

  const [isListening, setIsListening] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const interimRef = useRef('');

  // Engine should be running iff micOn && !suspended && !fatal.
  const micOnRef = useRef(false);
  const suspendedRef = useRef(suspended);
  const fatalRef = useRef(false);

  const restartTimerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const restartStampsRef = useRef([]);

  const languageRef = useRef(language);
  const silenceMsRef = useRef(silenceMs);
  const onSegmentRef = useRef(onSegment);
  const onActivityRef = useRef(onActivity);
  useEffect(() => {
    languageRef.current = language;
    silenceMsRef.current = silenceMs;
    onSegmentRef.current = onSegment;
    onActivityRef.current = onActivity;
  });

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const emitSegment = useCallback((text) => {
    const segment = text.trim();
    if (!segment) return;
    transcriptRef.current = transcriptRef.current ? `${transcriptRef.current} ${segment}` : segment;
    setTranscript(transcriptRef.current);
    onSegmentRef.current?.(segment);
  }, []);

  const stopEngine = useCallback(() => {
    clearRestartTimer();
    clearSilenceTimer();
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort?.();
    }
    setIsCapturing(false);
  }, [clearRestartTimer, clearSilenceTimer]);

  const shouldRun = useCallback(() => micOnRef.current && !suspendedRef.current && !fatalRef.current, []);

  const giveUp = useCallback(
    (message) => {
      micOnRef.current = false;
      setIsListening(false);
      stopEngine();
      setError(message);
    },
    [stopEngine]
  );

  const startEngineRef = useRef(() => {});

  // Every restart goes through here so the engine is always given time to release the
  // audio device, and so no path can hot-loop: a blocked mic or a backgrounded tab ends
  // sessions instantly, which without the guard would spin forever.
  const scheduleRestart = useCallback(() => {
    if (!shouldRun()) return;

    const now = Date.now();
    const stamps = restartStampsRef.current.filter((at) => now - at < RESTART_WINDOW_MS);
    stamps.push(now);
    restartStampsRef.current = stamps;
    if (stamps.length > MAX_RESTARTS_PER_WINDOW) {
      giveUp('Voice recognition keeps dropping. Tap the mic to try again.');
      return;
    }

    clearRestartTimer();
    restartTimerRef.current = window.setTimeout(() => {
      restartTimerRef.current = null;
      if (shouldRun()) startEngineRef.current();
    }, RESTART_DELAY_MS);
  }, [shouldRun, giveUp, clearRestartTimer]);

  // A fresh instance per start: Chrome throws InvalidStateError when start() is called on
  // an instance that has already ended.
  const startEngine = useCallback(() => {
    if (!isSupported || recognitionRef.current) return;

    const recognition = new RecognitionCtor();
    recognition.lang = appLangToBcp47(languageRef.current);
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalChunk += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      onActivityRef.current?.();

      if (finalChunk) emitSegment(finalChunk);

      interimRef.current = interim;
      setInterimTranscript(interim);

      clearSilenceTimer();
      silenceTimerRef.current = window.setTimeout(() => {
        // Safety net for the engine stalling on interim-only text: without this the
        // consumer never sees a finished part and the turn hangs forever.
        const stalled = interimRef.current.trim();
        if (!stalled) return;
        interimRef.current = '';
        setInterimTranscript('');
        emitSegment(stalled);
        // Cycle the engine so it cannot later finalize these same words and emit them a
        // second time. Restarting on the shared delay rather than immediately gives the
        // audio device time to be released.
        stopEngine();
        scheduleRestart();
      }, silenceMsRef.current);
    };

    recognition.onerror = (event) => {
      const code = event?.error;
      if (FATAL_ERRORS.has(code)) {
        fatalRef.current = true;
        giveUp(friendlyErrorFor(code));
        return;
      }
      if (IGNORED_ERRORS.has(code)) return;
      setError(friendlyErrorFor(code));
    };

    // onend now means the browser dropped the session, not that the turn is over.
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsCapturing(false);
      scheduleRestart();
    };

    recognitionRef.current = recognition;
    setIsCapturing(true);
    try {
      recognition.start();
    } catch {
      // Chrome throws if the previous session has not fully released the device yet.
      // onend never fires for a start that threw, so the retry has to be scheduled here.
      recognitionRef.current = null;
      setIsCapturing(false);
      scheduleRestart();
    }
  }, [RecognitionCtor, isSupported, emitSegment, clearSilenceTimer, stopEngine, scheduleRestart, giveUp]);

  useEffect(() => {
    startEngineRef.current = startEngine;
  }, [startEngine]);

  const reconcile = useCallback(() => {
    if (shouldRun()) {
      startEngine();
    } else {
      stopEngine();
    }
  }, [shouldRun, startEngine, stopEngine]);

  const start = useCallback(() => {
    if (!isSupported || micOnRef.current) return;
    micOnRef.current = true;
    fatalRef.current = false;
    restartStampsRef.current = [];
    setError('');
    setIsListening(true);
    reconcile();
  }, [isSupported, reconcile]);

  const stop = useCallback(() => {
    micOnRef.current = false;
    setIsListening(false);
    // Any words still pending as interim are the seller's; hand them over rather than
    // discarding them on stop.
    const pending = interimRef.current.trim();
    if (pending) {
      interimRef.current = '';
      setInterimTranscript('');
      emitSegment(pending);
    }
    stopEngine();
  }, [stopEngine, emitSegment]);

  const reset = useCallback(() => {
    transcriptRef.current = '';
    interimRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError('');
  }, []);

  useEffect(() => {
    suspendedRef.current = suspended;
    reconcile();
  }, [suspended, reconcile]);

  // Abort any in-flight recognition when the consumer unmounts.
  useEffect(() => {
    return () => {
      micOnRef.current = false;
      stopEngine();
    };
  }, [stopEngine]);

  return {
    isSupported,
    isListening,
    isCapturing,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset
  };
}

export default useSpeechRecognition;
