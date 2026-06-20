import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/remote";
import { hasSupabase } from "@/lib/env";

export const runtime = "nodejs";

// Seeds the museum into Supabase (idempotent). Safe to call repeatedly.
// Used by the app on first load and available for manual triggering.
export async function POST() {
  if (!hasSupabase()) {
    return NextResponse.json({ ok: false, reason: "supabase-not-configured" });
  }
  try {
    const seeded = await ensureSeeded();
    return NextResponse.json({ ok: true, seeded });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
