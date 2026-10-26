import type { Metadata } from "next";

/**
 * Inloggning, registrering och losenordssidor ska inte ligga i sokresultaten.
 *
 * Rotlayouten satter index: true for hela sajten, och de har sidorna arvde
 * den - de bad alltsa uttryckligen om att bli indexerade. Google valde att
 * inte gora det, men lade dem i rapporten och lade tid pa att hamta dem.
 *
 * Sidorna ar klientkomponenter och kan darfor inte exportera metadata sjalva.
 * Det maste ligga i en layout, som ar en serverkomponent.
 *
 * De blockeras inte i robots.txt med flit: ska Google folja noindex maste den
 * forst fa lasa sidan. En sparrad sida kan tvartom hamna i indexet anda, via
 * lankar utifran.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
