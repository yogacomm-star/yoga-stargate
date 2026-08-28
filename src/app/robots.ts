import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { siteLockEnabled } from "@/lib/siteLock";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Mentre il sito è dietro il codice di accesso temporaneo, i crawler non riuscirebbero
  // comunque a vedere nulla (redirect a /entrata): meglio dirglielo esplicitamente ed evitare
  // che provino a indicizzare pagine ancora in lavorazione.
  if (await siteLockEnabled()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/account", "/account/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
