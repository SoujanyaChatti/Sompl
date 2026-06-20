// Centralized env access with graceful, demo-safe fallbacks.
// The app must run with ZERO configuration for a flawless hackathon demo,
// and light up real Supabase + Groq when keys are present.

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  groqKey: process.env.GROQ_API_KEY || "",
  novusKey: process.env.NEXT_PUBLIC_NOVUS_KEY || "",
};

export const hasSupabase = () =>
  Boolean(env.supabaseUrl && env.supabaseAnonKey);

export const hasGroq = () => Boolean(env.groqKey);
