import { jest } from '@jest/globals';

// Minimal chainable fake Supabase query-builder for unit tests.
//
// Real repositories call chains like `sb.from(t).select().eq().order().range()` or
// `.insert().select().single()`, awaiting at whatever point the chain ends. Every method on
// the returned node returns the SAME node (so any chain depth works), and the node is
// "thenable" (has a `.then`) so `await` resolves it to the configured `{ data, error, count }`
// no matter where in the chain the caller stops. Each method is a jest.fn so tests can assert
// on how the chain was called (e.g. what was passed to `.insert()`).
export function chain(result = { data: null, error: null }) {
  const node = {
    select: jest.fn(() => node),
    insert: jest.fn(() => node),
    update: jest.fn(() => node),
    eq: jest.fn(() => node),
    order: jest.fn(() => node),
    range: jest.fn(() => node),
    single: jest.fn(() => node),
    maybeSingle: jest.fn(() => node),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject)
  };
  return node;
}

// A fake request-scoped Supabase client: `.from` is a jest.fn so each test queues up
// one `chain(...)` per expected `.from(table)` call via `sb.from.mockReturnValueOnce(...)`.
export function createFakeSupabase() {
  return { from: jest.fn() };
}
