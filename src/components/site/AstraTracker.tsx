"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Statistiche di visita anonime di Astra: a ogni pagina vista invia solo l'identificativo del
// sito e il percorso (es. "/eventi"). Nessun cookie, nessun dato personale. Il sito è una
// applicazione a pagine dinamiche: la navigazione tra una pagina e l'altra non ricarica il
// browser, quindi lo script va eseguito a ogni cambio di percorso e non una volta sola.
const ENDPOINT = "https://astra-notify.jacopopelliccione.workers.dev/api/track";
const CLIENT_ID = "Y3jsUFpPh4kUSwcgNLmj";

export default function AstraTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Non si conteggiano le prove in locale né le visite al pannello admin (sono di chi
    // gestisce il sito, non del pubblico).
    if (process.env.NODE_ENV !== "production" || pathname.startsWith("/admin")) return;
    try {
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: CLIENT_ID, page: pathname }),
      }).catch(() => {});
    } catch {
      // le statistiche non devono mai influire sul sito
    }
  }, [pathname]);

  return null;
}
