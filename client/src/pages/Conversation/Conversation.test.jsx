import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Conversation from './Conversation.jsx';
import { chatApi, sessionApi } from '../../services/api/index.js';

jest.mock('../../services/api/index.js', () => ({
  sessionApi: { get: jest.fn(), end: jest.fn() },
  chatApi: { send: jest.fn() }
}));
jest.mock('../../services/preload.js', () => ({ preloadSessionResult: jest.fn() }));

// httpClient reads import.meta.env at module load, which babel-jest cannot transform in
// CJS; only the ApiError class is needed here.
jest.mock('../../services/httpClient.js', () => ({
  ApiError: class ApiError extends Error {
    constructor(message, status) {
      super(message);
      this.status = status;
    }
  }
}));

// Must carry the `mock` prefix: jest.mock is hoisted above this declaration.
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'session-1' }),
  useNavigate: () => mockNavigate
}));

function sessionFixture(overrides = {}) {
  return {
    session: {
      id: 'session-1',
      status: 'active',
      difficulty: 'medium',
      language: 'english',
      contactMethod: 'messenger',
      createdAt: '2026-07-17T10:00:00.000Z',
      businessInfo: {
        business: 'Cafe Luna',
        ownerName: 'Maria',
        ownerAge: 44,
        personality: 'Skeptical',
        technologyLevel: 'Low',
        hasWebsite: false,
        hasFacebook: true
      },
      ...overrides
    },
    messages: []
  };
}

/** Renders and flushes the initial session load. */
async function renderConversation(overrides) {
  sessionApi.get.mockResolvedValue(sessionFixture(overrides));
  render(<Conversation />);
  expect(await screen.findByLabelText(/message/i)).toBeInTheDocument();
}

const user = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
  jest.clearAllMocks();
  // Not implemented by jsdom; the page scrolls to the newest message on every render.
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  chatApi.send.mockResolvedValue({
    message: { id: 'm2', role: 'owner', content: 'What is this about?', createdAt: '2026-07-17T10:00:05.000Z' }
  });
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('Conversation', () => {
  it('renders the roleplay screen with the turn controls', async () => {
    await renderConversation();

    expect(screen.getByText('Cafe Luna')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /auto-reply: on/i })).toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveValue('3000');
  });

  // The reported bug: Enter used to be the only outcome a single-line input could give.
  it('stages a turn on Enter instead of sending it immediately', async () => {
    await renderConversation();

    await user().type(screen.getByLabelText(/message/i), 'Hi there{Enter}');

    expect(chatApi.send).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /send now/i })).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(3000));

    expect(chatApi.send).toHaveBeenCalledWith({ sessionId: 'session-1', message: 'Hi there' });
  });

  it('adds a newline on Shift+Enter without staging a turn', async () => {
    await renderConversation();

    await user().type(screen.getByLabelText(/message/i), 'line one{Shift>}{Enter}{/Shift}line two');

    expect(screen.getByLabelText(/message/i)).toHaveValue('line one\nline two');
    expect(screen.queryByRole('button', { name: /send now/i })).not.toBeInTheDocument();

    act(() => jest.advanceTimersByTime(5000));
    expect(chatApi.send).not.toHaveBeenCalled();
  });

  // "user can adds more chat if it accidentally enters"
  it('lets a second thought join the same turn before the coach replies', async () => {
    await renderConversation();
    const typist = user();

    await typist.type(screen.getByLabelText(/message/i), 'Hi there{Enter}');
    act(() => jest.advanceTimersByTime(1000));
    await typist.type(screen.getByLabelText(/message/i), ' and one more thing{Enter}');
    act(() => jest.advanceTimersByTime(3000));

    expect(chatApi.send).toHaveBeenCalledTimes(1);
    expect(chatApi.send).toHaveBeenCalledWith({
      sessionId: 'session-1',
      message: 'Hi there and one more thing'
    });
  });

  it('sends only on click when auto-reply is turned off', async () => {
    await renderConversation();
    const typist = user();

    await typist.click(screen.getByRole('button', { name: /auto-reply: on/i }));
    await typist.type(screen.getByLabelText(/message/i), 'Hi there{Enter}');

    act(() => jest.advanceTimersByTime(30000));
    expect(chatApi.send).not.toHaveBeenCalled();

    await typist.click(screen.getByRole('button', { name: /send to coach/i }));
    expect(chatApi.send).toHaveBeenCalledWith({ sessionId: 'session-1', message: 'Hi there' });
  });

  it('restores saved preferences on load', async () => {
    localStorage.setItem(
      'salescoach.callPrefs',
      JSON.stringify({ autoReply: false, pauseAllowanceMs: 8000, muted: false })
    );

    await renderConversation();

    expect(screen.getByRole('button', { name: /auto-reply: off/i })).toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveValue('8000');
  });

  it('shows the owner reply once the turn is sent', async () => {
    await renderConversation();

    await user().type(screen.getByLabelText(/message/i), 'Hi there{Enter}');
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    expect(await screen.findByText('What is this about?')).toBeInTheDocument();
  });

  it('cancels a staged auto-send while the end-conversation modal is open', async () => {
    await renderConversation();
    const typist = user();

    await typist.type(screen.getByLabelText(/message/i), 'Hi there{Enter}');
    await typist.click(screen.getByRole('button', { name: /end conversation/i }));

    act(() => jest.advanceTimersByTime(10000));

    expect(chatApi.send).not.toHaveBeenCalled();
  });

  describe('cold call', () => {
    it('offers the mic and the voice mute toggle', async () => {
      await renderConversation({ contactMethod: 'cold_call' });

      expect(screen.getByText(/voice input isn't supported/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mute voice/i })).toBeInTheDocument();
    });

    it('hides the mute toggle for a text conversation', async () => {
      await renderConversation({ contactMethod: 'messenger' });
      expect(screen.queryByRole('button', { name: /mute voice/i })).not.toBeInTheDocument();
    });
  });
});
