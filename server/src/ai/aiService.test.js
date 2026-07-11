// AI_MOCK=1 is set in jest.setup.js before config/index.js loads, so config.aiMock is
// true for this whole run and generateOwnerReply/evaluateConversation never touch the network.
import { generateOwnerReply, evaluateConversation } from './aiService.js';

describe('generateOwnerReply (mock mode)', () => {
  const profile = { business: 'Coffee Shop', ownerName: 'Carlos' };

  it('returns a non-empty string', async () => {
    const reply = await generateOwnerReply({
      profile,
      messages: [],
      difficulty: 'medium',
      language: 'english',
      contactMethod: 'walk_in'
    });
    expect(typeof reply).toBe('string');
    expect(reply.length).toBeGreaterThan(0);
  });

  it.each(['english', 'tagalog', 'taglish'])('returns a non-empty string for language=%s', async (language) => {
    const reply = await generateOwnerReply({ profile, messages: [], difficulty: 'hard', language, contactMethod: 'cold_call' });
    expect(reply.length).toBeGreaterThan(0);
  });

  it.each(['easy', 'medium', 'hard', 'impossible'])('returns a non-empty string for difficulty=%s', async (difficulty) => {
    const reply = await generateOwnerReply({ profile, messages: [], difficulty, language: 'taglish', contactMethod: 'email' });
    expect(reply.length).toBeGreaterThan(0);
  });

  it('falls back gracefully for an unknown language/difficulty', async () => {
    const reply = await generateOwnerReply({
      profile,
      messages: [],
      difficulty: 'nightmare',
      language: 'klingon',
      contactMethod: 'walk_in'
    });
    expect(typeof reply).toBe('string');
    expect(reply.length).toBeGreaterThan(0);
  });
});

describe('evaluateConversation (mock mode)', () => {
  const profile = { business: 'Coffee Shop', ownerName: 'Carlos' };
  const messages = [
    { role: 'owner', content: 'Bakit pa website eh andiyan naman ang Facebook?' },
    { role: 'seller', content: 'Naiintindihan ko po, pero may mga customer na hindi umaabot sa Facebook.' },
    { role: 'owner', content: 'Sige, tell me more.' },
    { role: 'seller', content: 'Puwede po namin ipakita ang mga presyo at reviews sa website.' }
  ];

  it('returns an evaluation object with the six skills in 0-10 and overallScore in 0-100', async () => {
    const evaluation = await evaluateConversation({ profile, messages, language: 'english' });

    for (const skill of ['rapport', 'businessDiscovery', 'confidence', 'handlingObjections', 'valueSelling', 'closing']) {
      expect(typeof evaluation[skill]).toBe('number');
      expect(evaluation[skill]).toBeGreaterThanOrEqual(0);
      expect(evaluation[skill]).toBeLessThanOrEqual(10);
    }

    expect(typeof evaluation.overallScore).toBe('number');
    expect(evaluation.overallScore).toBeGreaterThanOrEqual(0);
    expect(evaluation.overallScore).toBeLessThanOrEqual(100);
  });

  it('returns the required arrays and a summary', async () => {
    const evaluation = await evaluateConversation({ profile, messages, language: 'taglish' });

    expect(typeof evaluation.summary).toBe('string');
    expect(evaluation.summary.length).toBeGreaterThan(0);
    expect(Array.isArray(evaluation.strengths)).toBe(true);
    expect(Array.isArray(evaluation.weaknesses)).toBe(true);
    expect(Array.isArray(evaluation.missedOpportunities)).toBe(true);
    expect(Array.isArray(evaluation.betterResponses)).toBe(true);
    expect(Array.isArray(evaluation.nextPracticeFocus)).toBe(true);
  });

  it('builds betterResponses from actual owner/seller pairs in the transcript', async () => {
    const evaluation = await evaluateConversation({ profile, messages, language: 'english' });
    expect(evaluation.betterResponses.length).toBeGreaterThan(0);
    evaluation.betterResponses.forEach((item) => {
      expect(item).toHaveProperty('client');
      expect(item).toHaveProperty('yourResponse');
      expect(item).toHaveProperty('betterResponse');
    });
  });

  it('handles an empty transcript without throwing', async () => {
    const evaluation = await evaluateConversation({ profile, messages: [], language: 'english' });
    expect(evaluation.betterResponses).toEqual([]);
    expect(evaluation.overallScore).toBeGreaterThanOrEqual(0);
  });
});
