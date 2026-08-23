"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StorageLimitToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    const next = !enabled;
    if (!next) {
      const ok = window.confirm(
        "Disattivando il tetto, i caricamenti potranno superare i 10GB gratuiti di Cloudflare R2 e far scattare costi a consumo. Continuare?"
      );
      if (!ok) return;
    }
    setEnabled(next);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storageLimitEnabled: next }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        setEnabled(!next);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={enabled}
      className={`relative inline-flex h-7 w-13 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        enabled ? "bg-primary" : "bg-foreground/20"
      }`}
      style={{ width: "3.25rem" }}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-soft-sm transition-transform ${
          enabled ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}
