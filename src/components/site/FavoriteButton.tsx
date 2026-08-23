"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

export default function FavoriteButton({
  targetType,
  targetId,
  initialFavorited,
  loggedIn,
}: {
  targetType: "RETREAT" | "COURSE";
  targetId: string;
  initialFavorited: boolean;
  loggedIn: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!loggedIn) {
    return (
      <a
        href="/login"
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground/70 hover:border-primary hover:text-primary"
      >
        <Heart className="h-4 w-4" aria-hidden="true" />
        Accedi per salvare nei preferiti
      </a>
    );
  }

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId }),
      });
      const data = await res.json();
      if (res.ok) {
        setFavorited(data.favorited);
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
      aria-pressed={favorited}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
        favorited ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:border-primary"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <Heart className="h-4 w-4" fill={favorited ? "currentColor" : "none"} aria-hidden="true" />
      {favorited ? "Nei tuoi preferiti" : "Aggiungi ai preferiti"}
    </button>
  );
}
