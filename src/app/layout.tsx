import type { Metadata } from "next";
import { Inter, Calistoga } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const calistoga = Calistoga({ subsets: ["latin"], weight: "400", variable: "--font-display" });

// Sätt NEXT_PUBLIC_SITE_URL i Coolify till din riktiga domän (annars används fallbacken)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ledgerflow.se";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Enkelfaktura – Fakturering & offert för svenska företag",
    template: "%s · Enkelfaktura",
  },
  description:
    "Skapa proffsiga fakturor och offerter på minuter. ROT/RUT, OCR & bankgiro, PDF och e-post – byggt för egenföretagare, redovisningskonsulter och redovisningsbyråer. Gratis att börja.",
  keywords: [
    "fakturaprogram", "faktureringssystem", "skapa faktura online", "fakturera enskild firma",
    "offert", "ROT-avdrag faktura", "RUT-avdrag", "bokföringsprogram egenföretagare",
    "redovisningsbyrå fakturering", "e-faktura", "OCR", "bankgiro", "fakturamall",
  ],
  authors: [{ name: "Enkelfaktura" }],
  applicationName: "Enkelfaktura",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: SITE_URL,
    siteName: "Enkelfaktura",
    title: "Enkelfaktura – Fakturering & offert för svenska företag",
    description:
      "Fakturor, offerter, ROT/RUT, OCR & bankgiro – allt på svenska, enligt svensk standard. Gratis att börja.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Enkelfaktura – fakturering för svenska företag" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enkelfaktura – Fakturering & offert för svenska företag",
    description: "Skapa fakturor och offerter på minuter. ROT/RUT, OCR & bankgiro, PDF och e-post.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  category: "business",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`h-full ${inter.variable} ${calistoga.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
