import { toSessionObject, toMessageObject, toEvaluationObject, toHistoryItem } from './mappers.js';

const businessProfileRow = {
  business: 'Coffee Shop',
  ownerName: 'Carlos',
  ownerAge: 43,
  personality: 'Busy',
  technologyLevel: 'Low',
  budget: 12000,
  website: false,
  facebook: true,
  marketing: ['Facebook', 'Word of Mouth'],
  painPoints: ['Few repeat customers', 'Walk-ins only'],
  allowedObjections: ['budget', 'facebook', 'trust'],
  emotion: 'Busy'
};

const sessionRow = {
  id: 'sess-1',
  business_type: 'coffee_shop',
  difficulty: 'hard',
  contact_method: 'walk_in',
  language: 'taglish',
  status: 'active',
  created_at: '2026-01-01T00:00:00.000Z',
  ended_at: null,
  business_profile: businessProfileRow
};

describe('toSessionObject', () => {
  it('builds the public SessionObject shape with camelCase top-level fields', () => {
    const session = toSessionObject(sessionRow);
    expect(session).toMatchObject({
      id: 'sess-1',
      businessType: 'coffee_shop',
      difficulty: 'hard',
      contactMethod: 'walk_in',
      language: 'taglish',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      endedAt: null
    });
  });

  it('builds businessInfo as ONLY the public subset', () => {
    const session = toSessionObject(sessionRow);
    expect(session.businessInfo).toEqual({
      business: 'Coffee Shop',
      ownerName: 'Carlos',
      ownerAge: 43,
      personality: 'Busy',
      technologyLevel: 'Low',
      hasWebsite: false,
      hasFacebook: true
    });
  });

  it('never leaks budget, painPoints, or allowedObjections anywhere in the output', () => {
    const session = toSessionObject(sessionRow);
    const serialized = JSON.stringify(session);
    expect(serialized).not.toMatch(/budget/i);
    expect(serialized).not.toMatch(/painPoints/i);
    expect(serialized).not.toMatch(/allowedObjections/i);
    expect(session.businessInfo).not.toHaveProperty('budget');
    expect(session.businessInfo).not.toHaveProperty('painPoints');
    expect(session.businessInfo).not.toHaveProperty('allowedObjections');
  });

  it('handles a missing/null business_profile without throwing', () => {
    const session = toSessionObject({ ...sessionRow, business_profile: null });
    expect(session.businessInfo).toEqual({
      business: null,
      ownerName: null,
      ownerAge: null,
      personality: null,
      technologyLevel: null,
      hasWebsite: false,
      hasFacebook: false
    });
  });

  it('defaults endedAt to null when absent', () => {
    const { ended_at: _endedAt, ...rest } = sessionRow;
    const session = toSessionObject(rest);
    expect(session.endedAt).toBeNull();
  });
});

describe('toMessageObject', () => {
  it('maps snake_case to camelCase', () => {
    const row = { id: 'm1', role: 'owner', content: 'Hello there', sequence: 3, created_at: '2026-01-01T00:00:01.000Z' };
    expect(toMessageObject(row)).toEqual({
      id: 'm1',
      role: 'owner',
      content: 'Hello there',
      sequence: 3,
      createdAt: '2026-01-01T00:00:01.000Z'
    });
  });
});

describe('toEvaluationObject', () => {
  it('maps snake_case columns to camelCase, defaulting array fields', () => {
    const row = {
      id: 'ev1',
      session_id: 'sess-1',
      overall_score: 74,
      rapport: 7,
      business_discovery: 6,
      confidence: 8,
      handling_objections: 5,
      value_selling: 6,
      closing: 7,
      summary: 'Solid effort.',
      strengths: null,
      weaknesses: undefined,
      missed_opportunities: ['Missed the pricing objection'],
      better_responses: [{ client: 'Mahal naman.', yourResponse: '...', betterResponse: '...' }],
      next_practice_focus: null,
      created_at: '2026-01-01T00:05:00.000Z'
    };

    expect(toEvaluationObject(row)).toEqual({
      id: 'ev1',
      sessionId: 'sess-1',
      overallScore: 74,
      rapport: 7,
      businessDiscovery: 6,
      confidence: 8,
      handlingObjections: 5,
      valueSelling: 6,
      closing: 7,
      summary: 'Solid effort.',
      strengths: [],
      weaknesses: [],
      missedOpportunities: ['Missed the pricing objection'],
      betterResponses: [{ client: 'Mahal naman.', yourResponse: '...', betterResponse: '...' }],
      nextPracticeFocus: [],
      createdAt: '2026-01-01T00:05:00.000Z'
    });
  });
});

describe('toHistoryItem', () => {
  const base = {
    id: 'sess-2',
    business_type: 'salon',
    difficulty: 'medium',
    contact_method: 'messenger',
    language: 'english',
    status: 'completed',
    created_at: '2026-01-02T00:00:00.000Z',
    ended_at: '2026-01-02T00:10:00.000Z'
  };

  it('extracts overallScore from a flattened overall_score column', () => {
    const item = toHistoryItem({ ...base, overall_score: 82 });
    expect(item.overallScore).toBe(82);
    expect(item).toMatchObject({
      id: 'sess-2',
      businessType: 'salon',
      difficulty: 'medium',
      contactMethod: 'messenger',
      language: 'english',
      status: 'completed',
      createdAt: base.created_at,
      endedAt: base.ended_at
    });
  });

  it('extracts overallScore from an embedded evaluations object', () => {
    const item = toHistoryItem({ ...base, evaluations: { overall_score: 55 } });
    expect(item.overallScore).toBe(55);
  });

  it('extracts overallScore from an embedded evaluations one-item array', () => {
    const item = toHistoryItem({ ...base, evaluations: [{ overall_score: 91 }] });
    expect(item.overallScore).toBe(91);
  });

  it('is null when there is no evaluation yet', () => {
    const item = toHistoryItem({ ...base, status: 'active', ended_at: null, evaluations: null });
    expect(item.overallScore).toBeNull();
    expect(item.endedAt).toBeNull();
  });
});
