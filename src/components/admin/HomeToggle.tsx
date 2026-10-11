"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Loader2 } from "lucide-react";

// Interruttore "Mostra in home" di un corso, direttamente dall'elenco.
export default function HomeToggle({ courseId, initial, published }: { courseId: string; initial: boolean; published: boolean }) {
  const [on, setOn] = useState(initial);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    const next = !on;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/home`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showOnHome: next }),
      });
      if (res.ok) {
        setOn(next);
        router.refresh();
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
      aria-pressed={on}
      title={
        on
          ? published
            ? "In rotazione nella home: clicca per toglierlo"
            : "Scelto per la home, ma comparirà solo quando il corso è pubblicato"
          : "Clicca per mostrarlo a rotazione nella home"
      }
      className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        on ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground/60 hover:border-primary hover:text-primary"
      }`}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Home className="h-3.5 w-3.5" aria-hidden="true" />}
      {on ? "In home" : "Non in home"}
    </button>
  );
}
