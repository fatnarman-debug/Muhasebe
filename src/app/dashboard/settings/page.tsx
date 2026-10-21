"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Check, KeyRound, User, Download, ShieldAlert, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const [tab, setTab] = useState<"profile" | "password" | "data">("profile");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inställningar</h1>
        <p className="text-sm text-gray-500 mt-0.5">Hantera ditt konto</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {([["profile", "Profil", User], ["password", "Lösenord", KeyRound], ["data", "Dina uppgifter", ShieldAlert]] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab />}
      {tab === "password" && <PasswordTab />}
      {tab === "data" && <DataTab />}
    </div>
  );
}

function ProfileTab() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? "");
        setFullName(user.user_metadata?.full_name ?? "");
      }
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { full_name: fullName } });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Kontoinformation</h2>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-postadress</Label>
        <Input id="email" type="email" value={email} disabled className="bg-gray-50 text-gray-500" />
        <p className="text-xs text-gray-400">E-postadressen kan inte ändras här</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Namn</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ditt namn"
        />
      </div>
      <Button type="submit" disabled={loading} className="gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? "Sparat!" : "Spara"}
      </Button>
    </form>
  );
}

function PasswordTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (next !== confirm) { setError("Lösenorden matchar inte."); return; }
    if (next.length < 8) { setError("Lösenordet måste vara minst 8 tecken."); return; }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password: next });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setCurrent(""); setNext(""); setConfirm("");
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Byt lösenord</h2>
      <div className="space-y-1.5">
        <Label htmlFor="next">Nytt lösenord</Label>
        <Input id="next" type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Bekräfta nytt lösenord</Label>
        <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <Button type="submit" disabled={loading} className="gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
        {saved ? "Lösenord uppdaterat!" : "Uppdatera lösenord"}
      </Button>
    </form>
  );
}

/* Dataportabilitet och radering. Exporten hamtar anvandarens egna rader;
   raderingen registreras som en begaran i stallet for att verkstallas direkt,
   eftersom fakturor ar rakenskapsinformation med egen bevarandetid. */
function DataTab() {
  const [skickar, setSkickar] = useState(false);
  const [skickat, setSkickat] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const [anledning, setAnledning] = useState("");
  const [bekrafta, setBekrafta] = useState(false);

  async function begarRadering() {
    setFel(null);
    setSkickar(true);
    const res = await fetch("/api/konto/radera-begaran", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anledning }),
    });
    const data = await res.json().catch(() => ({}));
    setSkickar(false);
    if (!res.ok) { setFel(data.error ?? "Begäran kunde inte skickas."); return; }
    setSkickat(true);
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Ladda ner dina uppgifter
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Du får en JSON-fil med dina kunder, fakturor, fakturarader, artiklar och
          betalningar. Filen innehåller det du själv har lagt in.
        </p>
        <a
          href="/api/konto/export"
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" /> Ladda ner som JSON
        </a>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Avsluta kontot
        </h2>

        {skickat ? (
          <p className="flex items-start gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5">
            <Check className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Din begäran är registrerad. Vi hör av oss till din e-postadress när den
              har behandlats.
            </span>
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-600 leading-relaxed">
              Kontot avslutas inte direkt. Fakturor du har skapat är räkenskapsinformation
              och ska bevaras enligt bokföringslagen – allt kan därför inte raderas på
              en gång. Begäran behandlas manuellt och du får besked om vad som tas bort
              och vad som måste sparas.
            </p>
            <p className="flex items-start gap-2 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Ladda ner dina uppgifter innan du begär radering.</span>
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="anledning">Anledning (frivilligt)</Label>
              <Input
                id="anledning"
                value={anledning}
                onChange={(e) => setAnledning(e.target.value)}
                placeholder="Hjälper oss att bli bättre"
              />
            </div>

            <label className="flex items-start gap-2.5 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={bekrafta}
                onChange={(e) => setBekrafta(e.target.checked)}
                className="accent-red-600 mt-0.5"
              />
              <span>Jag vill att mitt konto avslutas och mina uppgifter raderas så långt det är möjligt.</span>
            </label>

            {fel && (
              <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                {fel}
              </p>
            )}

            <Button
              type="button"
              onClick={begarRadering}
              disabled={!bekrafta || skickar}
              className="gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {skickar ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
              {skickar ? "Skickar…" : "Begär radering"}
            </Button>
          </>
        )}
      </section>
    </div>
  );
}
