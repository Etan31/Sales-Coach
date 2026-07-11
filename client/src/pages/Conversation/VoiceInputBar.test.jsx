import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VoiceInputBar from './VoiceInputBar.jsx';

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

describe('VoiceInputBar', () => {
  afterEach(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
    MockSpeechRecognition.instances = [];
  });

  it('renders the unsupported fallback form and sends typed text when SpeechRecognition is unavailable', async () => {
    const onSend = jest.fn();
    render(<VoiceInputBar onSend={onSend} disabled={false} language="english" />);

    expect(screen.getByText(/voice input isn't supported/i)).toBeInTheDocument();

    const input = screen.getByLabelText(/message/i);
    await userEvent.type(input, 'Hello owner');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));

    expect(onSend).toHaveBeenCalledWith('Hello owner');
  });

  it('starts recognition on mic click and sends the final transcript when it ends', async () => {
    window.SpeechRecognition = MockSpeechRecognition;
    const onSend = jest.fn();

    render(<VoiceInputBar onSend={onSend} disabled={false} language="english" />);

    const micButton = screen.getByRole('button', { name: /start recording/i });
    await userEvent.click(micButton);

    expect(MockSpeechRecognition.instances).toHaveLength(1);
    const instance = MockSpeechRecognition.instances[0];
    expect(instance.started).toBe(true);

    act(() => {
      instance.onresult({
        resultIndex: 0,
        results: [{ isFinal: true, 0: { transcript: 'I want to buy your product' } }]
      });
    });

    act(() => {
      instance.onend();
    });

    expect(onSend).toHaveBeenCalledWith('I want to buy your product');
  });
});
