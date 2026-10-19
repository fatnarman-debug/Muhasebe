"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = "G-BEVD2E3F3G";
const CONSENT_KEY = "lf-cookie-consent"; // "all" | "necessary"

/**
 * Google Analytics – laddas ENDAST om anvandaren samtyckt till statistikcookies
 * (lf-cookie-consent === "all"). GDPR-kompatibelt: ingen sparning utan samtycke.
 * Lyssnar aven pa "lf-consent-change" sa att GA startar direkt nar man klickar
 * "Acceptera alla" i cookiebannern, utan omladdning.
 */
export function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        setEnabled(localStorage.getItem(CONSENT_KEY) === "all");
      } catch {
        setEnabled(false);
      }
    };
    check();
    window.addEventListener("lf-consent-change", check);
    return () => window.removeEventListener("lf-consent-change", check);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
