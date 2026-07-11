import { render, screen } from '@testing-library/react';
import ChatBubble from './ChatBubble.jsx';

describe('ChatBubble', () => {
  it('renders seller content aligned to the seller side', () => {
    const { container } = render(<ChatBubble role="seller" content="Hello there" />);
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(container.querySelector('.seller')).toBeTruthy();
    expect(container.querySelector('.rowSeller')).toBeTruthy();
  });

  it('renders owner content aligned to the owner side', () => {
    const { container } = render(<ChatBubble role="owner" content="Bakit?" />);
    expect(screen.getByText('Bakit?')).toBeInTheDocument();
    expect(container.querySelector('.owner')).toBeTruthy();
    expect(container.querySelector('.rowOwner')).toBeTruthy();
  });

  it('renders a timestamp element when a valid timestamp is provided', () => {
    const { container } = render(<ChatBubble role="owner" content="Hi" timestamp="2026-07-10T08:30:00Z" />);
    expect(container.querySelector('time')).toBeTruthy();
  });

  it('omits the timestamp element when none is provided', () => {
    const { container } = render(<ChatBubble role="owner" content="Hi" />);
    expect(container.querySelector('time')).toBeNull();
  });
});
