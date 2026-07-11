import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';

// This file lives at server/src/config/index.js -> repo root is three levels up.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

dotenv.config({ path: path.join(repoRoot, '.env') });

const aiMock = process.env.AI_MOCK === '1' || process.env.AI_MOCK === 'true';

// Accept the legacy `SUPABASE_SERVICE_KEY` name as a fallback for the canonical
// `SUPABASE_SERVICE_ROLE_KEY` so an existing .env with either name works.
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const required = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey
};

if (!aiMock) {
  required.GROQ_API_KEY = process.env.GROQ_API_KEY;
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
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  aiMock,
  aiRateLimit: {
    windowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 60000,
    max: Number(process.env.AI_RATE_LIMIT_MAX) || 20
  }
};

export default config;
