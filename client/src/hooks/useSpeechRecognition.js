import { useCallback, useEffect, useRef, useState } from 'react';
import { appLangToBcp47 } from '../utils/speechLang.js';

function getRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function friendlyErrorFor(code) {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access was denied. Please allow microphone access and try again.';
    case 'no-speech':
      return "We didn't hear anything. Please try again.";
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
 * `window.webkitSpeechRecognition`).
 *
 * Design note: recognition completion is event-driven (`onend` fires asynchronously,
 * whether the user tapped stop or the browser auto-ended after a pause), so there is no
 * meaningful value for `stop()` to return. Instead, the finished utterance is delivered
 * through the `onResult(finalText)` callback option, fired once per session when
 * recognition ends with non-empty final text. `interimTranscript` state is still exposed
 * for live "what you're saying" display while `isListening` is true.
 *
 * @param {{ language?: string, onResult?: (finalText: string) => void }} options
 * @returns {{
 *   isSupported: boolean,
 *   isListening: boolean,
 *   interimTranscript: string,
 *   error: string,
 *   start: () => void,
 *   stop: () => void,
 *   reset: () => void
 * }}
 */
export function useSpeechRecognition({ language, onResult } = {}) {
  const RecognitionCtor = typeof window !== 'undefined' ? getRecognitionCtor() : null;
  const isSupported = Boolean(RecognitionCtor);

  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const reset = useCallback(() => {
    finalTranscriptRef.current = '';
    setInterimTranscript('');
    setError('');
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (!isSupported || isListening) return;

    const recognition = new RecognitionCtor();
    recognition.lang = appLangToBcp47(language);
    recognition.interimResults = true;
    recognition.continuous = false;

    finalTranscriptRef.current = '';
    setInterimTranscript('');
    setError('');

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) finalTranscriptRef.current += final;
      setInterimTranscript(finalTranscriptRef.current + interim);
    };

    recognition.onerror = (event) => {
      setError(friendlyErrorFor(event.error));
    };

    recognition.onend = () => {
      setIsListening(false);
      const finalText = finalTranscriptRef.current.trim();
      if (finalText) {
        onResultRef.current?.(finalText);
      }
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }, [RecognitionCtor, isSupported, isListening, language]);

  // Abort any in-flight recognition when the consumer unmounts.
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort?.();
    };
  }, []);

  return { isSupported, isListening, interimTranscript, error, start, stop, reset };
}

export default useSpeechRecognition;
