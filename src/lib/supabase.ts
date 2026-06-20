import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env, hasSupabase } from "./env";

// Browser Supabase client. Returns null when not configured so the app can
// gracefully fall back to localStorage and never break the demo.
let _client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!hasSupabase()) return null;
  if (!_client) {
    _client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }
  return _client;
}

export const supabaseEnabled = hasSupabase;
