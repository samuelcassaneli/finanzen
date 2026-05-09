import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { belvo, normalizeBelvoTx } from "@/lib/belvo";

type TxInsert = Database["public"]["Tables"]["transactions"]["Insert"];
type LinkUpdate = Database["public"]["Tables"]["financial_links"]["Update"];

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
      const rows: TxInsert[] = txs.map((t) => normalizeBelvoTx(userId, linkRowId, t));
      const { error } = await supabase
        .from("transactions")
        .upsert(rows, { onConflict: "belvo_transaction_id", ignoreDuplicates: false });
      if (error) throw error;
    }

    const ok: LinkUpdate = {
      last_sync_at: new Date().toISOString(),
      last_error: null,
      status: "valid",
    };
    await supabase.from("financial_links").update(ok).eq("id", linkRowId);

    return { count: txs.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const fail: LinkUpdate = { last_error: msg.slice(0, 500), status: "error" };
    await supabase.from("financial_links").update(fail).eq("id", linkRowId);
    throw e;
  }
}
