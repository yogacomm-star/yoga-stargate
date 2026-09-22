import type { Metadata } from "next";
import Link from "next/link";
import UnsubscribeButton from "@/components/site/UnsubscribeButton";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

export const metadata: Metadata = {
  title: "Annulla iscrizione alle email",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const valid = !!verifyUnsubscribeToken(t);

  return (
    <section className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
      <h1 className="font-heading text-3xl font-semibold text-foreground">Email di Yoga Stargate</h1>
      {valid && t ? (
        <>
          <p className="mt-3 text-sm text-foreground/70">
            Vuoi smettere di ricevere le nostre email con novità, pratiche e inviti agli eventi? Continuerai a ricevere
            solo i messaggi di servizio (per esempio la conferma di un acquisto o di una prenotazione).
          </p>
          <div className="mt-8">
            <UnsubscribeButton token={t} />
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-foreground/70">
          Questo link non è valido o è incompleto. Per non ricevere più le nostre email scrivici a{" "}
          <a href="mailto:info@yogastargate.com" className="font-medium text-primary underline underline-offset-2">
            info@yogastargate.com
          </a>
          .
        </p>
      )}
      <p className="mt-8 text-sm">
        <Link href="/" className="cursor-pointer font-semibold text-primary">
          Torna al sito
        </Link>
      </p>
    </section>
  );
}
