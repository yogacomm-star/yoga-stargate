import type { Metadata, Viewport } from "next";
import { Lora, Raleway } from "next/font/google";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS } from "@/lib/site";

const OG_IMAGE = {
  url: "/images/hero-meditazione-arcobaleno.jpg",
  width: 1200,
  height: 630,
  alt: "Yoga Stargate — Tina Mastandrea",
};

export const viewport: Viewport = {
  themeColor: "#1673b6",
};

const lora = Lora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const raleway = Raleway({
  variable: "--font-body",
  subsets: ["latin"],
  // 900 è caricato in più solo per la scritta "Stargate" del logo (font-black), più
  // massiccia del semplice grassetto: senza il peso reale il browser la simulerebbe.
  weight: ["300", "400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Yoga Stargate — Yoga Multidimensionale con Tina Mastandrea a Milano",
    template: "%s · Yoga Stargate",
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: "Tina Mastandrea" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Yoga Stargate — Yoga Multidimensionale con Tina Mastandrea a Milano",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yoga Stargate — Yoga Multidimensionale con Tina Mastandrea",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${lora.variable} ${raleway.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">
        {children}
      </body>
    </html>
  );
}
