import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Logo from "@/components/site/Logo";
import SiteAccessForm from "@/components/site/SiteAccessForm";
import { siteLockEnabled } from "@/lib/siteLock";

export const metadata: Metadata = {
  title: "Accesso",
  robots: { index: false, follow: false },
};

// Deve rileggere lo stato del blocco a ogni richiesta (non una volta sola al build): si
// attiva/disattiva dal pannello admin senza un nuovo deploy.
export const dynamic = "force-dynamic";

function safeRedirect(value: string | undefined): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}

export default async function SiteAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  // Se il blocco è già stato tolto dal pannello admin, questa pagina non serve più.
  if (!(await siteLockEnabled())) redirect("/");

  const { redirect: redirectParam } = await searchParams;
  const redirectTo = safeRedirect(redirectParam);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-20 sm:px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo iconSize={56} textClassName="flex flex-col items-center text-xl" />
        </div>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft-sm sm:p-8">
          <h1 className="text-center font-heading text-lg font-semibold text-foreground">Sito in lavorazione</h1>
          <p className="mt-2 text-center text-sm text-foreground/70">
            Il sito è temporaneamente riservato. Inserisci il codice di accesso per continuare.
          </p>
          <div className="mt-6">
            <SiteAccessForm redirectTo={redirectTo} />
          </div>
        </div>
      </div>
    </div>
  );
}
