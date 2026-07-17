import { useCallback, useEffect, useRef, useState } from 'react';
import { appLangToBcp47 } from '../utils/speechLang.js';

function pickVoiceFor(bcp47) {
  const synth = window.speechSynthesis;
  if (!synth?.getVoices) return null;
  const voices = synth.getVoices();
  if (!voices || voices.length === 0) return null;
  const exact = voices.find((voice) => voice.lang === bcp47);
  if (exact) return exact;
  const prefix = bcp47.split('-')[0];
  return voices.find((voice) => voice.lang?.toLowerCase().startsWith(prefix.toLowerCase())) || null;
}

/**
 * Wraps the browser SpeechSynthesis API (`window.speechSynthesis`) for reading the AI
 * business owner's replies aloud during cold-call voice mode.
 *
 * @returns {{
 *   isSupported: boolean,
 *   isSpeaking: boolean,
 *   speak: (text: string, options?: { language?: string }) => void,
 *   cancel: () => void
 * }}
 */
export function useSpeechSynthesis() {
  const isSupported = typeof window !== 'undefined' && Boolean(window.speechSynthesis);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const speak = useCallback(
    (text, { language } = {}) => {
      if (!isSupported || !text) return;

      // Cancel anything already queued/speaking so replies never overlap.
      window.speechSynthesis.cancel();

      const utterance = new window.SpeechSynthesisUtterance(text);
      const bcp47 = appLangToBcp47(language);
      utterance.lang = bcp47;

      const voice = pickVoiceFor(bcp47);
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      // Set before speaking rather than waiting for the async onstart: callers park the
      // microphone on this flag, and the gap would leave it live exactly as the reply
      // starts playing - long enough to transcribe the owner's own voice back.
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  // Stop any speech in progress when the consumer unmounts.
  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  return { isSupported, isSpeaking, speak, cancel };
}

export default useSpeechSynthesis;
