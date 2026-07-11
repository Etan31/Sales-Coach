import config from '../config/index.js';
import logger from '../utils/logger.js';
import { ApiError, BadGatewayError } from '../utils/errors.js';
import { createChatCompletion } from './client.js';
import { buildRoleplaySystemPrompt, buildRoleplayMessages } from '../prompts/roleplay.js';
import { buildEvaluationPrompt } from '../prompts/evaluation.js';

// Cap history sent to the model so token usage stays bounded.
const MAX_HISTORY = 40;

// Maps an upstream AI provider failure to a meaningful API error. A 429 (rate limit / quota
// exhausted) is passed through as 429 with an actionable message instead of a generic 502.
function upstreamError(err, action) {
  logger.error({ err }, `${action} failed`);
  if (err && err.status === 429) {
    return new ApiError(
      429,
      'The AI provider is rate-limited or out of quota. Check your Groq plan/usage, change GROQ_MODEL, or set AI_MOCK=1 to run offline.'
    );
  }
  return new BadGatewayError(`${action} failed`);
}

// Canned owner lines per language + difficulty for mock mode (no network).
const MOCK_OWNER_LINES = {
  english: {
    easy: [
      'Oh, a website? Tell me, what would it actually do for my shop?',
      'Hmm, that could be interesting. How would it help me get more customers?',
      'Okay, I am listening. What makes it worth it for a small place like mine?'
    ],
    medium: [
      'I already have a Facebook page - why would I need a website?',
      'I am not sure I have time for this. What is your point exactly?',
      'Sounds like a lot. How would this really help my business?'
    ],
    hard: [
      'I am pretty busy right now. Make it quick.',
      'A website? I have gotten by without one. Why would I start now?',
      'Honestly that sounds expensive. What is this going to cost me?'
    ],
    impossible: [
      'Look, I really do not have time for this.',
      'We do not need a website. Thanks, but no.',
      'I have heard this pitch before, it never works out. Why bother?'
    ]
  },
  tagalog: {
    easy: [
      'Ay, website? Ano ba maitutulong niyan sa tindahan ko?',
      'Interesante ah. Paano nito madadagdagan ang customers ko?',
      'Sige, nakikinig ako. Bakit sulit yan para sa maliit na negosyo ko?'
    ],
    medium: [
      'May Facebook na kami - bakit pa kailangan ng website?',
      'Di ako sigurado kung may oras ako dito. Ano ba talaga punto mo?',
      'Parang ang dami. Paano ba talaga ito makakatulong sa amin?'
    ],
    hard: [
      'Busy ako ngayon, bilisan mo na lang.',
      'Website? Nakakaraos naman kami kahit wala. Bakit pa ngayon?',
      'Sa totoo lang mukhang mahal yan. Magkano ba yan?'
    ],
    impossible: [
      'Tingnan mo, wala talaga akong oras dito.',
      'Di namin kailangan ng website. Salamat, pero hindi na.',
      'Narinig ko na yan dati, walang nangyayari. Bakit pa?'
    ]
  },
  taglish: {
    easy: [
      'Ay website? Tell me, ano ba benefits niyan sa shop ko?',
      'Hmm, interesting. Paano nito ma-i-increase yung customers ko?',
      'Okay, listening ako. Bakit worth it yan para sa maliit na business ko?'
    ],
    medium: [
      'May Facebook page na kami - bakit pa need ng website?',
      'Not sure kung may time ako dito. Ano ba talaga point mo?',
      'Parang sobra yata. Paano ba talaga this helps my business?'
    ],
    hard: [
      'Busy ako, quick lang ha.',
      'Website? Okay naman kami kahit wala. Bakit ngayon pa?',
      'Honestly mukhang mahal yan. Magkano ba yung cost?'
    ],
    impossible: [
      'Look, wala talaga akong time dito.',
      'Di namin need ng website. Thanks, pero hindi na.',
      'Narinig ko na yan before, it never works. Bakit pa?'
    ]
  }
};

// Localized text used to build a deterministic mock evaluation.
const MOCK_EVAL_TEXT = {
  english: {
    summary:
      'You kept the conversation going and stayed polite, but you started pitching before you understood the business. Ask more about the owner\'s day-to-day problems before proposing a website.',
    strengths: ['You stayed calm and courteous.', 'You clearly explained what a website could include.'],
    weaknesses: ['You pitched features before discovering the real problem.', 'You did not address the price concern head-on.'],
    missed: ['The owner hinted at missed inquiries - you could have tied the website to that.', 'You never asked for a clear next step.'],
    focus: ['Lead with discovery questions.', 'Connect the website to a specific pain point.', 'Practice a soft close.'],
    better: 'Ask what happens now when a customer messages after hours, then show how a website captures that inquiry.'
  },
  tagalog: {
    summary:
      'Napanatili mo ang usapan at magalang ka, pero nag-pitch ka bago mo naintindihan ang negosyo. Magtanong muna tungkol sa araw-araw na problema ng may-ari bago mag-alok ng website.',
    strengths: ['Kalmado at magalang ka.', 'Malinaw mong naipaliwanag kung ano ang kasama sa website.'],
    weaknesses: ['Nag-pitch ka ng features bago mo natuklasan ang tunay na problema.', 'Hindi mo direktang sinagot ang alalahanin sa presyo.'],
    missed: ['May pahiwatig ang may-ari tungkol sa mga hindi nasagot na tanong - pwede mo sanang iugnay ang website doon.', 'Hindi ka humingi ng malinaw na susunod na hakbang.'],
    focus: ['Magsimula sa mga tanong pang-discovery.', 'Iugnay ang website sa isang tiyak na problema.', 'Magsanay ng banayad na pag-close.'],
    better: 'Itanong kung ano ang nangyayari kapag nag-message ang customer after hours, tapos ipakita kung paano ito nakukuha ng website.'
  },
  taglish: {
    summary:
      'Na-keep mo yung conversation at polite ka, pero nag-pitch ka bago mo na-understand yung business. Mag-ask muna about sa day-to-day problems ng owner bago mag-offer ng website.',
    strengths: ['Calm at courteous ka.', 'Clear mong na-explain kung ano yung kasama sa website.'],
    weaknesses: ['Nag-pitch ka ng features bago mo na-discover yung real problem.', 'Hindi mo direktang na-address yung price concern.'],
    missed: ['Nag-hint yung owner about missed inquiries - pwede mo sanang na-tie yung website doon.', 'Hindi ka nag-ask ng clear next step.'],
    focus: ['Lead with discovery questions.', 'I-connect yung website sa specific pain point.', 'Mag-practice ng soft close.'],
    better: 'I-ask kung ano nangyayari when a customer messages after hours, tapos show mo paano ito na-capture ng website.'
  }
};

function pickLanguage(language) {
  return MOCK_OWNER_LINES[language] ? language : 'taglish';
}

// Deterministic, varied canned owner reply for mock mode.
function mockOwnerReply({ language, difficulty, seed }) {
  const langLines = MOCK_OWNER_LINES[pickLanguage(language)];
  const lines = langLines[difficulty] || langLines.medium;
  const index = Math.abs(Number.isFinite(seed) ? seed : 0) % lines.length;
  return lines[index];
}

// Build up to two better-response items from actual owner/seller pairs in the transcript.
function mockBetterResponses(messages, text) {
  const items = [];
  for (let i = 0; i < messages.length && items.length < 2; i += 1) {
    const current = messages[i];
    if (current && current.role === 'owner' && typeof current.content === 'string') {
      const next = messages[i + 1];
      items.push({
        client: current.content,
        yourResponse: next && next.role === 'seller' ? next.content : '',
        betterResponse: text.better
      });
    }
  }
  return items;
}

// Deterministic, well-formed mock evaluation (scaled loosely by how much the seller engaged).
function mockEvaluation({ messages, language }) {
  const list = Array.isArray(messages) ? messages : [];
  const text = MOCK_EVAL_TEXT[pickLanguage(language)];
  const engaged = list.filter((m) => m && m.role === 'seller').length;
  const base = clampInt(3 + Math.floor(engaged / 2), 0, 8);

  const rapport = clampInt(base + 1, 0, 10);
  const businessDiscovery = clampInt(base - 1, 0, 10);
  const confidence = clampInt(base, 0, 10);
  const handlingObjections = clampInt(base - 1, 0, 10);
  const valueSelling = clampInt(base, 0, 10);
  const closing = clampInt(base - 2, 0, 10);
  const overallScore = clampInt(
    ((rapport + businessDiscovery + confidence + handlingObjections + valueSelling + closing) / 6) * 10,
    0,
    100
  );

  return {
    overallScore,
    rapport,
    businessDiscovery,
    confidence,
    handlingObjections,
    valueSelling,
    closing,
    summary: text.summary,
    strengths: text.strengths,
    weaknesses: text.weaknesses,
    missedOpportunities: text.missed,
    betterResponses: mockBetterResponses(list, text),
    nextPracticeFocus: text.focus
  };
}

function clampInt(value, min, max, fallback = min) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => typeof v === 'string' && v.trim() !== '')
    .map((v) => v.trim());
}

function normalizeBetterResponses(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((r) => r && typeof r === 'object')
    .map((r) => ({
      client: typeof r.client === 'string' ? r.client : '',
      yourResponse: typeof r.yourResponse === 'string' ? r.yourResponse : '',
      betterResponse: typeof r.betterResponse === 'string' ? r.betterResponse : ''
    }))
    .filter((r) => r.client || r.betterResponse);
}

// Clamp scores, coerce arrays, and shape the parsed model output to the contract.
function normalizeEvaluation(parsed) {
  const data = parsed && typeof parsed === 'object' ? parsed : {};
  return {
    overallScore: clampInt(data.overallScore, 0, 100),
    rapport: clampInt(data.rapport, 0, 10),
    businessDiscovery: clampInt(data.businessDiscovery, 0, 10),
    confidence: clampInt(data.confidence, 0, 10),
    handlingObjections: clampInt(data.handlingObjections, 0, 10),
    valueSelling: clampInt(data.valueSelling, 0, 10),
    closing: clampInt(data.closing, 0, 10),
    summary: typeof data.summary === 'string' ? data.summary.trim() : '',
    strengths: toStringArray(data.strengths),
    weaknesses: toStringArray(data.weaknesses),
    missedOpportunities: toStringArray(data.missedOpportunities),
    betterResponses: normalizeBetterResponses(data.betterResponses),
    nextPracticeFocus: toStringArray(data.nextPracticeFocus)
  };
}

/**
 * Generate the AI business owner's next in-character reply.
 * @returns {Promise<string>}
 */
export async function generateOwnerReply({ profile, messages = [], difficulty, language, contactMethod }) {
  const history = Array.isArray(messages) ? messages : [];

  if (config.aiMock) {
    return mockOwnerReply({ language, difficulty, seed: history.length });
  }

  const system = buildRoleplaySystemPrompt({ profile, difficulty, language, contactMethod });
  const chatMessages = buildRoleplayMessages(history.slice(-MAX_HISTORY));

  try {
    const text = (await createChatCompletion({ system, messages: chatMessages })).trim();
    if (!text) {
      throw new Error('empty model response');
    }
    return text;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw upstreamError(err, 'AI owner reply');
  }
}

/**
 * Evaluate a finished conversation into a structured scorecard.
 * @returns {Promise<object>} EvaluationObject minus id/sessionId/createdAt.
 */
export async function evaluateConversation({ profile, messages = [], language }) {
  const history = Array.isArray(messages) ? messages : [];

  if (config.aiMock) {
    return mockEvaluation({ messages: history, language });
  }

  const system = buildEvaluationPrompt({ profile, messages: history, language });

  let raw;
  try {
    raw = await createChatCompletion({
      system,
      messages: [{ role: 'user', content: 'Evaluate the conversation above and return only the JSON scorecard.' }],
      json: true
    });
  } catch (err) {
    throw upstreamError(err, 'AI evaluation request');
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    logger.error({ err }, 'evaluateConversation returned malformed JSON');
    throw new BadGatewayError('AI evaluation returned malformed data');
  }

  return normalizeEvaluation(parsed);
}
