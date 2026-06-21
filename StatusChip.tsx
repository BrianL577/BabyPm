import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; company?: string; message?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body.email || !body.email.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Lead capture isn't connected yet. Add Supabase credentials in Vercel's Environment Variables." },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("babypm_leads").insert({
    name: body.name || null,
    email: body.email,
    company: body.company || null,
    message: body.message || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
