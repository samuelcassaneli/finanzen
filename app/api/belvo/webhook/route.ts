import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { syncLink } from "@/lib/sync";

export const runtime = "nodejs";

// Belvo sends: t=<timestamp>,v1=<hex_hmac_sha256(t.body, secret)>
function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.BELVO_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[belvo/webhook] BELVO_WEBHOOK_SECRET not set — skipping verification (dev only)");
    return true;
  }
  if (!header) return false;
  const parts: Record<string, string> = {};
  header.split(",").forEach((p) => {
    const [k, v] = p.trim().split("=");
    if (k && v) parts[k] = v;
  });
  const { t, v1 } = parts;
  if (!t || !v1) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"));
  } catch {
    return false;
  }
}

// Belvo webhook_type values that require a transaction sync
const SYNC_TYPES = new Set([
  "TRANSACTIONS",
  "INCOME_STREAMS",
  "RECURRING_EXPENSES",
]);

// Belvo webhook_code values that signal new/updated data
const SYNC_CODES = new Set([
  "historical_update",
  "new_accounts_data",
  "transactions_created",
  "transactions_updated",
]);

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
    console.error("[belvo/webhook] Invalid signature");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: BelvoWebhook;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { webhook_type, webhook_code, link_id } = payload;
  console.log(`[belvo/webhook] type=${webhook_type} code=${webhook_code} link=${link_id}`);

  // Only act on events that produce transactions
  const shouldSync =
    link_id &&
    (SYNC_TYPES.has(webhook_type ?? "") || SYNC_CODES.has(webhook_code ?? ""));

  if (!shouldSync) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const supabase = createServiceRoleClient();
  const { data: link } = await supabase
    .from("financial_links")
    .select("id, user_id, last_sync_at")
    .eq("belvo_link_id", link_id)
    .maybeSingle();

  if (!link) {
    console.warn(`[belvo/webhook] Unknown link_id: ${link_id}`);
    return NextResponse.json({ ok: true, unknown_link: true });
  }

  try {
    const result = await syncLink(supabase, {
      userId: link.user_id,
      linkRowId: link.id,
      belvoLinkId: link_id,
      since: link.last_sync_at?.slice(0, 10) ?? null,
    });
    console.log(`[belvo/webhook] Synced ${result.count} transactions for link ${link_id}`);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[belvo/webhook] Sync failed: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
