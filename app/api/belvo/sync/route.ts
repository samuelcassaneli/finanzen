import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { belvo } from "@/lib/belvo";
import { syncLink } from "@/lib/sync";
import type { Database } from "@/lib/supabase/types";

export const runtime = "nodejs";

type LinkInsert = Database["public"]["Tables"]["financial_links"]["Insert"];
type LinkRow = Database["public"]["Tables"]["financial_links"]["Row"];

const Body = z.object({
  belvo_link_id: z.string().min(1),
  institution: z.string().optional(),
});

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  const { belvo_link_id, institution } = parsed.data;

  // Ensure we have a financial_links row for this user + belvo link.
  const { data: existing } = await supabase
    .from("financial_links")
    .select("id, last_sync_at")
    .eq("belvo_link_id", belvo_link_id)
    .maybeSingle();

  let link: Pick<LinkRow, "id" | "last_sync_at"> | null = existing;

  if (!link) {
    let inst = institution ?? "unknown";
    try {
      const remote = await belvo.getLink(belvo_link_id);
      inst = remote.institution ?? inst;
    } catch {
      // fall through with provided / unknown institution
    }

    const payload: LinkInsert = {
      user_id: user.id,
      belvo_link_id,
      institution: inst,
      institution_display_name: inst,
    };

    const { data: created, error } = await supabase
      .from("financial_links")
      .insert(payload)
      .select("id, last_sync_at")
      .single();

    if (error || !created) {
      return NextResponse.json({ error: error?.message ?? "insert failed" }, { status: 500 });
    }
    link = created;
  }

  try {
    const result = await syncLink(supabase, {
      userId: user.id,
      linkRowId: link.id,
      belvoLinkId: belvo_link_id,
      since: link.last_sync_at?.slice(0, 10) ?? null,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
