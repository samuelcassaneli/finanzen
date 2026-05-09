"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncButton({ linkId }: { linkId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  async function sync() {
    setBusy(true);
    setOk(false);
    try {
      const res = await fetch("/api/belvo/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ belvo_link_id: linkId }),
      });
      if (res.ok) {
        setOk(true);
        router.refresh();
        setTimeout(() => setOk(false), 3000);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={sync}
      disabled={busy}
      title="Sincronizar transações"
      className="ml-3 shrink-0 rounded-lg border border-border p-1.5 text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-40"
    >
      {busy ? (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : ok ? (
        <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )}
    </button>
  );
}
