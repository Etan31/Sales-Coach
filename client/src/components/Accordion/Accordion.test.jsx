import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Accordion from './Accordion.jsx';

const sections = [
  { id: 'a', title: 'Strengths', content: 'You built rapport' },
  { id: 'b', title: 'Weaknesses', content: 'Closed too fast' }
];

describe('Accordion', () => {
  it('renders section titles with panels collapsed by default', () => {
    render(<Accordion sections={sections} />);
    expect(screen.getByRole('button', { name: /strengths/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /weaknesses/i })).toBeInTheDocument();
    expect(screen.queryByText('You built rapport')).not.toBeInTheDocument();
  });

  it('expands and collapses a section on click', async () => {
    render(<Accordion sections={sections} />);
    const trigger = screen.getByRole('button', { name: /strengths/i });

    await userEvent.click(trigger);
    expect(screen.getByText('You built rapport')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(trigger);
    expect(screen.queryByText('You built rapport')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
