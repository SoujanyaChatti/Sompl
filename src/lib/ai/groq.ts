import Groq from "groq-sdk";
import { hasGroq, env } from "../env";

// Groq client (OpenAI-compatible, free tier, very fast).
// Model: Llama 3.3 70B is a strong default on Groq.
export const GROQ_MODEL = "llama-3.3-70b-versatile";

let client: Groq | null = null;
export function groq(): Groq | null {
  if (!hasGroq()) return null;
  if (!client) client = new Groq({ apiKey: env.groqKey });
  return client;
}

export const groqEnabled = hasGroq;
