import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { belvo, normalizeBelvoTx } from "@/lib/belvo";

export interface SyncArgs {
  userId: string;
  linkRowId: string;
  belvoLinkId: string;
  since?: string | null;
}

export async function syncLink(
  supabase: SupabaseClient<Database>,
  { userId, linkRowId, belvoLinkId, since }: SyncArgs,
) {
  try {
    const txs = await belvo.listTransactions(belvoLinkId, since ?? undefined);
    if (txs.length > 0) {
      const rows = txs.map((t) => normalizeBelvoTx(userId, linkRowId, t));
      const { error } = await supabase
        .from("transactions")
        .upsert(rows, { onConflict: "belvo_transaction_id", ignoreDuplicates: false });
      if (error) throw error;
    }
    await supabase
      .from("financial_links")
      .update({ last_sync_at: new Date().toISOString(), last_error: null, status: "valid" })
      .eq("id", linkRowId);
    return { count: txs.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase
      .from("financial_links")
      .update({ last_error: msg.slice(0, 500), status: "error" })
      .eq("id", linkRowId);
    throw e;
  }
}
