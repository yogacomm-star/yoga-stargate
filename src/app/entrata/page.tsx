import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MessageCircle, Mail } from "lucide-react";
import StargateLoader from "@/components/site/StargateLoader";
import { siteLockEnabled } from "@/lib/siteLock";

export const metadata: Metadata = {
  title: "Il portale si sta aprendo",
  robots: { index: false, follow: false },
};

// Deve rileggere lo stato del blocco a ogni richiesta (non una volta sola al build): si
// attiva/disattiva dal pannello admin senza un nuovo deploy.
export const dynamic = "force-dynamic";

export default async function SiteLockedPage() {
  // Se il blocco è già stato tolto dal pannello admin, questa pagina non serve più: chi la
  // raggiunge direttamente (non tramite il rewrite di proxy.ts) va mandato alla home vera.
  if (!(await siteLockEnabled())) redirect("/");

  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden px-4 py-20 sm:px-6">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-mystic/15 via-primary/10 to-warm-surface" />

      <div className="flex w-full max-w-md flex-col items-center text-center">
        <StargateLoader size={220} />

        <h1 className="mt-8 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Il portale si sta aprendo
        </h1>
        <p className="mt-3 text-foreground/70">
          Yoga Stargate sta preparando una nuova esperienza. Torna a trovarci molto presto.
        </p>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 text-sm text-foreground/60 sm:flex-row sm:gap-6">
          <a href="https://wa.me/393336980044" className="flex cursor-pointer items-center justify-center gap-2 hover:text-primary">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            +39 333 698 0044
          </a>
          <a href="mailto:info@yogastargate.com" className="flex cursor-pointer items-center justify-center gap-2 hover:text-primary">
            <Mail className="h-4 w-4" aria-hidden="true" />
            info@yogastargate.com
          </a>
        </div>
      </div>
    </div>
  );
}
