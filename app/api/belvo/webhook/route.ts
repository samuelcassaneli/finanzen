import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { syncLink } from "@/lib/sync";

export const runtime = "nodejs";

function verifySignature(rawBody: string, header: string | null) {
  const secret = process.env.BELVO_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[belvo webhook] BELVO_WEBHOOK_SECRET not set — skipping signature verification");
    return true;
  }
  if (!header) return false;
  // Belvo sends `t=...,v1=...` style. Be permissive: verify any v1=hex matches.
  const parts = Object.fromEntries(
    header.split(",").map((p) => p.split("=").map((s) => s.trim()) as [string, string]),
  );
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${t}.${rawBody}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"));
  } catch {
    return false;
  }
}

interface BelvoWebhook {
  webhook_id?: string;
  webhook_type?: string;
  webhook_code?: string;
  link_id?: string;
  external_id?: string;
  data?: Record<string, unknown>;
}

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("belvo-signature") ?? req.headers.get("x-belvo-signature");
  if (!verifySignature(raw, sig)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: BelvoWebhook;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (payload.webhook_type !== "TRANSACTIONS" || !payload.link_id) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const supabase = createServiceRoleClient();
  const { data: link } = await supabase
    .from("financial_links")
    .select("id, user_id, last_sync_at")
    .eq("belvo_link_id", payload.link_id)
    .maybeSingle();

  if (!link) return NextResponse.json({ ok: true, unknown_link: true });

  try {
    await syncLink(supabase, {
      userId: link.user_id,
      linkRowId: link.id,
      belvoLinkId: payload.link_id,
      since: link.last_sync_at?.slice(0, 10) ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
