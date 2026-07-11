import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// Lazily-constructed singleton so we never build a client (or require a key) in mock mode.
let client = null;

/**
 * Return the shared GoogleGenerativeAI client, or null when running in mock mode.
 * Never constructs a real client or reads the API key while config.geminiMock is true.
 */
export function createGeminiClient() {
  if (config.geminiMock) {
    return null;
  }
  if (!client) {
    client = new GoogleGenerativeAI(config.geminiApiKey);
    logger.debug('Gemini client initialized');
  }
  return client;
}

/**
 * Build a configured generative model.
 * @param {object} opts
 * @param {string} [opts.system] - system instruction text.
 * @param {boolean} [opts.json] - request structured JSON output.
 * @param {object} [opts.responseSchema] - Gemini responseSchema to enforce when json is true.
 */
export function getModel({ system, json = false, responseSchema } = {}) {
  const gemini = createGeminiClient();
  if (!gemini) {
    // Mock mode must use the canned code path in geminiService; reaching here is a bug.
    throw new Error('getModel called while GEMINI_MOCK is enabled');
  }

  const generationConfig = json
    ? { responseMimeType: 'application/json', ...(responseSchema ? { responseSchema } : {}) }
    : undefined;

  return gemini.getGenerativeModel({
    model: config.geminiModel,
    ...(system ? { systemInstruction: system } : {}),
    ...(generationConfig ? { generationConfig } : {})
  });
}
