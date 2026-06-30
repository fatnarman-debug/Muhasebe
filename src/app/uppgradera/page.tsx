"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAccess } from "@/lib/subscription";
import { Brandmark } from "@/components/Brandmark";
import { Check, Loader2 } from "lucide-react";

type Interval = "month" | "year";

const PLANS = [
  {
    id: "egen", name: "Egen", note: "För egenföretagare",
    month: 79, year: 790,
    features: ["Obegränsade fakturor & offerter", "ROT/RUT-avdrag", "10+ mallar", "E-post & påminnelser", "OCR, bankgiro & kreditfaktura"],
    highlight: true,
  },
  {
    id: "byra", name: "Byrå", note: "För redovisningsbyråer",
    month: 299, year: 2990,
    features: ["Allt i Egen", "Flera konsulter", "Tilldela kunder", "Roller & behörigheter", "Krypterad backup & support"],
    highlight: false,
  },
];

export default function UppgraderaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [interval, setInterval] = useState<Interval>("month");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/auth/login"); return; }
      const { data: profile } = await supabase
        .from("profiles").select("subscription_status, trial_ends_at").eq("id", user.id).maybeSingle();
      const access = getAccess(profile);
      if (access.status === "active") { router.replace("/dashboard"); return; }
      setExpired(access.expired);
      setDaysLeft(access.daysLeft);
      setLoading(false);
    })();
  }, [router]);

  async function choose(planId: string) {
    setBusy(planId); setNotice("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, interval }),
      });
      if (res.ok) {
        const { url } = await res.json();
        if (url) { window.location.href = url; return; }
      }
      throw new Error();
    } catch {
      setNotice("Betalningen aktiveras inom kort. Hör av dig till support@enkelfaktura.se så hjälper vi dig igång direkt.");
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await createClient().auth.signOut();
    router.push("/auth/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: "#faf8f3" }}>
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#faf8f3", color: "#1c1917" }}>
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Brandmark className="w-9 h-9" />
          <span className="text-xl font-bold tracking-tight" style={{ color: "#13294B" }}>Enkelfaktura</span>
        </div>

        <div className="text-center max-w-xl mx-auto">
          <h1 className="font-bold text-3xl sm:text-4xl tracking-tight" style={{ color: "#13294B" }}>
            {expired ? "Din provperiod är slut" : "Uppgradera ditt konto"}
          </h1>
          <p className="text-stone-500 mt-3 text-lg">
            {expired
              ? "Välj en plan för att fortsätta skapa och skicka fakturor. Allt ditt material finns kvar."
              : daysLeft != null
                ? `Du har ${daysLeft} ${daysLeft === 1 ? "dag" : "dagar"} kvar av provperioden. Uppgradera när du vill.`
                : "Välj en plan för att fortsätta."}
          </p>
        </div>

        {/* Månad / år */}
        <div className="flex items-center justify-center gap-1 mt-8 p-1 rounded-full bg-white border border-stone-200 w-fit mx-auto">
          {(["month", "year"] as Interval[]).map((iv) => (
            <button key={iv} onClick={() => setInterval(iv)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
              style={interval === iv ? { background: "#13294B", color: "#fff" } : { color: "#78716c" }}>
              {iv === "month" ? "Per månad" : "Per år"}
              {iv === "year" && <span className="ml-1.5 text-xs" style={{ color: interval === "year" ? "#5eead4" : "#0f766e" }}>2 mån gratis</span>}
            </button>
          ))}
        </div>

        {/* Planer */}
        <div className="grid sm:grid-cols-2 gap-5 mt-8 items-start">
          {PLANS.map((p) => {
            const price = interval === "month" ? p.month : p.year;
            const period = interval === "month" ? "kr/mån" : "kr/år";
            return (
              <div key={p.id}
                className={`rounded-[1.4rem] p-7 bg-white ${p.highlight ? "border-2" : "border"}`}
                style={{ borderColor: p.highlight ? "#13294B" : "#e7e5e4" }}>
                <p className="text-sm font-semibold text-stone-900">{p.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">{p.note}</p>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-bold tracking-tight" style={{ color: "#13294B" }}>{price}</span>
                  <span className="text-sm text-stone-400">{period}</span>
                </div>
                <ul className="space-y-2.5 mt-6 mb-7">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-stone-600">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#15A39A" }} /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => choose(p.id)} disabled={busy !== null}
                  className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-full text-white transition-colors disabled:opacity-60"
                  style={{ background: "#13294B" }}>
                  {busy === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Välj {p.name}
                </button>
              </div>
            );
          })}
        </div>

        {notice && (
          <div className="mt-6 max-w-xl mx-auto text-center text-sm rounded-xl px-4 py-3"
            style={{ background: "#ecfdf5", color: "#0f766e", border: "1px solid #99f6e4" }}>
            {notice}
          </div>
        )}

        <div className="text-center mt-10 text-sm text-stone-400">
          Priser exkl. moms · Säg upp när du vill ·{" "}
          <button onClick={logout} className="underline hover:text-stone-600">Logga ut</button>
        </div>
      </div>
    </div>
  );
}
