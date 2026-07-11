import { chain, createFakeSupabase } from '../test-helpers/fakeSupabase.js';
import { getStatistics } from './statisticsService.js';

describe('statisticsService.getStatistics', () => {
  it('aggregates completed sessions with evaluations (object or array join shapes)', async () => {
    const sb = createFakeSupabase();
    const sessions = [
      {
        id: 's1',
        status: 'completed',
        created_at: '2026-07-01T10:00:00Z',
        evaluations: { overall_score: 60, rapport: 6, business_discovery: 5, confidence: 7, handling_objections: 6, value_selling: 5, closing: 4 }
      },
      {
        id: 's2',
        status: 'completed',
        created_at: '2026-07-03T10:00:00Z',
        evaluations: [{ overall_score: 80, rapport: 8, business_discovery: 7, confidence: 9, handling_objections: 8, value_selling: 7, closing: 6 }]
      },
      { id: 's3', status: 'active', created_at: '2026-07-05T10:00:00Z', evaluations: null }
    ];
    sb.from.mockReturnValueOnce(chain({ data: sessions }));

    const stats = await getStatistics(sb);

    expect(stats.totalSessions).toBe(3);
    expect(stats.completedSessions).toBe(2);
    expect(stats.averageScore).toBe(70); // (60 + 80) / 2
    expect(stats.skillAverages.rapport).toBe(7); // (6 + 8) / 2
    expect(stats.skillAverages.closing).toBe(5); // (4 + 6) / 2
    expect(stats.scoreTrend).toHaveLength(2);
    expect(stats.scoreTrend[0]).toEqual({ date: '2026-07-01', overallScore: 60, sessionId: 's1' });
    expect(stats.scoreTrend[1].sessionId).toBe('s2');
  });

  it('returns safe zeros/empty when there is no data', async () => {
    const sb = createFakeSupabase();
    sb.from.mockReturnValueOnce(chain({ data: [] }));

    const stats = await getStatistics(sb);

    expect(stats).toEqual({
      totalSessions: 0,
      completedSessions: 0,
      averageScore: 0,
      skillAverages: { rapport: 0, businessDiscovery: 0, confidence: 0, handlingObjections: 0, valueSelling: 0, closing: 0 },
      scoreTrend: []
    });
  });
});
