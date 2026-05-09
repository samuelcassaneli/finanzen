"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErr("E-mail ou senha incorretos.");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Finzen</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sua vida financeira organizada.</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="password"
          required
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
