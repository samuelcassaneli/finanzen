// Server-only Belvo client. Do NOT import from client components.
import "server-only";

type BelvoEnv = "sandbox" | "development" | "production";

const ENV_HOSTS: Record<BelvoEnv, string> = {
  sandbox: "https://sandbox.belvo.com",
  development: "https://development.belvo.com",
  production: "https://api.belvo.com",
};

function env(): BelvoEnv {
  const v = (process.env.BELVO_ENV ?? "sandbox") as BelvoEnv;
  return v in ENV_HOSTS ? v : "sandbox";
}

function authHeader() {
  const id = process.env.BELVO_SECRET_ID;
  const pw = process.env.BELVO_SECRET_PASSWORD;
  if (!id || !pw) throw new Error("Belvo credentials missing");
  return "Basic " + Buffer.from(`${id}:${pw}`).toString("base64");
}

async function belvoFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(ENV_HOSTS[env()] + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Belvo ${res.status} ${path}: ${body.slice(0, 500)}`);
  }
  return res.json() as Promise<T>;
}

export interface BelvoLink {
  id: string;
  institution: string;
  status: string;
  access_mode?: string;
}

export interface BelvoTransaction {
  id: string;
  account: { id: string; name?: string };
  amount: number;
  currency: string;
  description?: string | null;
  merchant?: { name?: string | null } | null;
  type: "INFLOW" | "OUTFLOW";
  status: string;
  value_date: string;
  accounting_date?: string | null;
  category?: string | null;
}

interface Paged<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const belvo = {
  /** Short-lived access token used by the Belvo Connect Widget on the client. */
  async createWidgetAccessToken(opts?: { externalId?: string }) {
    return belvoFetch<{ access: string; refresh: string }>("/api/token/", {
      method: "POST",
      body: JSON.stringify({
        id: process.env.BELVO_SECRET_ID,
        password: process.env.BELVO_SECRET_PASSWORD,
        scopes: "read_institutions,write_links,read_links,delete_links",
        widget: {
          callback_urls: { success: process.env.NEXT_PUBLIC_SITE_URL, exit: process.env.NEXT_PUBLIC_SITE_URL },
          external_id: opts?.externalId,
        },
      }),
    });
  },

  async getLink(linkId: string) {
    return belvoFetch<BelvoLink>(`/api/links/${linkId}/`);
  },

  async listTransactions(linkId: string, since?: string) {
    const all: BelvoTransaction[] = [];
    let url: string | null =
      `/api/transactions/?link=${encodeURIComponent(linkId)}&page_size=100` +
      (since ? `&date_from=${encodeURIComponent(since)}` : "");
    while (url) {
      const page: Paged<BelvoTransaction> = await belvoFetch(url);
      all.push(...page.results);
      url = page.next ? page.next.replace(ENV_HOSTS[env()], "") : null;
    }
    return all;
  },

  async deleteLink(linkId: string) {
    await belvoFetch(`/api/links/${linkId}/`, { method: "DELETE" });
  },
};

export function normalizeBelvoTx(
  userId: string,
  linkRowId: string,
  tx: BelvoTransaction,
) {
  return {
    user_id: userId,
    link_id: linkRowId,
    belvo_transaction_id: tx.id,
    account_id: tx.account?.id ?? null,
    account_name: tx.account?.name ?? null,
    description: tx.description ?? null,
    merchant: tx.merchant?.name ?? null,
    amount: tx.amount,
    currency: tx.currency,
    type: tx.type === "INFLOW" ? ("inflow" as const) : ("outflow" as const),
    status: tx.status,
    occurred_at: tx.value_date,
    posted_at: tx.accounting_date ?? null,
    raw: tx as unknown as import("@/lib/supabase/types").Json,
  };
}
