import * as sessionRepository from '../repositories/sessionRepository.js';
import * as messageRepository from '../repositories/messageRepository.js';
import { generateOwnerReply } from '../ai/aiService.js';
import { toMessageObject } from '../utils/mappers.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

// Persists the seller's message, asks the AI provider for the owner's in-character reply, persists it too.
export async function postMessage(sb, { sessionId, message }) {
  const session = await sessionRepository.getSessionById(sb, sessionId);
  if (!session) throw new NotFoundError('Session not found');
  if (session.status !== 'active') throw new ConflictError('Session is not active');

  const priorMessages = await messageRepository.listMessages(sb, sessionId);
  const lastSequence = priorMessages.length ? priorMessages[priorMessages.length - 1].sequence : 0;

  const sellerRow = await messageRepository.addMessage(sb, {
    sessionId,
    role: 'seller',
    content: message,
    sequence: lastSequence + 1
  });

  // Full transcript so far (including the seller message just persisted) drives the prompt.
  const history = [...priorMessages, sellerRow].map((m) => ({ role: m.role, content: m.content }));

  const ownerReply = await generateOwnerReply({
    profile: session.business_profile,
    messages: history,
    difficulty: session.difficulty,
    language: session.language,
    contactMethod: session.contact_method
  });

  const ownerRow = await messageRepository.addMessage(sb, {
    sessionId,
    role: 'owner',
    content: ownerReply,
    sequence: lastSequence + 2
  });

  return toMessageObject(ownerRow);
}
