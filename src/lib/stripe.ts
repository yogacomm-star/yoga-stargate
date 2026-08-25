import Stripe from "stripe";

let client: Stripe | null = null;

// Inizializzazione differita all'uso (non a livello di modulo): alcuni bundler di build
// eseguono il modulo prima che le variabili d'ambiente della piattaforma siano disponibili.
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Stripe non configurato: manca STRIPE_SECRET_KEY.");
    client = new Stripe(key);
  }
  return client;
}
