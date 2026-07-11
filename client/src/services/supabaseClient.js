import { createClient } from '@supabase/supabase-js';

// Single Supabase client instance for the whole app (anon key only, RLS enforced server-side too).
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default supabase;
