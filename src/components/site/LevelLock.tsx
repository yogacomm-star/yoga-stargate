import type { ReactNode } from "react";
import { Lock, Sparkle } from "lucide-react";
import { canAccess, levelLabel } from "@/lib/levels";

export function LevelBadge({ requiredLevel }: { requiredLevel: number | null }) {
  if (requiredLevel == null) {
    return (
      <span className="badge-level badge-open">
        <Sparkle className="h-3 w-3" aria-hidden="true" />
        Aperto a tutti
      </span>
    );
  }
  return (
    <span className="badge-level">
      <Lock className="h-3 w-3" aria-hidden="true" />
      Livello {levelLabel(requiredLevel)}
    </span>
  );
}

export function LevelGate({
  requiredLevel,
  accountLevel,
  children,
  fallback,
}: {
  requiredLevel: number | null;
  accountLevel: number | null | undefined;
  children: ReactNode;
  fallback: ReactNode;
}) {
  if (canAccess(requiredLevel, accountLevel)) return <>{children}</>;
  return <>{fallback}</>;
}

export function PurchaseLockedNotice({ price }: { price: number }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/60 px-6 py-10 text-center">
      <Lock className="h-8 w-8 text-primary" aria-hidden="true" />
      <p className="font-heading text-lg font-semibold text-foreground">Contenuto a pagamento — {price.toFixed(2)}€</p>
      <p className="max-w-sm text-sm text-foreground/70">
        L&apos;acquisto online sarà presto disponibile direttamente qui. Nel frattempo scrivici per accedere a questo
        corso.
      </p>
      <a href="/contatti" className="mt-1 cursor-pointer rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
        Contattaci
      </a>
    </div>
  );
}

export function LevelLockedNotice({ requiredLevel, loggedIn }: { requiredLevel: number; loggedIn: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/60 px-6 py-10 text-center">
      <Lock className="h-8 w-8 text-primary" aria-hidden="true" />
      <p className="font-heading text-lg font-semibold text-foreground">
        Contenuto riservato al livello {levelLabel(requiredLevel)}
      </p>
      <p className="max-w-sm text-sm text-foreground/70">
        {loggedIn
          ? "Il tuo livello attuale non è ancora sufficiente per accedere a questo contenuto. Contattaci per saperne di più sul percorso di crescita."
          : "Accedi o registrati per scoprire se puoi sbloccare questo contenuto."}
      </p>
      <div className="mt-1 flex gap-3">
        {!loggedIn && (
          <a href="/login" className="cursor-pointer rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
            Accedi
          </a>
        )}
        <a href="/contatti" className="cursor-pointer rounded-lg border-2 border-primary px-5 py-2 text-sm font-semibold text-primary">
          Contattaci
        </a>
      </div>
    </div>
  );
}
