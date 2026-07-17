import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TurnSettings from './TurnSettings.jsx';

function renderSettings(props = {}) {
  const onChange = jest.fn();
  const onActivity = jest.fn();
  const onToggleMute = jest.fn();
  render(
    <TurnSettings
      autoReply
      pauseAllowanceMs={3000}
      onChange={onChange}
      onActivity={onActivity}
      onToggleMute={onToggleMute}
      {...props}
    />
  );
  return { onChange, onActivity, onToggleMute };
}

describe('TurnSettings', () => {
  describe('auto-reply toggle', () => {
    it('reflects auto-reply being on', () => {
      renderSettings({ autoReply: true });
      expect(screen.getByRole('button', { name: /auto-reply: on/i })).toHaveAttribute('aria-pressed', 'true');
    });

    it('turns auto-reply off', async () => {
      const { onChange } = renderSettings({ autoReply: true });

      await userEvent.click(screen.getByRole('button', { name: /auto-reply: on/i }));

      expect(onChange).toHaveBeenCalledWith({ autoReply: false });
    });

    it('turns auto-reply back on', async () => {
      const { onChange } = renderSettings({ autoReply: false });

      await userEvent.click(screen.getByRole('button', { name: /auto-reply: off/i }));

      expect(onChange).toHaveBeenCalledWith({ autoReply: true });
    });
  });

  describe('pause allowance', () => {
    it('shows the current allowance in seconds', () => {
      renderSettings({ pauseAllowanceMs: 4500 });
      expect(screen.getByText('4.5s')).toBeInTheDocument();
    });

    it('reports a new allowance', () => {
      const { onChange } = renderSettings();

      fireEvent.change(screen.getByRole('slider'), { target: { value: '8000' } });

      expect(onChange).toHaveBeenCalledWith({ pauseAllowanceMs: 8000 });
    });

    // Adjusting the slider must cancel a live countdown, or the turn would fire against
    // an allowance the seller was in the middle of changing.
    it('reports activity before the change', () => {
      const { onActivity } = renderSettings();

      fireEvent.change(screen.getByRole('slider'), { target: { value: '8000' } });

      expect(onActivity).toHaveBeenCalled();
    });

    it('disables the slider when auto-reply is off', () => {
      renderSettings({ autoReply: false });
      expect(screen.getByRole('slider')).toBeDisabled();
    });
  });

  describe('mute', () => {
    it('is hidden unless requested', () => {
      renderSettings({ showMute: false });
      expect(screen.queryByRole('button', { name: /mute voice/i })).not.toBeInTheDocument();
    });

    it('toggles voice on a cold call', async () => {
      const { onToggleMute } = renderSettings({ showMute: true, muted: false });

      await userEvent.click(screen.getByRole('button', { name: /mute voice/i }));

      expect(onToggleMute).toHaveBeenCalledTimes(1);
    });

    it('offers to unmute when muted', () => {
      renderSettings({ showMute: true, muted: true });
      expect(screen.getByRole('button', { name: /unmute voice/i })).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
