import { chain, createFakeSupabase } from '../test-helpers/fakeSupabase.js';
import { postMessage } from './chatService.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';

// AI_MOCK=1 (jest.setup.js) makes generateOwnerReply return a canned line, no network.
describe('chatService.postMessage', () => {
  const activeSession = {
    id: 's1',
    status: 'active',
    difficulty: 'medium',
    language: 'english',
    contact_method: 'walk_in',
    business_profile: { business: 'Coffee Shop', allowedObjections: ['budget'] }
  };

  it('persists seller + owner messages and returns the owner MessageObject', async () => {
    const sb = createFakeSupabase();
    const ownerRow = { id: 'm2', session_id: 's1', role: 'owner', content: 'OWNER_REPLY', sequence: 2, created_at: 't2' };
    sb.from
      .mockReturnValueOnce(chain({ data: activeSession })) // getSessionById
      .mockReturnValueOnce(chain({ data: [] })) // listMessages
      .mockReturnValueOnce(chain({ data: { id: 'm1', session_id: 's1', role: 'seller', content: 'Hello', sequence: 1, created_at: 't1' } })) // addMessage seller
      .mockReturnValueOnce(chain({ data: ownerRow })); // addMessage owner

    const result = await postMessage(sb, { sessionId: 's1', message: 'Hello' });

    expect(result).toEqual({ id: 'm2', role: 'owner', content: 'OWNER_REPLY', sequence: 2, createdAt: 't2' });
    expect(sb.from).toHaveBeenCalledTimes(4);
  });

  it('throws ConflictError when the session is not active', async () => {
    const sb = createFakeSupabase();
    sb.from.mockReturnValueOnce(chain({ data: { id: 's1', status: 'completed' } }));

    await expect(postMessage(sb, { sessionId: 's1', message: 'Hi' })).rejects.toThrow(ConflictError);
    expect(sb.from).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundError when the session does not exist', async () => {
    const sb = createFakeSupabase();
    sb.from.mockReturnValueOnce(chain({ data: null }));

    await expect(postMessage(sb, { sessionId: 'missing', message: 'Hi' })).rejects.toThrow(NotFoundError);
  });
});
