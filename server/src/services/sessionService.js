import { generateBusinessProfile } from './profileGenerator.js';
import * as sessionRepository from '../repositories/sessionRepository.js';
import * as messageRepository from '../repositories/messageRepository.js';
import * as evaluationRepository from '../repositories/evaluationRepository.js';
import { toSessionObject, toMessageObject, toEvaluationObject, toHistoryItem } from '../utils/mappers.js';
import { NotFoundError } from '../utils/errors.js';

// Generates a fresh business_profile snapshot, persists the session, and returns the public shape.
export async function createSession(sb, userId, { businessType, difficulty, contactMethod, language }) {
  const businessProfile = generateBusinessProfile(businessType, difficulty);

  const row = await sessionRepository.createSession(sb, {
    userId,
    businessType,
    difficulty,
    contactMethod,
    language,
    businessProfile
  });

  return toSessionObject(row);
}

// Fetches the session, its full message transcript, and its evaluation (if the session ended).
export async function getSessionDetail(sb, id) {
  const session = await sessionRepository.getSessionById(sb, id);
  if (!session) throw new NotFoundError('Session not found');

  const [messages, evaluation] = await Promise.all([
    messageRepository.listMessages(sb, id),
    evaluationRepository.getBySessionId(sb, id)
  ]);

  return {
    session: toSessionObject(session),
    messages: messages.map(toMessageObject),
    evaluation: evaluation ? toEvaluationObject(evaluation) : null
  };
}

export async function listHistory(sb, { page, pageSize }) {
  const { rows, total } = await sessionRepository.listSessions(sb, { page, pageSize });
  return {
    sessions: rows.map(toHistoryItem),
    page,
    pageSize,
    total
  };
}
