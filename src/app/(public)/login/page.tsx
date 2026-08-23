import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/site/LoginForm";
import GoogleLoginButton from "@/components/site/GoogleLoginButton";

export const metadata: Metadata = {
  title: "Accedi",
  description: "Accedi al tuo account Yoga Stargate per corsi, ritiri e contenuti riservati.",
  robots: { index: false, follow: true },
};

const GOOGLE_ERRORS: Record<string, string> = {
  google_not_configured: "L'accesso con Google non è ancora configurato.",
  google_failed: "Accesso con Google non riuscito, riprova.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <section className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <h1 className="text-center font-heading text-3xl font-semibold text-foreground">Bentornata/o</h1>
      <p className="mt-2 text-center text-sm text-foreground/70">
        Accedi per continuare il tuo percorso, tracciare i progressi e sbloccare i contenuti del tuo livello.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft-sm sm:p-8">
        {error && GOOGLE_ERRORS[error] && (
          <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {GOOGLE_ERRORS[error]}
          </p>
        )}
        <GoogleLoginButton />
        <div className="my-5 flex items-center gap-3 text-xs text-foreground/50">
          <span className="h-px flex-1 bg-border" />
          oppure con email
          <span className="h-px flex-1 bg-border" />
        </div>
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-sm text-foreground/70">
        Non hai ancora un account?{" "}
        <Link href="/registrati" className="cursor-pointer font-semibold text-primary">
          Registrati
        </Link>
      </p>
    </section>
  );
}
