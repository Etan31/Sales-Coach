import request from 'supertest';
import app from './app.js';

// Exercises the fully assembled Express app (routing + middleware + error envelope).
// No Supabase/AI network calls: config + the AI provider are mocked via jest.setup.js, and the
// protected-route check rejects before touching Supabase when no bearer token is present.
describe('API integration', () => {
  it('GET /api/health -> 200 with the ok envelope', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
  });

  it('GET /api/config -> 200 with the four option arrays of {value,label}', async () => {
    const res = await request(app).get('/api/config');
    expect(res.status).toBe(200);
    for (const key of ['businessTypes', 'difficulties', 'contactMethods', 'languages']) {
      expect(Array.isArray(res.body[key])).toBe(true);
      expect(res.body[key][0]).toHaveProperty('value');
      expect(res.body[key][0]).toHaveProperty('label');
    }
    expect(res.body.businessTypes).toHaveLength(12);
  });

  it('GET /api/statistics without a bearer token -> 401 error envelope', async () => {
    const res = await request(app).get('/api/statistics');
    expect(res.status).toBe(401);
    expect(res.body.status).toBe(401);
    expect(res.body.error).toBeDefined();
    expect(typeof res.body.timestamp).toBe('string');
  });

  it('unknown route -> 404 error envelope', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
  });
});
