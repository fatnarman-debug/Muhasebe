import type { Metadata } from "next";

/**
 * Uppgraderingssidan vander sig till den som redan ar inloggad och har inget
 * att gora i sokresultaten. Se src/app/auth/layout.tsx for resonemanget -
 * sidan ar en klientkomponent och kan inte satta metadata sjalv.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function UppgraderaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
