import { saveTranscript, getTranscripts, getTranscript, clearTranscripts } from './localTranscripts.js';

function makeEntry(sessionId, overrides = {}) {
  return {
    sessionId,
    businessType: 'coffee_shop',
    difficulty: 'medium',
    contactMethod: 'walk_in',
    endedAt: '2026-07-01T10:00:00.000Z',
    overallScore: 80,
    text: `Transcript for ${sessionId}`,
    ...overrides
  };
}

describe('localTranscripts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty array when nothing is saved', () => {
    expect(getTranscripts()).toEqual([]);
  });

  it('saves and retrieves a transcript by sessionId', () => {
    saveTranscript(makeEntry('s1'));
    expect(getTranscript('s1')).toMatchObject({ sessionId: 's1', text: 'Transcript for s1' });
  });

  it('returns null for an unknown sessionId', () => {
    expect(getTranscript('missing')).toBeNull();
  });

  it('dedupes by sessionId, replacing the existing entry rather than duplicating it', () => {
    saveTranscript(makeEntry('s1', { overallScore: 50 }));
    saveTranscript(makeEntry('s1', { overallScore: 90 }));
    const all = getTranscripts();
    expect(all).toHaveLength(1);
    expect(all[0].overallScore).toBe(90);
  });

  it('orders transcripts newest first', () => {
    saveTranscript(makeEntry('s1'));
    saveTranscript(makeEntry('s2'));
    saveTranscript(makeEntry('s3'));
    expect(getTranscripts().map((entry) => entry.sessionId)).toEqual(['s3', 's2', 's1']);
  });

  it('caps the stored list at the most recent 50 entries', () => {
    for (let i = 0; i < 55; i += 1) {
      saveTranscript(makeEntry(`s${i}`));
    }
    const all = getTranscripts();
    expect(all).toHaveLength(50);
    expect(all[0].sessionId).toBe('s54');
    expect(all.some((entry) => entry.sessionId === 's0')).toBe(false);
    expect(all.some((entry) => entry.sessionId === 's4')).toBe(false);
    expect(all.some((entry) => entry.sessionId === 's5')).toBe(true);
  });

  it('clears all saved transcripts', () => {
    saveTranscript(makeEntry('s1'));
    saveTranscript(makeEntry('s2'));
    clearTranscripts();
    expect(getTranscripts()).toEqual([]);
    expect(getTranscript('s1')).toBeNull();
  });

  it('never throws even with corrupted storage content', () => {
    localStorage.setItem('salescoach.transcripts', 'not-json');
    expect(getTranscripts()).toEqual([]);
    expect(() => saveTranscript(makeEntry('s1'))).not.toThrow();
  });
});
