"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Cloudflare Turnstile - kontrollen som skiljer en besokare fran ett skript.
 *
 * Den sitter pa registrering, inloggning och losenordsaterstallning. GoTrue
 * kraver en token pa alla tre sa fort captcha slas pa; saknas den pa nagon av
 * dem gar den vagen inte att anvanda langre.
 *
 * Tokenen galler en gang. Misslyckas anropet maste widgeten nollstallas, annars
 * skickar nasta forsok samma forbrukade token och avvisas - for anvandaren ser
 * det ut som fel losenord.
 *
 * Valjs Turnstile framfor reCAPTCHA for att den inte profilerar besokaren.
 * En captcha som samlar in uppgifter skulle behova stod i integritetspolicyn.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onTurnstileLoad?: () => void;
  }
}

export type TurnstileHandle = {
  reset: () => void;
};

export function Turnstile({
  onToken,
  handleRef,
}: {
  onToken: (token: string | null) => void;
  handleRef?: React.MutableRefObject<TurnstileHandle | null>;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  // Hallen i en ref sa att widgeten inte ritas om nar foraldern uppdateras.
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  const rita = useCallback(() => {
    if (!boxRef.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(boxRef.current, {
      sitekey: SITE_KEY,
      callback: (t: string) => onTokenRef.current(t),
      "error-callback": () => onTokenRef.current(null),
      "expired-callback": () => onTokenRef.current(null),
      theme: "light",
      language: "sv",
    });
  }, []);

  useEffect(() => {
    if (!SITE_KEY) return;

    if (window.turnstile) { rita(); }
    else if (!document.getElementById("cf-turnstile-script")) {
      const s = document.createElement("script");
      s.id = "cf-turnstile-script";
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.onload = rita;
      document.head.appendChild(s);
    } else {
      // Skriptet ar pa vag - vanta in det i stallet for att lagga till ett till.
      const i = window.setInterval(() => {
        if (window.turnstile) { window.clearInterval(i); rita(); }
      }, 100);
      return () => window.clearInterval(i);
    }

    const id = widgetId.current;
    return () => {
      if (id && window.turnstile) {
        try { window.turnstile.remove(id); } catch { /* redan borta */ }
      }
      widgetId.current = null;
    };
  }, [rita]);

  useEffect(() => {
    if (!handleRef) return;
    handleRef.current = {
      reset: () => {
        onTokenRef.current(null);
        if (widgetId.current && window.turnstile) {
          try { window.turnstile.reset(widgetId.current); } catch { /* ignorera */ }
        }
      },
    };
  }, [handleRef]);

  // Ar nyckeln inte satt ritas ingenting. Da ar captcha anda avstangd i GoTrue,
  // och en tom ruta skulle bara se ut som ett fel.
  if (!SITE_KEY) return null;

  return <div ref={boxRef} className="flex justify-center my-2" />;
}
