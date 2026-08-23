"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

export default function CourseProgressToggle({
  courseId,
  initialCompleted,
  loggedIn,
}: {
  courseId: string;
  initialCompleted: boolean;
  loggedIn: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  if (!loggedIn) {
    return (
      <a
        href="/login"
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground/70 hover:border-primary hover:text-primary"
      >
        <Circle className="h-4 w-4" aria-hidden="true" />
        Accedi per tracciare i tuoi progressi
      </a>
    );
  }

  async function toggle() {
    setLoading(true);
    const next = !completed;
    try {
      const res = await fetch(`/api/courses/${courseId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: next }),
      });
      if (res.ok) setCompleted(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
        completed ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:border-primary"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      {completed ? "Corso completato" : "Segna come completato"}
    </button>
  );
}
