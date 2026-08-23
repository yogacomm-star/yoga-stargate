"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LevelSelect({ accountId, initialLevel }: { accountId: string; initialLevel: number }) {
  const [level, setLevel] = useState(initialLevel);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(newLevel: number) {
    setLevel(newLevel);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: newLevel }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      aria-label="Livello del membro"
      value={level}
      disabled={loading}
      onChange={(e) => handleChange(Number(e.target.value))}
      className="cursor-pointer rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary disabled:opacity-60"
    >
      <option value={1}>Base</option>
      <option value={2}>Intermedio</option>
      <option value={3}>Avanzato</option>
    </select>
  );
}
