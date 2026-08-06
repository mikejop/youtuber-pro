import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization
 * Security Note: Only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are exposed to the browser.
 * Service role keys MUST stay restricted to server-side environments.
 */

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase Warning]: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
