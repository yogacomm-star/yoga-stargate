import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/components/site/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Password dimenticata",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-24 sm:px-6">
      <h1 className="text-center font-heading text-3xl font-semibold text-foreground">Password dimenticata</h1>
      <p className="mt-2 text-center text-sm text-foreground/70">
        Inserisci l&apos;email del tuo account: ti mandiamo un link per scegliere una nuova password.
      </p>
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft-sm sm:p-8">
        <ForgotPasswordForm />
      </div>
      <p className="mt-6 text-center text-sm text-foreground/70">
        <Link href="/login" className="cursor-pointer font-semibold text-primary">
          Torna all&apos;accesso
        </Link>
      </p>
    </section>
  );
}
