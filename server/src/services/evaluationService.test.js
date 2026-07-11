import { chain, createFakeSupabase } from '../test-helpers/fakeSupabase.js';
import { endSession } from './evaluationService.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';

describe('evaluationService.endSession', () => {
  const activeSession = { id: 's1', status: 'active', language: 'english', business_profile: { business: 'Coffee Shop' } };
  const messages = [
    { role: 'seller', content: 'Hi po', sequence: 1 },
    { role: 'owner', content: 'Bakit?', sequence: 2 }
  ];
  const evalRow = {
    id: 'e1',
    session_id: 's1',
    overall_score: 72,
    rapport: 7,
    business_discovery: 6,
    confidence: 8,
    handling_objections: 7,
    value_selling: 6,
    closing: 5,
    summary: 'Solid effort',
    strengths: ['a'],
    weaknesses: ['b'],
    missed_opportunities: ['c'],
    better_responses: [],
    next_practice_focus: ['d'],
    created_at: 't'
  };

  it('persists the evaluation, marks the session completed, and returns the EvaluationObject', async () => {
    const sb = createFakeSupabase();
    sb.from
      .mockReturnValueOnce(chain({ data: activeSession })) // getSessionById
      .mockReturnValueOnce(chain({ data: messages })) // listMessages
      .mockReturnValueOnce(chain({ data: evalRow })) // createEvaluation
      .mockReturnValueOnce(chain({ data: { ...activeSession, status: 'completed' } })); // updateSessionStatus

    const result = await endSession(sb, 's1');

    expect(result.sessionId).toBe('s1');
    expect(result.overallScore).toBe(72);
    expect(result.rapport).toBe(7);
    expect(result.businessDiscovery).toBe(6);
    expect(Array.isArray(result.nextPracticeFocus)).toBe(true);
    expect(sb.from).toHaveBeenCalledTimes(4);
  });

  it('throws ConflictError when the session is already ended', async () => {
    const sb = createFakeSupabase();
    sb.from.mockReturnValueOnce(chain({ data: { id: 's1', status: 'completed' } }));

    await expect(endSession(sb, 's1')).rejects.toThrow(ConflictError);
    expect(sb.from).toHaveBeenCalledTimes(1);
  });

  it('throws ConflictError when there is no seller message to evaluate', async () => {
    const sb = createFakeSupabase();
    sb.from
      .mockReturnValueOnce(chain({ data: activeSession })) // getSessionById
      .mockReturnValueOnce(chain({ data: [] })); // listMessages (empty)

    await expect(endSession(sb, 's1')).rejects.toThrow('No conversation to evaluate');
    expect(sb.from).toHaveBeenCalledTimes(2);
  });

  it('throws NotFoundError when the session does not exist', async () => {
    const sb = createFakeSupabase();
    sb.from.mockReturnValueOnce(chain({ data: null }));

    await expect(endSession(sb, 'missing')).rejects.toThrow(NotFoundError);
  });
});
