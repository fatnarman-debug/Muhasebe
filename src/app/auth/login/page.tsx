"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Brandmark } from "@/components/Brandmark";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Turnstile, type TurnstileHandle } from "@/components/Turnstile";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [visa, setVisa] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const turnstile = useRef<TurnstileHandle | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email, password,
        options: captcha ? { captchaToken: captcha } : undefined,
      });
      if (authError) {
        setError("Fel e-postadress eller lösenord.");
        // Tokenen ar forbrukad. Utan nollstallning skickar nasta forsok samma
        // token och avvisas - det ser ut som fel losenord igen.
        turnstile.current?.reset();
        setLoading(false);
        return;
      }
      const role = data.user?.user_metadata?.role ?? "privat";
      const dest = role === "byraansvarig" ? "/yetkili" : role === "konsult" ? "/konsult" : "/dashboard";
      router.push(dest);
      router.refresh();
    } catch {
      setError("Något gick fel. Försök igen.");
      turnstile.current?.reset();
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#faf8f3] text-stone-900 antialiased">
      <div className="max-w-md mx-auto w-full px-5 py-12 sm:py-20">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10">
          <Brandmark className="w-9 h-9" />
          <span className="text-xl font-bold tracking-tight" style={{ color: "#13294B" }}>EnkeltFaktura</span>
        </Link>

        <div className="rounded-[1.4rem] border border-stone-200 bg-white p-7 sm:p-8 shadow-xl shadow-stone-900/[0.06]">
          <h1 className="text-xl font-semibold tracking-tight text-stone-900">Logga in</h1>
          <p className="text-[15px] text-stone-700 mt-1.5">Ange dina uppgifter för att fortsätta.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="epost" className="block text-sm font-medium text-stone-700 mb-1.5">
                E-postadress
              </label>
              <input
                id="epost"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full h-11 rounded-lg border border-stone-300 px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#13294B]/20 focus:border-stone-400"
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label htmlFor="losenord" className="block text-sm font-medium text-stone-700">
                  Lösenord
                </label>
                <Link
                  href="/auth/glomt-losenord"
                  className="text-sm text-[#13294B] underline decoration-stone-300 hover:decoration-[#13294B] underline-offset-2"
                >
                  Glömt lösenordet?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="losenord"
                  type={visa ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full h-11 rounded-lg border border-stone-300 px-3 pr-11 text-base focus:outline-none focus:ring-2 focus:ring-[#13294B]/20 focus:border-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setVisa((v) => !v)}
                  aria-label={visa ? "Dölj lösenord" : "Visa lösenord"}
                  className="absolute right-0 top-0 h-11 w-11 grid place-items-center text-stone-500 hover:text-stone-800 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13294B]/20"
                >
                  {visa ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                {error}
              </p>
            )}

            <Turnstile onToken={setCaptcha} handleRef={turnstile} />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 w-full bg-[#13294B] hover:bg-[#1e3a63] disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-full transition-colors"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Loggar in…</> : "Logga in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-stone-600 mt-6">
          Har du inget konto?{" "}
          <Link href="/auth/register" className="text-[#13294B] font-medium underline decoration-stone-300 hover:decoration-[#13294B] underline-offset-2">
            Skapa konto
          </Link>
        </p>
      </div>
    </div>
  );
}
