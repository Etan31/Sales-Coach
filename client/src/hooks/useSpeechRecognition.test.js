import { act, renderHook } from '@testing-library/react';
import useSpeechRecognition from './useSpeechRecognition.js';

/** Minimal mock of the browser SpeechRecognition API, controllable from the test. */
class MockSpeechRecognition {
  constructor() {
    this.lang = '';
    this.interimResults = false;
    this.continuous = false;
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    MockSpeechRecognition.instances.push(this);
  }

  start() {
    this.started = true;
  }

  stop() {
    this.onend?.();
  }

  abort() {
    this.aborted = true;
  }
}
MockSpeechRecognition.instances = [];

describe('useSpeechRecognition', () => {
  afterEach(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
    MockSpeechRecognition.instances = [];
  });

  it('reports unsupported when no SpeechRecognition constructor exists', () => {
    const { result } = renderHook(() => useSpeechRecognition({ language: 'english' }));
    expect(result.current.isSupported).toBe(false);
  });

  it('maps app language to BCP-47 and starts the recognizer with interim results enabled', () => {
    window.SpeechRecognition = MockSpeechRecognition;
    const { result } = renderHook(() => useSpeechRecognition({ language: 'tagalog' }));

    expect(result.current.isSupported).toBe(true);

    act(() => {
      result.current.start();
    });

    expect(MockSpeechRecognition.instances).toHaveLength(1);
    const instance = MockSpeechRecognition.instances[0];
    expect(instance.lang).toBe('fil-PH');
    expect(instance.interimResults).toBe(true);
    expect(instance.continuous).toBe(false);
    expect(instance.started).toBe(true);
    expect(result.current.isListening).toBe(true);
  });

  it('calls onResult with the final transcript when recognition ends', () => {
    window.SpeechRecognition = MockSpeechRecognition;
    const onResult = jest.fn();
    const { result } = renderHook(() => useSpeechRecognition({ language: 'english', onResult }));

    act(() => {
      result.current.start();
    });
    const instance = MockSpeechRecognition.instances[0];

    act(() => {
      instance.onresult({
        resultIndex: 0,
        results: [{ isFinal: true, 0: { transcript: 'pricing please' } }]
      });
    });
    expect(result.current.interimTranscript).toBe('pricing please');

    act(() => {
      instance.onend();
    });

    expect(onResult).toHaveBeenCalledWith('pricing please');
    expect(result.current.isListening).toBe(false);
  });

  it('sets a friendly error message when the microphone is denied', () => {
    window.SpeechRecognition = MockSpeechRecognition;
    const { result } = renderHook(() => useSpeechRecognition({ language: 'english' }));

    act(() => {
      result.current.start();
    });
    const instance = MockSpeechRecognition.instances[0];

    act(() => {
      instance.onerror({ error: 'not-allowed' });
    });

    expect(result.current.error).toMatch(/microphone access was denied/i);
  });
});
