import { act, renderHook } from '@testing-library/react';
import useSpeechRecognition from './useSpeechRecognition.js';

/**
 * Minimal mock of the browser SpeechRecognition API, controllable from the test.
 *
 * stop()/abort() only flip flags: the real API ends asynchronously, and the hook restarts
 * on `onend`, so a mock that fired onend synchronously from stop() would trigger a
 * restart from inside stop() and misrepresent the browser.
 */
class MockSpeechRecognition {
  constructor() {
    this.lang = '';
    this.interimResults = false;
    this.continuous = false;
    this.started = false;
    this.aborted = false;
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    MockSpeechRecognition.instances.push(this);
  }

  start() {
    this.started = true;
  }

  stop() {
    this.stopped = true;
  }

  abort() {
    this.aborted = true;
  }
}
MockSpeechRecognition.instances = [];

/** Builds a SpeechRecognition result event for the given finalized/interim chunks. */
function resultEvent({ final = '', interim = '' } = {}) {
  const results = [];
  if (final) results.push({ isFinal: true, 0: { transcript: final } });
  if (interim) results.push({ isFinal: false, 0: { transcript: interim } });
  return { resultIndex: 0, results };
}

const latest = () => MockSpeechRecognition.instances[MockSpeechRecognition.instances.length - 1];

beforeEach(() => {
  jest.useFakeTimers();
  window.SpeechRecognition = MockSpeechRecognition;
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  delete window.SpeechRecognition;
  delete window.webkitSpeechRecognition;
  MockSpeechRecognition.instances = [];
});

function setup(options = {}) {
  const onSegment = jest.fn();
  const onActivity = jest.fn();
  const utils = renderHook((props) => useSpeechRecognition({ language: 'english', onSegment, onActivity, ...props }), {
    initialProps: options
  });
  return { onSegment, onActivity, ...utils };
}

describe('useSpeechRecognition', () => {
  it('reports unsupported when no SpeechRecognition constructor exists', () => {
    delete window.SpeechRecognition;
    const { result } = renderHook(() => useSpeechRecognition({ language: 'english' }));
    expect(result.current.isSupported).toBe(false);
  });

  it('maps app language to BCP-47 and starts the recognizer with interim results enabled', () => {
    const { result } = setup({ language: 'tagalog' });

    expect(result.current.isSupported).toBe(true);
    act(() => result.current.start());

    expect(MockSpeechRecognition.instances).toHaveLength(1);
    expect(latest().lang).toBe('fil-PH');
    expect(latest().interimResults).toBe(true);
    expect(latest().started).toBe(true);
    expect(result.current.isListening).toBe(true);
  });

  // The root-cause fix: continuous=false made the browser end the session at the first
  // pause, which ended the seller's turn a few hundred milliseconds into a breath.
  it('runs the recognizer in continuous mode so a pause does not end the turn', () => {
    const { result } = setup();
    act(() => result.current.start());
    expect(latest().continuous).toBe(true);
  });

  describe('reporting speech', () => {
    it('emits a segment per finalized chunk and accumulates the transcript', () => {
      const { result, onSegment } = setup();
      act(() => result.current.start());

      act(() => latest().onresult(resultEvent({ final: 'pricing please' })));
      expect(onSegment).toHaveBeenCalledWith('pricing please');
      expect(result.current.transcript).toBe('pricing please');

      act(() => latest().onresult(resultEvent({ final: 'and delivery' })));
      expect(onSegment).toHaveBeenCalledWith('and delivery');
      expect(result.current.transcript).toBe('pricing please and delivery');
    });

    it('exposes only un-finalized words as the interim transcript', () => {
      const { result } = setup();
      act(() => result.current.start());

      act(() => latest().onresult(resultEvent({ final: 'hello there', interim: 'I wanted' })));

      expect(result.current.interimTranscript).toBe('I wanted');
      expect(result.current.transcript).toBe('hello there');
    });

    it('reports activity on interim results so the consumer can hold the turn open', () => {
      const { result, onActivity, onSegment } = setup();
      act(() => result.current.start());

      act(() => latest().onresult(resultEvent({ interim: 'still talking' })));

      expect(onActivity).toHaveBeenCalled();
      expect(onSegment).not.toHaveBeenCalled();
    });

    it('flushes stalled interim text as a segment once silence elapses', () => {
      const { result, onSegment } = setup({ silenceMs: 1500 });
      act(() => result.current.start());

      act(() => latest().onresult(resultEvent({ interim: 'stuck words' })));
      expect(onSegment).not.toHaveBeenCalled();

      act(() => jest.advanceTimersByTime(1500));

      expect(onSegment).toHaveBeenCalledWith('stuck words');
      expect(result.current.interimTranscript).toBe('');
    });

    it('hands over pending interim words when the seller stops the mic', () => {
      const { result, onSegment } = setup();
      act(() => result.current.start());

      act(() => latest().onresult(resultEvent({ interim: 'half a thought' })));
      act(() => result.current.stop());

      expect(onSegment).toHaveBeenCalledWith('half a thought');
      expect(result.current.isListening).toBe(false);
    });

    it('clears the transcript on reset', () => {
      const { result } = setup();
      act(() => result.current.start());
      act(() => latest().onresult(resultEvent({ final: 'something' })));

      act(() => result.current.reset());

      expect(result.current.transcript).toBe('');
      expect(result.current.interimTranscript).toBe('');
    });
  });

  describe('restarting', () => {
    it('restarts with a fresh recognizer when the browser ends the session', () => {
      const { result } = setup();
      act(() => result.current.start());

      act(() => latest().onend());
      act(() => jest.advanceTimersByTime(250));

      expect(MockSpeechRecognition.instances).toHaveLength(2);
      expect(latest().started).toBe(true);
      expect(result.current.isListening).toBe(true);
    });

    it('keeps the accumulated transcript across a restart', () => {
      const { result } = setup();
      act(() => result.current.start());
      act(() => latest().onresult(resultEvent({ final: 'first half' })));

      act(() => latest().onend());
      act(() => jest.advanceTimersByTime(250));
      act(() => latest().onresult(resultEvent({ final: 'second half' })));

      expect(result.current.transcript).toBe('first half second half');
    });

    it('does not restart after the seller stops the mic', () => {
      const { result } = setup();
      act(() => result.current.start());

      act(() => result.current.stop());
      act(() => jest.advanceTimersByTime(1000));

      expect(MockSpeechRecognition.instances).toHaveLength(1);
    });

    // Chrome throws InvalidStateError when the previous session still holds the device;
    // onend never fires for a start that threw, so the retry must come from the throw.
    it('recovers when the recognizer throws on start', () => {
      const { result } = setup();
      const failOnce = jest.spyOn(MockSpeechRecognition.prototype, 'start').mockImplementationOnce(() => {
        throw new Error('InvalidStateError');
      });

      expect(() => act(() => result.current.start())).not.toThrow();
      expect(result.current.isListening).toBe(true);

      act(() => jest.advanceTimersByTime(250));

      expect(MockSpeechRecognition.instances).toHaveLength(2);
      expect(latest().started).toBe(true);
      failOnce.mockRestore();
    });

    it('gives up rather than hot-looping when the session keeps dropping', () => {
      const { result } = setup();
      act(() => result.current.start());

      for (let i = 0; i < 7; i += 1) {
        act(() => latest().onend());
        act(() => jest.advanceTimersByTime(250));
      }

      expect(result.current.error).toMatch(/keeps dropping/i);
      expect(result.current.isListening).toBe(false);
      expect(MockSpeechRecognition.instances.length).toBeLessThanOrEqual(6);
    });
  });

  describe('suspension', () => {
    it('parks the recognizer while suspended and resumes it afterwards', () => {
      const { result, rerender } = setup({ suspended: false });
      act(() => result.current.start());
      const first = latest();

      rerender({ suspended: true });
      expect(first.aborted).toBe(true);
      expect(result.current.isCapturing).toBe(false);
      // Mic intent survives so the seller does not have to re-tap after every reply.
      expect(result.current.isListening).toBe(true);

      rerender({ suspended: false });
      expect(MockSpeechRecognition.instances).toHaveLength(2);
      expect(latest().started).toBe(true);
    });

    it('does not resume a suspended recognizer that the seller stopped', () => {
      const { result, rerender } = setup({ suspended: true });
      act(() => result.current.start());
      act(() => result.current.stop());

      rerender({ suspended: false });

      expect(MockSpeechRecognition.instances).toHaveLength(0);
    });
  });

  describe('errors', () => {
    it('sets a friendly error message when the microphone is denied', () => {
      const { result } = setup();
      act(() => result.current.start());

      act(() => latest().onerror({ error: 'not-allowed' }));

      expect(result.current.error).toMatch(/microphone access was denied/i);
      expect(result.current.isListening).toBe(false);
    });

    it('does not restart after a fatal error', () => {
      const { result } = setup();
      act(() => result.current.start());

      act(() => latest().onerror({ error: 'not-allowed' }));
      act(() => latest().onend?.());
      act(() => jest.advanceTimersByTime(1000));

      expect(MockSpeechRecognition.instances).toHaveLength(1);
    });

    // no-speech is routine across pauses in continuous mode; aborted is self-inflicted.
    it.each([['no-speech'], ['aborted']])('swallows the routine %s error', (code) => {
      const { result } = setup();
      act(() => result.current.start());

      act(() => latest().onerror({ error: code }));

      expect(result.current.error).toBe('');
      expect(result.current.isListening).toBe(true);
    });

    it('surfaces a network error without ending the session', () => {
      const { result } = setup();
      act(() => result.current.start());

      act(() => latest().onerror({ error: 'network' }));

      expect(result.current.error).toMatch(/network error/i);
      expect(result.current.isListening).toBe(true);
    });
  });
});
