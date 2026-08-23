import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ResetPasswordForm from "@/components/site/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reimposta password",
  robots: { index: false, follow: false },
};

export default async function ReimpostaPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect("/login");

  return (
    <section className="mx-auto max-w-md px-4 py-20 sm:px-6">
      <h1 className="text-center font-heading text-3xl font-semibold text-foreground">Reimposta password</h1>
      <p className="mt-2 text-center text-sm text-foreground/70">Scegli una nuova password per il tuo account.</p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft-sm sm:p-8">
        <ResetPasswordForm token={token} />
      </div>
    </section>
  );
}
