import Groq from 'groq-sdk';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// Lazily-constructed singleton so we never build a client (or require a key) in mock mode.
let client = null;

/**
 * Return the shared Groq client, or null when running in mock mode.
 * Never constructs a real client or reads the API key while config.aiMock is true.
 */
export function createGroqClient() {
  if (config.aiMock) {
    return null;
  }
  if (!client) {
    client = new Groq({ apiKey: config.groqApiKey });
    logger.debug('Groq client initialized');
  }
  return client;
}

/**
 * Call the chat completions endpoint with a system prompt + message history.
 * @param {object} opts
 * @param {string} [opts.system] - system instruction text, sent as the leading system message.
 * @param {Array<{role:string, content:string}>} [opts.messages] - user/assistant turns.
 * @param {boolean} [opts.json] - request JSON-object output mode (no fixed schema enforcement).
 * @returns {Promise<string>} the model's raw text response.
 */
export async function createChatCompletion({ system, messages = [], json = false } = {}) {
  const groq = createGroqClient();
  if (!groq) {
    // Mock mode must use the canned code path in aiService; reaching here is a bug.
    throw new Error('createChatCompletion called while AI_MOCK is enabled');
  }

  const chatMessages = [...(system ? [{ role: 'system', content: system }] : []), ...messages];

  const completion = await groq.chat.completions.create({
    model: config.groqModel,
    messages: chatMessages,
    ...(json ? { response_format: { type: 'json_object' } } : {})
  });

  return completion.choices?.[0]?.message?.content ?? '';
}
