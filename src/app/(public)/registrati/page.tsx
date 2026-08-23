import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "@/components/site/RegisterForm";
import GoogleLoginButton from "@/components/site/GoogleLoginButton";

export const metadata: Metadata = {
  title: "Registrati",
  description: "Crea il tuo account Yoga Stargate per accedere a corsi, ritiri e contenuti riservati per livello.",
  robots: { index: false, follow: true },
};

export default function RegistratiPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <h1 className="text-center font-heading text-3xl font-semibold text-foreground">Crea il tuo account</h1>
      <p className="mt-2 text-center text-sm text-foreground/70">
        Inizia il tuo percorso: partirai dal livello Base e potrai salire di livello con la pratica.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft-sm sm:p-8">
        <GoogleLoginButton />
        <div className="my-5 flex items-center gap-3 text-xs text-foreground/50">
          <span className="h-px flex-1 bg-border" />
          oppure con email
          <span className="h-px flex-1 bg-border" />
        </div>
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-foreground/70">
        Hai già un account?{" "}
        <Link href="/login" className="cursor-pointer font-semibold text-primary">
          Accedi
        </Link>
      </p>
    </section>
  );
}
