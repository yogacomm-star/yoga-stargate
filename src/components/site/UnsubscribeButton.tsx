"use client";

import { useState } from "react";

export default function UnsubscribeButton({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleClick() {
    setStatus("loading");
    try {
      const res = await fetch(`/api/unsubscribe?t=${encodeURIComponent(token)}`, { method: "POST" });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground/80">
        Fatto: non riceverai più le nostre email promozionali. Se cambi idea, puoi riattivarle dal tuo account.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        className="cursor-pointer rounded-full bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-soft-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Un attimo..." : "Non voglio più ricevere queste email"}
      </button>
      {status === "error" && <p className="mt-3 text-sm font-medium text-destructive">Qualcosa è andato storto, riprova.</p>}
    </div>
  );
}
