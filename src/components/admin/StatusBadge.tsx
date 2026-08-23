export default function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
        Pubblicato
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground/60">
      Bozza
    </span>
  );
}
