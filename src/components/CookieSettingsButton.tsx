"use client";

import { oppnaCookieinstallningar } from "@/components/CookieBanner";

/** Lank i sidfoten som later besokaren andra eller aterkalla sitt cookieval.
    Samtycket maste ga att ta tillbaka lika enkelt som det lamnades. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={oppnaCookieinstallningar} className={className}>
      Cookie-inställningar
    </button>
  );
}
