import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import usePendingTurn from '../../hooks/usePendingTurn.js';
import VoiceInputBar from './VoiceInputBar.jsx';

/** Minimal mock of the browser SpeechRecognition API, controllable from the test. */
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

function resultEvent({ final = '', interim = '' } = {}) {
  const results = [];
  if (final) results.push({ isFinal: true, 0: { transcript: final } });
  if (interim) results.push({ isFinal: false, 0: { transcript: interim } });
  return { resultIndex: 0, results };
}

const latest = () => MockSpeechRecognition.instances[MockSpeechRecognition.instances.length - 1];

/** Wires the real pending turn to the bar, so the recognition-to-turn seam is exercised. */
function Harness({ onCommit, pauseAllowanceMs = 3000, autoReply = true, suspended = false, disabled = false }) {
  const pendingTurn = usePendingTurn({ onCommit, pauseAllowanceMs, autoReply });
  return (
    <VoiceInputBar
      pendingTurn={pendingTurn}
      language="english"
      autoReply={autoReply}
      suspended={suspended}
      disabled={disabled}
    />
  );
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  delete window.SpeechRecognition;
  delete window.webkitSpeechRecognition;
  MockSpeechRecognition.instances = [];
});

// userEvent v14 schedules its own timers, so it must be told how to advance the fakes.
const setupUser = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

describe('VoiceInputBar', () => {
  describe('without SpeechRecognition support', () => {
    it('renders the fallback note and still sends a typed turn', async () => {
      const user = setupUser();
      const onCommit = jest.fn();
      render(<Harness onCommit={onCommit} autoReply={false} />);

      expect(screen.getByText(/voice input isn't supported/i)).toBeInTheDocument();

      await user.type(screen.getByLabelText(/message/i), 'Hello owner');
      await user.click(screen.getByRole('button', { name: /send to coach/i }));

      expect(onCommit).toHaveBeenCalledWith('Hello owner');
    });
  });

  describe('with SpeechRecognition support', () => {
    beforeEach(() => {
      window.SpeechRecognition = MockSpeechRecognition;
    });

    it('starts recognition on mic click', async () => {
      const user = setupUser();
      render(<Harness onCommit={jest.fn()} />);

      await user.click(screen.getByRole('button', { name: /start recording/i }));

      expect(MockSpeechRecognition.instances).toHaveLength(1);
      expect(latest().started).toBe(true);
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });

    it('stages recognized speech in the editable composer', async () => {
      const user = setupUser();
      render(<Harness onCommit={jest.fn()} />);
      await user.click(screen.getByRole('button', { name: /start recording/i }));

      act(() => latest().onresult(resultEvent({ final: 'I want to buy your product' })));

      expect(screen.getByLabelText(/message/i)).toHaveValue('I want to buy your product');
    });

    it('sends the staged turn once the pause allowance elapses', async () => {
      const user = setupUser();
      const onCommit = jest.fn();
      render(<Harness onCommit={onCommit} pauseAllowanceMs={3000} />);
      await user.click(screen.getByRole('button', { name: /start recording/i }));

      act(() => latest().onresult(resultEvent({ final: 'I want to buy your product' })));
      expect(onCommit).not.toHaveBeenCalled();

      act(() => jest.advanceTimersByTime(3000));

      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(onCommit).toHaveBeenCalledWith('I want to buy your product');
    });

    // The reported bug: pausing to think used to end the turn and trigger a reply.
    it('does not send while the seller is still speaking after a pause', async () => {
      const user = setupUser();
      const onCommit = jest.fn();
      render(<Harness onCommit={onCommit} pauseAllowanceMs={3000} />);
      await user.click(screen.getByRole('button', { name: /start recording/i }));

      act(() => latest().onresult(resultEvent({ final: 'Hi, I noticed your shop' })));
      act(() => jest.advanceTimersByTime(2000));

      act(() => latest().onresult(resultEvent({ interim: 'and I' })));
      act(() => jest.advanceTimersByTime(2000));

      expect(onCommit).not.toHaveBeenCalled();
    });

    it('joins a second thought into the same turn', async () => {
      const user = setupUser();
      const onCommit = jest.fn();
      render(<Harness onCommit={onCommit} pauseAllowanceMs={3000} />);
      await user.click(screen.getByRole('button', { name: /start recording/i }));

      act(() => latest().onresult(resultEvent({ final: 'Hi, I noticed your shop' })));
      act(() => jest.advanceTimersByTime(2000));
      act(() => latest().onresult(resultEvent({ final: 'has no website' })));
      act(() => jest.advanceTimersByTime(3000));

      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(onCommit).toHaveBeenCalledWith('Hi, I noticed your shop has no website');
    });

    it('shows interim speech beside the mic rather than in the composer', async () => {
      const user = setupUser();
      render(<Harness onCommit={jest.fn()} />);
      await user.click(screen.getByRole('button', { name: /start recording/i }));

      act(() => latest().onresult(resultEvent({ interim: 'thinking out loud' })));

      expect(screen.getByText('thinking out loud')).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toHaveValue('');
    });

    it('parks the recognizer while the owner is replying', async () => {
      const user = setupUser();
      const { rerender } = render(<Harness onCommit={jest.fn()} />);
      await user.click(screen.getByRole('button', { name: /start recording/i }));
      const first = latest();

      rerender(<Harness onCommit={jest.fn()} suspended />);

      expect(first.aborted).toBe(true);
      // Mic intent survives, so the seller need not re-tap after every reply.
      expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument();
    });

    it('surfaces a recognition error', async () => {
      const user = setupUser();
      render(<Harness onCommit={jest.fn()} />);
      await user.click(screen.getByRole('button', { name: /start recording/i }));

      act(() => latest().onerror({ error: 'not-allowed' }));

      expect(screen.getByRole('alert')).toHaveTextContent(/microphone access was denied/i);
    });
  });
});
