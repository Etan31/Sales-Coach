import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';

// This file lives at server/src/config/index.js -> repo root is three levels up.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

dotenv.config({ path: path.join(repoRoot, '.env') });

const geminiMock = process.env.GEMINI_MOCK === '1' || process.env.GEMINI_MOCK === 'true';

// Accept the legacy `SUPABASE_SERVICE_KEY` name as a fallback for the canonical
// `SUPABASE_SERVICE_ROLE_KEY` so an existing .env with either name works.
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const required = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey
};

if (!geminiMock) {
  required.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
}

const missing = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.API_PORT) || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  geminiMock,
  aiRateLimit: {
    windowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 60000,
    max: Number(process.env.AI_RATE_LIMIT_MAX) || 20
  }
};

export default config;
