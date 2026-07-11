import { formatTranscript } from './transcript.js';

const session = {
  id: 'session-1',
  difficulty: 'medium',
  contactMethod: 'walk_in',
  createdAt: '2026-07-01T10:00:00.000Z',
  businessInfo: { business: 'Coffee Shop', ownerName: 'Carlos' }
};

describe('formatTranscript', () => {
  it('includes a header with business, difficulty, contact method, and date', () => {
    const text = formatTranscript(session, []);
    expect(text).toContain('Coffee Shop');
    expect(text).toContain('Medium');
    expect(text).toContain('Walk In');
  });

  it('formats seller lines as "You:" and owner lines with the owner name, in sequence order', () => {
    const messages = [
      { id: 'm2', role: 'owner', content: 'Hi there', sequence: 2, createdAt: '' },
      { id: 'm1', role: 'seller', content: 'Hello!', sequence: 1, createdAt: '' }
    ];
    const text = formatTranscript(session, messages);
    const lines = text.trim().split('\n');
    const sellerIndex = lines.findIndex((line) => line === 'You: Hello!');
    const ownerIndex = lines.findIndex((line) => line === 'Carlos: Hi there');
    expect(sellerIndex).toBeGreaterThan(-1);
    expect(ownerIndex).toBeGreaterThan(-1);
    expect(sellerIndex).toBeLessThan(ownerIndex);
  });

  it('sorts out-of-order messages defensively by sequence', () => {
    const messages = [
      { id: 'm3', role: 'owner', content: 'Third', sequence: 3 },
      { id: 'm1', role: 'seller', content: 'First', sequence: 1 },
      { id: 'm2', role: 'owner', content: 'Second', sequence: 2 }
    ];
    const text = formatTranscript(session, messages);
    const transcriptBody = text.split('\n\n')[1];
    expect(transcriptBody.split('\n')).toEqual(['You: First', 'Carlos: Second', 'Carlos: Third']);
  });

  it('falls back to "Owner" when ownerName is missing', () => {
    const noOwnerSession = { ...session, businessInfo: { business: 'Salon' } };
    const text = formatTranscript(noOwnerSession, [{ id: 'm1', role: 'owner', content: 'Hey', sequence: 1 }]);
    expect(text).toContain('Owner: Hey');
  });

  it('handles empty or missing messages gracefully', () => {
    expect(() => formatTranscript(session, [])).not.toThrow();
    expect(() => formatTranscript(session, undefined)).not.toThrow();
    expect(() => formatTranscript(session, null)).not.toThrow();
    expect(formatTranscript(session, [])).toContain('No messages recorded.');
  });

  it('handles a missing session gracefully', () => {
    expect(() => formatTranscript(undefined, [])).not.toThrow();
    expect(formatTranscript(undefined, [])).toContain('Unknown Business');
  });
});
