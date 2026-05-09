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
    s.onerror = () => reject(new Error("widget load failed"));
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
      if (!tokenRes.ok) throw new Error("Falha ao obter token Belvo");
      const { access } = (await tokenRes.json()) as { access: string };

      await loadWidget();
      if (!window.belvoSDK) throw new Error("Belvo SDK indisponível");

      window.belvoSDK
        .createWidget(access, {
          callback: async (linkId, institution) => {
            try {
              await fetch("/api/belvo/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ belvo_link_id: linkId, institution }),
              });
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
      setErr(e instanceof Error ? e.message : "Erro");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={start}
        disabled={busy}
        className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {busy ? "..." : "Conectar banco"}
      </button>
      {err && <span className="mt-1 text-xs text-red-600">{err}</span>}
    </div>
  );
}
