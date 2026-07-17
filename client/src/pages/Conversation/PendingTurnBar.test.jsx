import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PendingTurnBar from './PendingTurnBar.jsx';

/** Stub turn: keeps these tests on the wiring, with the state machine covered separately. */
function makePendingTurn(overrides = {}) {
  return {
    draft: '',
    setDraft: jest.fn(),
    appendPart: jest.fn(),
    requestCommit: jest.fn(),
    noteActivity: jest.fn(),
    commitNow: jest.fn(),
    discard: jest.fn(),
    isArmed: false,
    secondsRemaining: null,
    ...overrides
  };
}

function renderBar(overrides = {}) {
  const pendingTurn = makePendingTurn(overrides);
  render(<PendingTurnBar pendingTurn={pendingTurn} />);
  return { pendingTurn, textarea: screen.getByLabelText(/message/i) };
}

describe('PendingTurnBar', () => {
  describe('Enter and Shift+Enter', () => {
    it('sends the turn on Enter', async () => {
      const { pendingTurn, textarea } = renderBar({ draft: 'hello' });

      await userEvent.type(textarea, '{Enter}');

      expect(pendingTurn.requestCommit).toHaveBeenCalledTimes(1);
    });

    // The reported bug: Shift+Enter used to send because the field was a single-line
    // input, which cannot hold a newline.
    it('adds a newline on Shift+Enter without sending', async () => {
      const { pendingTurn, textarea } = renderBar({ draft: 'hello' });

      await userEvent.type(textarea, '{Shift>}{Enter}{/Shift}');

      expect(pendingTurn.requestCommit).not.toHaveBeenCalled();
      expect(pendingTurn.setDraft).toHaveBeenCalledWith('hello\n');
    });

    // Both IME shapes are driven with fireEvent because the exact event properties are
    // the thing under test, and userEvent will not forge them.
    it('does not send while an IME reports composing', () => {
      const { pendingTurn, textarea } = renderBar({ draft: 'こんにち' });

      fireEvent.keyDown(textarea, { key: 'Enter', isComposing: true });

      expect(pendingTurn.requestCommit).not.toHaveBeenCalled();
    });

    it('does not send on the legacy IME keyCode 229', () => {
      const { pendingTurn, textarea } = renderBar({ draft: 'こんにち' });

      fireEvent.keyDown(textarea, { key: 'Enter', keyCode: 229 });

      expect(pendingTurn.requestCommit).not.toHaveBeenCalled();
    });
  });

  describe('actions', () => {
    it('labels the send button "Send to coach" when idle', () => {
      renderBar({ draft: 'hello' });
      expect(screen.getByRole('button', { name: /send to coach/i })).toBeInTheDocument();
    });

    it('labels the send button "Send now" and shows the countdown while armed', () => {
      renderBar({ draft: 'hello', isArmed: true, secondsRemaining: 3 });

      expect(screen.getByRole('button', { name: /send now/i })).toBeInTheDocument();
      expect(screen.getByText(/sending in 3s/i)).toBeInTheDocument();
    });

    it('commits on submit', async () => {
      const { pendingTurn } = renderBar({ draft: 'hello', isArmed: true, secondsRemaining: 2 });

      await userEvent.click(screen.getByRole('button', { name: /send now/i }));

      expect(pendingTurn.commitNow).toHaveBeenCalledTimes(1);
    });

    it('discards on clear', async () => {
      const { pendingTurn } = renderBar({ draft: 'hello' });

      await userEvent.click(screen.getByRole('button', { name: /clear/i }));

      expect(pendingTurn.discard).toHaveBeenCalledTimes(1);
    });

    it('disables both actions with an empty draft', () => {
      renderBar({ draft: '   ' });

      expect(screen.getByRole('button', { name: /send to coach/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /clear/i })).toBeDisabled();
    });
  });

  describe('hint', () => {
    it('tells the seller Enter sends in auto mode', () => {
      render(<PendingTurnBar pendingTurn={makePendingTurn()} autoReply />);
      expect(screen.getByText(/enter sends/i)).toBeInTheDocument();
    });

    it('tells the seller to click Send in manual mode', () => {
      render(<PendingTurnBar pendingTurn={makePendingTurn()} autoReply={false} />);
      expect(screen.getByText(/enter stages your turn, then click send/i)).toBeInTheDocument();
    });
  });

  it('reports typing through setDraft', async () => {
    const { pendingTurn, textarea } = renderBar({ draft: '' });

    await userEvent.type(textarea, 'h');

    expect(pendingTurn.setDraft).toHaveBeenCalledWith('h');
  });
});
