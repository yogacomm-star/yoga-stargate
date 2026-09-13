"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";

export default function GalleryReorderButtons({
  id,
  isFirst,
  isLast,
}: {
  id: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"up" | "down" | null>(null);

  async function move(direction: "up" | "down") {
    setLoading(direction);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={() => move("up")}
        disabled={isFirst || loading !== null}
        aria-label="Sposta su"
        className="cursor-pointer rounded-lg p-1.5 text-foreground/50 hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
      >
        {loading === "up" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronUp className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        onClick={() => move("down")}
        disabled={isLast || loading !== null}
        aria-label="Sposta giù"
        className="cursor-pointer rounded-lg p-1.5 text-foreground/50 hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
      >
        {loading === "down" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
