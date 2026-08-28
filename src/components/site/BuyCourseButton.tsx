"use client";

import { useState } from "react";

export default function BuyCourseButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/checkout`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Impossibile avviare il pagamento.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Impossibile avviare il pagamento.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={buy}
        disabled={loading}
        className="mt-1 cursor-pointer rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground shadow-soft-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Un attimo..." : "Acquista ora"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
