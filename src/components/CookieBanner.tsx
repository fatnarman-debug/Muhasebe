"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "lf-cookie-consent"; // "all" | "necessary"
export const OPEN_EVENT = "lf-consent-open";

/** Oppnar cookiebannern igen sa att besokaren kan andra eller aterkalla sitt val. */
export function oppnaCookieinstallningar() {
  try { window.dispatchEvent(new Event(OPEN_EVENT)); } catch { /* ignorera */ }
}

/**
 * GDPR-cookiebanner. Tjänsten använder i nuläget endast nödvändiga cookies
 * (inloggning/session) som inte kräver samtycke. Bannern är förberedd för framtida
 * statistik-/analyscookies: ladda dem ENDAST om samtycke === "all".
 */
export function CookieBanner() {
  const [show, setShow] = useState(false);
  const [nuvarande, setNuvarande] = useState<"all" | "necessary" | null>(null);

  useEffect(() => {
    try {
      const sparat = localStorage.getItem(KEY) as "all" | "necessary" | null;
      setNuvarande(sparat);
      if (!sparat) setShow(true);
    } catch {
      /* localStorage kan saknas (privat läge) – visa då inte bannern upprepat */
    }

    // Samtycket maste ga att andra i efterhand, inte bara vid forsta besoket.
    // Lanken i sidfoten oppnar bannern igen via det har handelsen.
    function oppna() {
      try { setNuvarande(localStorage.getItem(KEY) as "all" | "necessary" | null); } catch {}
      setShow(true);
    }
    window.addEventListener(OPEN_EVENT, oppna);
    return () => window.removeEventListener(OPEN_EVENT, oppna);
  }, []);

  function choose(value: "all" | "necessary") {
    try {
      localStorage.setItem(KEY, value);
      document.cookie = `${KEY}=${value};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    } catch { /* ignorera */ }
    // Meddela GoogleAnalytics-komponenten sa att statistik startar/stoppas direkt
    try {
      window.dispatchEvent(new Event("lf-consent-change"));
    } catch { /* ignorera */ }
    setNuvarande(value);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl p-4 sm:p-5 sm:flex sm:items-center sm:gap-4">
        <p className="text-sm text-slate-600 leading-relaxed flex-1">
          Vi använder nödvändiga cookies för att tjänsten ska fungera och vill gärna använda cookies för statistik
          för att förbättra EnkeltFaktura. Läs mer i vår{" "}
          <Link href="/integritetspolicy" className="text-blue-700 underline">integritetspolicy</Link>.
          {nuvarande && (
            <>
              {" "}Ditt nuvarande val:{" "}
              <strong>{nuvarande === "all" ? "statistik tillåten" : "endast nödvändiga"}</strong>.
              Du kan ändra det här när du vill.
            </>
          )}
        </p>
        <div className="flex gap-2 mt-3 sm:mt-0 shrink-0">
          {/* Lika stora och lika framtradande: att neka ska inte vara svarare an att godta. */}
          <button
            onClick={() => choose("necessary")}
            aria-pressed={nuvarande === "necessary"}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            Endast nödvändiga
          </button>
          <button
            onClick={() => choose("all")}
            aria-pressed={nuvarande === "all"}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            Acceptera alla
          </button>
        </div>
      </div>
    </div>
  );
}
