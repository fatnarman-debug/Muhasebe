"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Brandmark } from "@/components/Brandmark";
import { Loader2, MailCheck } from "lucide-react";

/* Begar en ny losenordslank. Anvands ocksa nar en inbjudningslank har
   gatt ut eller redan blivit anvand - da racker det att anvandaren
   begar en ny lank harifran. */

export default function GlomtLosenord() {
  const [epost, setEpost] = useState("");
  const [skickar, setSkickar] = useState(false);
  const [skickat, setSkickat] = useState(false);
  const [fel, setFel] = useState<string | null>(null);

  async function skicka(e: React.FormEvent) {
    e.preventDefault();
    setFel(null);
    setSkickar(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(epost.trim(), {
      redirectTo: `${window.location.origin}/auth/satt-losenord`,
    });
    setSkickar(false);

    // Visa samma bekraftelse aven vid fel pa adressen: annars gar det att
    // lista ut vilka e-postadresser som har konto har.
    if (error && !/rate|limit|for many/i.test(error.message)) {
      setSkickat(true);
      return;
    }
    if (error) { setFel("För många försök. Vänta en stund och prova igen."); return; }
    setSkickat(true);
  }

  return (
    <div className="min-h-dvh bg-[#faf8f3] text-stone-900 antialiased">
      <div className="max-w-md mx-auto w-full px-5 py-12 sm:py-20">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10">
          <Brandmark className="w-9 h-9" />
          <span className="text-xl font-bold tracking-tight" style={{ color: "#13294B" }}>EnkeltFaktura</span>
        </Link>

        <div className="rounded-[1.4rem] border border-stone-200 bg-white p-7 sm:p-8 shadow-xl shadow-stone-900/[0.06]">
          {skickat ? (
            <>
              <div className="flex items-start gap-3">
                <MailCheck className="w-5 h-5 text-teal-700 mt-0.5 shrink-0" />
                <div>
                  <h1 className="font-semibold text-stone-900">Kontrollera din e-post</h1>
                  <p className="text-[15px] text-stone-700 leading-relaxed mt-2">
                    Finns det ett konto för <strong>{epost}</strong> har vi skickat en länk dit.
                    Titta även i skräpposten. Länken gäller en timme och kan bara användas en gång.
                  </p>
                </div>
              </div>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center w-full bg-[#13294B] hover:bg-[#1e3a63] text-white font-semibold px-5 py-3 rounded-full transition-colors mt-6"
              >
                Till inloggningen
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold tracking-tight text-stone-900">Nytt lösenord</h1>
              <p className="text-[15px] text-stone-700 leading-relaxed mt-1.5">
                Ange din e-postadress så skickar vi en länk där du väljer ett nytt lösenord.
              </p>

              <form onSubmit={skicka} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="epost" className="block text-sm font-medium text-stone-700 mb-1.5">
                    E-postadress
                  </label>
                  <input
                    id="epost"
                    type="email"
                    inputMode="email"
                    value={epost}
                    onChange={(e) => setEpost(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                    className="w-full h-11 rounded-lg border border-stone-300 px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#13294B]/20 focus:border-stone-400"
                  />
                </div>

                {fel && (
                  <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                    {fel}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={skickar}
                  className="inline-flex items-center justify-center gap-2 w-full bg-[#13294B] hover:bg-[#1e3a63] disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-full transition-colors"
                >
                  {skickar ? <><Loader2 className="w-4 h-4 animate-spin" /> Skickar…</> : "Skicka länk"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-stone-600 mt-6">
          <Link href="/auth/login" className="underline decoration-stone-300 hover:decoration-stone-600 underline-offset-2">
            Tillbaka till inloggningen
          </Link>
        </p>
      </div>
    </div>
  );
}
