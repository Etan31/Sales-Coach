import {
  createSessionSchema,
  chatSchema,
  endSessionSchema,
  sessionIdParamSchema,
  historyQuerySchema
} from './schemas.js';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('createSessionSchema', () => {
  const valid = { businessType: 'coffee_shop', difficulty: 'easy', contactMethod: 'walk_in', language: 'english' };

  it('accepts a valid payload', () => {
    const result = createSessionSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(valid);
  });

  it('rejects an invalid businessType enum value', () => {
    const result = createSessionSchema.safeParse({ ...valid, businessType: 'space_station' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid difficulty enum value', () => {
    const result = createSessionSchema.safeParse({ ...valid, difficulty: 'nightmare' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing field', () => {
    const { language: _language, ...incomplete } = valid;
    const result = createSessionSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });
});

describe('chatSchema', () => {
  it('accepts a valid payload', () => {
    const result = chatSchema.safeParse({ sessionId: VALID_UUID, message: 'Hello!' });
    expect(result.success).toBe(true);
  });

  it('rejects a non-uuid sessionId', () => {
    const result = chatSchema.safeParse({ sessionId: 'not-a-uuid', message: 'Hello!' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty message', () => {
    const result = chatSchema.safeParse({ sessionId: VALID_UUID, message: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a message over 2000 chars', () => {
    const result = chatSchema.safeParse({ sessionId: VALID_UUID, message: 'a'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('accepts a message at exactly the 2000 char boundary', () => {
    const result = chatSchema.safeParse({ sessionId: VALID_UUID, message: 'a'.repeat(2000) });
    expect(result.success).toBe(true);
  });
});

describe('endSessionSchema', () => {
  it('accepts a valid sessionId', () => {
    expect(endSessionSchema.safeParse({ sessionId: VALID_UUID }).success).toBe(true);
  });

  it('rejects a non-uuid sessionId', () => {
    expect(endSessionSchema.safeParse({ sessionId: '123' }).success).toBe(false);
  });
});

describe('sessionIdParamSchema', () => {
  it('accepts a valid uuid param', () => {
    expect(sessionIdParamSchema.safeParse({ id: VALID_UUID }).success).toBe(true);
  });

  it('rejects a non-uuid param', () => {
    expect(sessionIdParamSchema.safeParse({ id: 'abc' }).success).toBe(false);
  });
});

describe('historyQuerySchema', () => {
  it('applies defaults when page/pageSize are absent', () => {
    const result = historyQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ page: 1, pageSize: 20 });
  });

  it('coerces string query params to numbers', () => {
    const result = historyQuerySchema.safeParse({ page: '3', pageSize: '10' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ page: 3, pageSize: 10 });
  });

  it('rejects page below 1', () => {
    expect(historyQuerySchema.safeParse({ page: '0' }).success).toBe(false);
  });

  it('rejects pageSize above 50', () => {
    expect(historyQuerySchema.safeParse({ pageSize: '51' }).success).toBe(false);
  });

  it('accepts pageSize at the 50 boundary', () => {
    const result = historyQuerySchema.safeParse({ pageSize: '50' });
    expect(result.success).toBe(true);
    expect(result.data.pageSize).toBe(50);
  });

  it('rejects a non-numeric page', () => {
    expect(historyQuerySchema.safeParse({ page: 'abc' }).success).toBe(false);
  });
});
