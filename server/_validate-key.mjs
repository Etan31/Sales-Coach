// Run this locally to find which Gemini models your key actually has quota for.
// The key stays in your .env and never leaves your machine.
import config from './src/config/index.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('Testing your GEMINI_API_KEY against available models...\n');

const models = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-2.0-pro-exp-02-05'
];

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

for (const modelName of models) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Reply with: works' }] }]
    });
    const reply = response.response.text();
    console.log(`✅ ${modelName.padEnd(30)} WORKS → "${reply.trim()}"`);
  } catch (err) {
    const status = err.status || '?';
    const msg = err.message.split('\n')[0].slice(0, 80);
    console.log(`❌ ${modelName.padEnd(30)} [${status}] ${msg}`);
  }
}

console.log('\nPick the first ✅ model from above and set it as GEMINI_MODEL in your .env');
