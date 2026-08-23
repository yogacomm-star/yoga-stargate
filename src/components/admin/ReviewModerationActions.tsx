"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

export default function ReviewModerationActions({ reviewId }: { reviewId: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const router = useRouter();

  async function approve() {
    setLoading("approve");
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "PATCH" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function reject() {
    setLoading("reject");
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={approve}
        disabled={loading !== null}
        className="flex cursor-pointer items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
      >
        {loading === "approve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        Approva
      </button>
      <button
        type="button"
        onClick={reject}
        disabled={loading !== null}
        className="flex cursor-pointer items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground/70 hover:border-destructive hover:text-destructive disabled:opacity-60"
      >
        {loading === "reject" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
        Rifiuta
      </button>
    </div>
  );
}
