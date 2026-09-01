import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

// Web app manifest: è quello che permette ad Android/Chrome di aggiungere il sito alla schermata
// home con l'icona e i colori giusti invece di uno screenshot della pagina. Next lo serve su
// /manifest.webmanifest e lo collega da solo nell'<head> di ogni pagina.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Yoga Multidimensionale`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#fdfbf6", // --color-background
    theme_color: "#1673b6", // --color-primary, uguale al themeColor in layout.tsx
    lang: "it",
    icons: [
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        // "any": l'icona ha già i suoi margini interni, non va ritagliata dal sistema.
        purpose: "any",
      },
    ],
  };
}
