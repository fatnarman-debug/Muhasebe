"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Brandmark } from "@/components/Brandmark";
import { Loader2, Check, AlertCircle, Eye, EyeOff } from "lucide-react";

/* Landningssida for inbjudan och losenordsaterstallning.
   GoTrue skickar tillbaka token i URL:ens hash (#access_token=...), vilket
   servern aldrig ser. Supabase-klienten plockar upp den automatiskt, sa den
   har sidan maste vara en klientkomponent. */

type Lage = "kontrollerar" | "redo" | "ingen-session" | "klar";

export default function SattLosenord() {
  const router = useRouter();
  const [lage, setLage] = useState<Lage>("kontrollerar");
  const [losen, setLosen] = useState("");
  const [visa, setVisa] = useState(false);
  const [sparar, setSparar] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const [epost, setEpost] = useState<string | null>(null);
  const [orsak, setOrsak] = useState<string | null>(null);
  const [kod, setKod] = useState("");
  const [kodEpost, setKodEpost] = useState("");
  const [kodFel, setKodFel] = useState<string | null>(null);
  const [kollarKod, setKollarKod] = useState(false);

  useEffect(() => {
    // Las hashen forst: supabase-klienten tommer den nar den initieras, och
    // da forsvinner bade token och eventuellt felmeddelande fran GoTrue.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const fraga = new URLSearchParams(window.location.search);
    const hashFel = hash.get("error_description") ?? hash.get("error") ?? fraga.get("error_description") ?? fraga.get("error");
    const felkod = hash.get("error_code") ?? fraga.get("error_code");
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");

    const supabase = createClient();
    let avbruten = false;

    async function kolla() {
      if (hashFel) {
        // Vanligaste orsaken: lanken har redan anvants, ofta av e-postklientens
        // egen lankskanning, eller sa har den gatt ut.
        setOrsak(
          /expired|invalid/i.test(felkod ?? hashFel)
            ? "Länken har gått ut eller har redan använts."
            : decodeURIComponent(hashFel.replace(/\+/g, " "))
        );
        setLage("ingen-session");
        return;
      }

      // detectSessionInUrl gor normalt jobbet, men den hinner inte alltid fore
      // forsta renderingen - lyssna darfor aven pa auth-handelsen nedan.
      const { data } = await supabase.auth.getSession();
      if (avbruten) return;
      if (data.session) {
        setEpost(data.session.user.email ?? null);
        setLage("redo");
        return;
      }

      // Fanns det en token i hashen men ingen session? Satt den sjalv i
      // stallet for att lita pa klientens automatik.
      if (accessToken && refreshToken) {
        const { data: satt, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (avbruten) return;
        if (satt.session) {
          setEpost(satt.session.user.email ?? null);
          setLage("redo");
          return;
        }
        if (error) setOrsak(error.message);
      }

      setLage("ingen-session");
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (avbruten) return;
      if (session) {
        setEpost(session.user.email ?? null);
        setLage("redo");
      }
    });

    kolla();
    return () => { avbruten = true; sub.subscription.unsubscribe(); };
  }, []);

  /* Reservvag nar lanken inte gar att vaxla in. Inbjudningar skickas fran
     servern med service-role, sa den PKCE-verifierare som ?code kraver har
     aldrig skapats i mottagarens webblasare. Engangskoden i mejlet ar inte
     bunden till nagon webblasare och fungerar da i stallet. */
  async function losInKod(e: React.FormEvent) {
    e.preventDefault();
    setKodFel(null);
    setKollarKod(true);

    const supabase = createClient();
    const epostTrim = kodEpost.trim();
    const kodTrim = kod.replace(/\s/g, "");

    // Samma kod kan komma fran en inbjudan, en aterstallning eller en
    // bekraftelse - prova typerna i tur och ordning.
    let sista: string | null = null;
    for (const typ of ["invite", "recovery", "signup", "email"] as const) {
      const { data, error } = await supabase.auth.verifyOtp({
        email: epostTrim,
        token: kodTrim,
        type: typ,
      });
      if (data?.session) {
        setEpost(data.session.user.email ?? epostTrim);
        setKollarKod(false);
        setLage("redo");
        return;
      }
      sista = error?.message ?? sista;
    }

    setKollarKod(false);
    setKodFel(
      /expired|invalid/i.test(sista ?? "")
        ? "Koden stämmer inte eller har gått ut. Begär en ny länk."
        : sista ?? "Koden kunde inte verifieras."
    );
  }

  async function spara(e: React.FormEvent) {
    e.preventDefault();
    setFel(null);
    if (losen.length < 8) { setFel("Lösenordet måste vara minst 8 tecken."); return; }

    setSparar(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: losen });
    setSparar(false);

    if (error) { setFel(error.message); return; }

    setLage("klar");
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role ?? "privat";
    const dest = role === "byraansvarig" ? "/yetkili" : role === "konsult" ? "/konsult" : "/dashboard";
    setTimeout(() => { router.push(dest); router.refresh(); }, 1200);
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-stone-900 antialiased flex flex-col">
      <div className="max-w-md mx-auto w-full px-5 py-12 sm:py-20">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10">
          <Brandmark className="w-9 h-9" />
          <span className="text-xl font-bold tracking-tight" style={{ color: "#13294B" }}>EnkeltFaktura</span>
        </Link>

        <div className="rounded-[1.4rem] border border-stone-200 bg-white p-7 sm:p-8 shadow-xl shadow-stone-900/[0.06]">
          {lage === "kontrollerar" && (
            <p className="flex items-center gap-2.5 text-stone-600">
              <Loader2 className="w-4 h-4 animate-spin" /> Kontrollerar din inbjudan…
            </p>
          )}

          {lage === "ingen-session" && (
            <>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h1 className="font-semibold text-stone-900">Länken gick inte att använda</h1>
                  <p className="text-[15px] text-stone-700 leading-relaxed mt-2">
                    {orsak ?? "Vi hittade ingen giltig inbjudan i länken."} Inbjudnings- och
                    återställningslänkar gäller en begränsad tid och kan bara användas en gång.
                    Använd koden från mejlet nedan, eller begär en ny länk.
                  </p>
                </div>
              </div>
              <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50/70 p-5">
                <h2 className="font-semibold text-stone-900 text-[15px]">Har du koden i mejlet?</h2>
                <p className="text-sm text-stone-700 leading-relaxed mt-1.5">
                  Längst ned i mejlet står en sexsiffrig kod. Den fungerar även när länken
                  inte gör det – till exempel om du öppnar den i en annan webbläsare.
                </p>

                <form onSubmit={losInKod} className="mt-4 space-y-3">
                  <div>
                    <label htmlFor="kod-epost" className="block text-sm font-medium text-stone-700 mb-1.5">
                      E-postadress
                    </label>
                    <input
                      id="kod-epost"
                      type="email"
                      inputMode="email"
                      value={kodEpost}
                      onChange={(e) => setKodEpost(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full h-11 rounded-lg border border-stone-300 px-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#13294B]/20 focus:border-stone-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="kod" className="block text-sm font-medium text-stone-700 mb-1.5">
                      Kod från mejlet
                    </label>
                    <input
                      id="kod"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9 ]*"
                      maxLength={9}
                      value={kod}
                      onChange={(e) => setKod(e.target.value)}
                      required
                      placeholder="123456"
                      className="w-full h-11 rounded-lg border border-stone-300 px-3 text-base bg-white tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-[#13294B]/20 focus:border-stone-400"
                    />
                  </div>

                  {kodFel && (
                    <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                      {kodFel}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={kollarKod}
                    className="inline-flex items-center justify-center gap-2 w-full bg-[#13294B] hover:bg-[#1e3a63] disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-full transition-colors"
                  >
                    {kollarKod ? <><Loader2 className="w-4 h-4 animate-spin" /> Kontrollerar…</> : "Fortsätt med koden"}
                  </button>
                </form>
              </div>

              <Link
                href="/auth/glomt-losenord"
                className="block text-center text-sm text-stone-700 underline decoration-stone-300 hover:decoration-stone-700 underline-offset-2 mt-5"
              >
                Skicka en ny länk i stället
              </Link>
              <Link
                href="/auth/login"
                className="block text-center text-sm text-stone-600 underline decoration-stone-300 hover:decoration-stone-600 underline-offset-2 mt-3"
              >
                Till inloggningen
              </Link>
            </>
          )}

          {lage === "redo" && (
            <>
              <h1 className="font-semibold text-xl text-stone-900">Välj ett lösenord</h1>
              <p className="text-[15px] text-stone-700 leading-relaxed mt-2">
                {epost ? <>Kontot <strong>{epost}</strong> är klart.</> : "Ditt konto är klart."}{" "}
                Välj ett lösenord så kommer du igång.
              </p>

              <form onSubmit={spara} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="pw" className="block text-sm font-medium text-stone-700 mb-1.5">
                    Lösenord
                  </label>
                  <div className="relative">
                    <input
                      id="pw"
                      type={visa ? "text" : "password"}
                      value={losen}
                      onChange={(e) => setLosen(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      autoFocus
                      className="w-full h-11 rounded-lg border border-stone-300 px-3 pr-11 text-base focus:outline-none focus:ring-2 focus:ring-[#13294B]/20 focus:border-stone-400"
                    />
                    <button
                      type="button"
                      onClick={() => setVisa((v) => !v)}
                      aria-label={visa ? "Dölj lösenord" : "Visa lösenord"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 transition-colors"
                    >
                      {visa ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-stone-600 mt-1.5">Minst 8 tecken.</p>
                </div>

                {fel && (
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                    {fel}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sparar}
                  className="inline-flex items-center justify-center gap-2 w-full bg-[#13294B] hover:bg-[#1e3a63] disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-full transition-colors"
                >
                  {sparar ? <><Loader2 className="w-4 h-4 animate-spin" /> Sparar…</> : "Spara och kom igång"}
                </button>
              </form>
            </>
          )}

          {lage === "klar" && (
            <p className="flex items-center gap-2.5 text-teal-800">
              <Check className="w-5 h-5" /> Klart! Skickar dig vidare…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
