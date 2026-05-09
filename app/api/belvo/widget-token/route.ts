import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { belvo } from "@/lib/belvo";

export const runtime = "nodejs";

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { access } = await belvo.createWidgetAccessToken({ externalId: user.id });
    return NextResponse.json({ access });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
