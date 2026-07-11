import * as sessionRepository from '../repositories/sessionRepository.js';
import * as messageRepository from '../repositories/messageRepository.js';
import * as evaluationRepository from '../repositories/evaluationRepository.js';
import { evaluateConversation } from '../gemini/geminiService.js';
import { toEvaluationObject } from '../utils/mappers.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

// Scores the finished conversation with Gemini, persists the evaluation, and marks the session completed.
export async function endSession(sb, sessionId) {
  const session = await sessionRepository.getSessionById(sb, sessionId);
  if (!session) throw new NotFoundError('Session not found');
  if (session.status !== 'active') throw new ConflictError('Session already ended');

  const messages = await messageRepository.listMessages(sb, sessionId);
  const sellerMessageCount = messages.filter((m) => m.role === 'seller').length;
  if (sellerMessageCount < 1) throw new ConflictError('No conversation to evaluate');

  const evaluation = await evaluateConversation({
    profile: session.business_profile,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    language: session.language
  });

  const evaluationRow = await evaluationRepository.createEvaluation(sb, {
    sessionId,
    ...evaluation
  });

  await sessionRepository.updateSessionStatus(sb, sessionId, {
    status: 'completed',
    endedAt: new Date().toISOString()
  });

  return toEvaluationObject(evaluationRow);
}
