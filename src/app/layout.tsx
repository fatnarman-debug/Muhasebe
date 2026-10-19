import type { Metadata } from "next";
import { Inter, Calistoga, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const calistoga = Calistoga({ subsets: ["latin"], weight: "400", variable: "--font-display" });
// Sjalvhostad via next/font -> ingen render-blockerande begaran till fonts.googleapis.com
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

// Sätt NEXT_PUBLIC_SITE_URL i Coolify till din riktiga domän (annars används fallbacken)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enkeltfaktura.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EnkeltFaktura – Fakturering & offert för svenska företag",
    template: "%s · EnkeltFaktura",
  },
  description:
    "Skapa proffsiga fakturor och offerter på minuter. ROT/RUT, OCR & bankgiro, PDF och e-post – byggt för egenföretagare, redovisningskonsulter och redovisningsbyråer. Gratis att börja.",
  keywords: [
    "fakturaprogram", "faktureringssystem", "skapa faktura online", "fakturera enskild firma",
    "offert", "ROT-avdrag faktura", "RUT-avdrag", "bokföringsprogram egenföretagare",
    "redovisningsbyrå fakturering", "e-faktura", "OCR", "bankgiro", "fakturamall",
  ],
  authors: [{ name: "EnkeltFaktura" }],
  applicationName: "EnkeltFaktura",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: SITE_URL,
    siteName: "EnkeltFaktura",
    title: "EnkeltFaktura – Fakturering & offert för svenska företag",
    description:
      "Fakturor, offerter, ROT/RUT, OCR & bankgiro – allt på svenska, enligt svensk standard. Gratis att börja.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EnkeltFaktura – Fakturering & offert för svenska företag",
    description: "Skapa fakturor och offerter på minuter. ROT/RUT, OCR & bankgiro, PDF och e-post.",
  },
  robots: { index: true, follow: true },
  category: "business",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="sv"
      className={`h-full ${inter.variable} ${calistoga.variable} ${jetbrainsMono.variable}`}
    >
      {/*
        Inga <link> till fonts.googleapis.com har: de blockerar renderingen pa
        varje sida (~750 ms vardera pa mobil). JetBrains Mono hostas nu via
        next/font ovan. Material Symbols anvands BARA i /yetkili och /konsult
        och laddas darfor i respektive layout, inte globalt.
      */}
      <body className={`${inter.className} h-full antialiased`}>
        {children}
        <CookieBanner />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
