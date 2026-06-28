"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "lf-cookie-consent"; // "all" | "necessary"

/**
 * GDPR-cookiebanner. Tjänsten använder i nuläget endast nödvändiga cookies
 * (inloggning/session) som inte kräver samtycke. Bannern är förberedd för framtida
 * statistik-/analyscookies: ladda dem ENDAST om samtycke === "all".
 */
export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* localStorage kan saknas (privat läge) – visa då inte bannern upprepat */
    }
  }, []);

  function choose(value: "all" | "necessary") {
    try {
      localStorage.setItem(KEY, value);
      document.cookie = `${KEY}=${value};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    } catch { /* ignorera */ }
    // Framtid: if (value === "all") { /* initiera analytics här */ }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl p-4 sm:p-5 sm:flex sm:items-center sm:gap-4">
        <p className="text-sm text-slate-600 leading-relaxed flex-1">
          Vi använder nödvändiga cookies för att tjänsten ska fungera och vill gärna använda cookies för statistik
          för att förbättra LedgerFlow. Läs mer i vår{" "}
          <Link href="/integritetspolicy" className="text-blue-700 underline">integritetspolicy</Link>.
        </p>
        <div className="flex gap-2 mt-3 sm:mt-0 shrink-0">
          <button
            onClick={() => choose("necessary")}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Endast nödvändiga
          </button>
          <button
            onClick={() => choose("all")}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Acceptera alla
          </button>
        </div>
      </div>
    </div>
  );
}
