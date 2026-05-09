import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/utils";
import { ConnectButton } from "./_components/connect-button";
import { SyncButton } from "./_components/sync-button";
import { SignOutButton } from "./_components/signout-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [{ data: links }, { data: txs }] = await Promise.all([
    supabase
      .from("financial_links")
      .select("id, institution, institution_display_name, status, last_sync_at, last_error, belvo_link_id")
      .order("created_at", { ascending: true }),
    supabase
      .from("transactions")
      .select("id, description, merchant, amount, currency, type, occurred_at, account_name, status")
      .order("occurred_at", { ascending: false })
      .limit(100),
  ]);

  const monthTxs = (txs ?? []).filter(
    (t) => t.occurred_at >= startOfMonth && t.occurred_at <= endOfMonth,
  );
  const inflow = monthTxs
    .filter((t) => t.type === "inflow")
    .reduce((s, t) => s + Number(t.amount), 0);
  const outflow = monthTxs
    .filter((t) => t.type === "outflow")
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const balance = inflow - outflow;
  const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <span className="text-lg font-bold tracking-tight">Finzen</span>
            <span className="ml-2 text-xs text-muted-foreground">{user!.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <ConnectButton />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {monthLabel}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard label="Entradas" value={formatBRL(inflow)} color="text-emerald-600" />
            <SummaryCard label="Saidas" value={formatBRL(outflow)} color="text-red-500" />
            <SummaryCard
              label="Saldo"
              value={formatBRL(balance)}
              color={balance >= 0 ? "text-emerald-600" : "text-red-500"}
              highlight
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">Contas conectadas</h2>
          {!links || links.length === 0 ? (
            <EmptyState
              title="Nenhuma conta conectada"
              description="Clique em Conectar banco para importar suas transacoes."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {links.map((l) => (
                <div
                  key={l.id}
                  className="flex items-start justify-between rounded-xl border border-border bg-background p-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusDot status={l.status} />
                      <span className="truncate text-sm font-medium">
                        {l.institution_display_name ?? l.institution}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {l.last_sync_at
                        ? "Sync " +
                          new Date(l.last_sync_at).toLocaleString("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "Nunca sincronizado"}
                    </div>
                    {l.last_error && (
                      <div className="mt-1 truncate text-xs text-red-500">{l.last_error}</div>
                    )}
                  </div>
                  <SyncButton linkId={l.belvo_link_id} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">
            Transacoes recentes
            {txs && txs.length > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {txs.length} registros
              </span>
            )}
          </h2>
          {!txs || txs.length === 0 ? (
            <EmptyState
              title="Sem transacoes"
              description="Apos conectar uma conta, clique no icone de sync para importar."
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Descricao
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell">
                      Conta
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {txs.map((t) => (
                    <tr key={t.id} className="transition-colors hover:bg-muted/30">
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {new Date(t.occurred_at + "T12:00:00").toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3">
                        {t.merchant ?? t.description ?? "-"}
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                        {t.account_name ?? "-"}
                      </td>
                      <td
                        className={
                          "whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums " +
                          (t.type === "inflow" ? "text-emerald-600" : "text-red-500")
                        }
                      >
                        {t.type === "inflow" ? "+" : "-"}
                        {formatBRL(Math.abs(Number(t.amount)))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl border p-4 " +
        (highlight ? "border-primary/20 bg-primary/5" : "border-border bg-background")
      }
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={"mt-1 text-xl font-bold tabular-nums " + color}>{value}</div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "valid"
      ? "bg-emerald-500"
      : status === "error"
        ? "bg-red-500"
        : "bg-yellow-500";
  return <span className={"mt-0.5 h-2 w-2 shrink-0 rounded-full " + color} />;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background px-6 py-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
