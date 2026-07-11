import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TranscriptModal from './TranscriptModal.jsx';

describe('TranscriptModal', () => {
  beforeEach(() => {
    navigator.clipboard = { writeText: jest.fn().mockResolvedValue() };
  });

  it('renders the transcript text in a read-only textarea', () => {
    render(<TranscriptModal isOpen onClose={jest.fn()} transcript="You: Hello!" filename="t.txt" />);
    expect(screen.getByRole('textbox')).toHaveValue('You: Hello!');
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('renders nothing when closed', () => {
    render(<TranscriptModal isOpen={false} onClose={jest.fn()} transcript="hi" />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('copies the transcript via navigator.clipboard.writeText and shows a confirmation', async () => {
    render(<TranscriptModal isOpen onClose={jest.fn()} transcript="You: Hello!" filename="t.txt" />);

    await userEvent.click(screen.getByRole('button', { name: /copy/i }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('You: Hello!');
    expect(await screen.findByText(/copied/i)).toBeInTheDocument();
  });

  it('calls onClose when Close is clicked', async () => {
    const onClose = jest.fn();
    render(<TranscriptModal isOpen onClose={onClose} transcript="You: Hello!" />);

    await userEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
