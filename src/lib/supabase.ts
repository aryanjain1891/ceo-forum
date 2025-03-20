import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Please click "Connect to Supabase" button to configure your Supabase project');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);