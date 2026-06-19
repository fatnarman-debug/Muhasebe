"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Check, KeyRound, User } from "lucide-react";

export default function SettingsPage() {
  const [tab, setTab] = useState<"profile" | "password">("profile");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inställningar</h1>
        <p className="text-sm text-gray-500 mt-0.5">Hantera ditt konto</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {([["profile", "Profil", User], ["password", "Lösenord", KeyRound]] as const).map(([key, label, Icon]) => (
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
