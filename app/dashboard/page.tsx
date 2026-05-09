import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/utils";
import { ConnectButton } from "./_components/connect-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startISO = startOfMonth.toISOString().slice(0, 10);

  const [{ data: links }, { data: txs }, { data: monthTxs }] = await Promise.all([
    supabase
      .from("financial_links")
      .select("id, institution, institution_display_name, status, last_sync_at, last_error")
      .order("created_at", { ascending: false }),
    supabase
      .from("transactions")
      .select("id, description, merchant, amount, currency, type, occurred_at, account_name")
      .order("occurred_at", { ascending: false })
      .limit(50),
    supabase
      .from("transactions")
      .select("amount, type")
      .gte("occurred_at", startISO),
  ]);

  const inflow = (monthTxs ?? [])
    .filter((t) => t.type === "inflow")
    .reduce((s, t) => s + Number(t.amount), 0);
  const outflow = (monthTxs ?? [])
    .filter((t) => t.type === "outflow")
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <ConnectButton />
          <form action="/auth/signout" method="post">
            <button className="rounded-md border border-border px-3 py-2 text-sm">Sair</button>
          </form>
        </div>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card label="Entradas (mês)" value={formatBRL(inflow)} tone="positive" />
        <Card label="Saídas (mês)" value={formatBRL(outflow)} tone="negative" />
        <Card label="Saldo (mês)" value={formatBRL(inflow - outflow)} />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-medium">Vínculos bancários</h2>
        {!links || links.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum banco conectado. Clique em &ldquo;Conectar banco&rdquo; para começar.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {links.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <div className="font-medium">{l.institution_display_name ?? l.institution}</div>
                  <div className="text-xs text-muted-foreground">
                    Status: {l.status}
                    {l.last_sync_at ? ` · sync ${new Date(l.last_sync_at).toLocaleString("pt-BR")}` : " · nunca sincronizado"}
                  </div>
                  {l.last_error && <div className="text-xs text-red-600">{l.last_error}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Últimas transações</h2>
        {!txs || txs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem transações ainda.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Data</th>
                  <th className="px-3 py-2">Descrição</th>
                  <th className="px-3 py-2">Conta</th>
                  <th className="px-3 py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((t) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className="px-3 py-2 whitespace-nowrap">{t.occurred_at}</td>
                    <td className="px-3 py-2">{t.merchant ?? t.description ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{t.account_name ?? "—"}</td>
                    <td
                      className={`px-3 py-2 text-right font-medium ${
                        t.type === "inflow" ? "text-emerald-600" : "text-red-600"
                      }`}
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
  );
}

function Card({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  const color =
    tone === "positive" ? "text-emerald-600" : tone === "negative" ? "text-red-600" : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
