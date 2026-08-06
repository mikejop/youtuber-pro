import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization
 * Security Note: Only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY/PUBLISHABLE_KEY are loaded in browser environment.
 * SUPABASE_SECRET_KEY MUST NEVER be referenced in client-side TypeScript.
 */

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://txmaffxbrmxlzakxathe.supabase.co';

const supabaseKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_GgBqVbEZW4yJdLdZWHDmig_nnRQqeKg';

export const supabase = createClient(supabaseUrl, supabaseKey);
