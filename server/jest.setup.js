// Injects dummy env vars BEFORE any server module (e.g. config/index.js) loads, so config
// validation does not throw and Gemini stays in mock mode for the whole test run.
// dotenv.config() (called inside config/index.js) never overrides already-set env vars,
// so these values win regardless of what the real root .env contains.
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';
process.env.GEMINI_MOCK = '1';
