import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL || "https://txmaffxbrmxlzakxathe.supabase.co";

const supabaseKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_GgBqVbEZW4yJdLdZWHDmig_nnRQqeKg";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!
  );
