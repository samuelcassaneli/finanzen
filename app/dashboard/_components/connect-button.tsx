"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    belvoSDK?: {
      createWidget: (
        accessToken: string,
        opts: {
          callback: (link: string, institution: string) => void;
          onExit?: () => void;
          onEvent?: (e: unknown) => void;
        },
      ) => { build: () => void };
    };
  }
}

const WIDGET_SRC = "https://cdn.belvo.io/belvo-widget-1-stable.js";

function loadWidget(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.belvoSDK) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("widget load failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = WIDGET_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Falha ao carregar widget Belvo"));
    document.body.appendChild(s);
  });
}

export function ConnectButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setErr(null);
    try {
      const tokenRes = await fetch("/api/belvo/widget-token", { method: "POST" });
      if (!tokenRes.ok) throw new Error("Não foi possível obter o token Belvo.");
      const { access } = (await tokenRes.json()) as { access: string };

      await loadWidget();
      if (!window.belvoSDK) throw new Error("SDK Belvo indisponível.");

      window.belvoSDK
        .createWidget(access, {
          callback: async (linkId, institution) => {
            try {
              const res = await fetch("/api/belvo/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ belvo_link_id: linkId, institution }),
              });
              if (!res.ok) throw new Error("Erro ao sincronizar.");
              router.refresh();
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Erro no sync");
            } finally {
              setBusy(false);
            }
          },
          onExit: () => setBusy(false),
        })
        .build();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao abrir widget");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={start}
        disabled={busy}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition disabled:opacity-50"
      >
        {busy ? (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
        {busy ? "Conectando..." : "Conectar banco"}
      </button>
      {err && <span className="text-xs text-red-500">{err}</span>}
    </div>
  );
}
