"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Check, KeyRound, User, Store, Users } from "lucide-react";

type Tab = "buro" | "profil" | "sifre" | "muhasebeci";

export default function YetkiliAyarlarPage() {
  const [tab, setTab] = useState<Tab>("buro");

  const TABS: [Tab, string, typeof User][] = [
    ["buro", "Büro", Store],
    ["profil", "Profil", User],
    ["sifre", "Şifre", KeyRound],
    ["muhasebeci", "Muhasebeciler", Users],
  ];

  return (
    <main className="flex-1 overflow-y-auto" style={{ padding: 32 }}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Büro ve hesap yönetimi</p>
        </div>

        <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
          {TABS.map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                tab === key ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "buro" && <BuroTab />}
        {tab === "profil" && <ProfilTab />}
        {tab === "sifre" && <SifreTab />}
        {tab === "muhasebeci" && <MuhasebeciTab />}
      </div>
    </main>
  );
}

// ── Büro adı ────────────────────────────────────────────────────────────────
function BuroTab() {
  const [name, setName] = useState("");
  const [initial, setInitial] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/yetkili/dukkan");
      const json = await res.json().catch(() => ({}));
      if (res.ok) { setName(json.dukkan?.dukkan_adi ?? ""); setInitial(json.dukkan?.dukkan_adi ?? ""); }
      setLoading(false);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSaving(true);
    const res = await fetch("/api/yetkili/dukkan", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dukkan_adi: name }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setError(json.error ?? "Kaydedilemedi"); return; }
    setInitial(name); setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={save} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Büro bilgileri</h2>
      <div className="space-y-1.5">
        <Label htmlFor="dukkan">Dükkan / büro adı</Label>
        <Input id="dukkan" value={name} disabled={loading} onChange={(e) => setName(e.target.value)} placeholder="Büro adı" />
        <p className="text-xs text-slate-400">Sidebar ve panel başlıklarında görünen ad.</p>
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <Button type="submit" disabled={saving || loading || !name.trim() || name === initial} className="gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? "Kaydedildi!" : "Kaydet"}
      </Button>
    </form>
  );
}

// ── Profil (ad soyad) ────────────────────────────────────────────────────────
function ProfilTab() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) { setEmail(user.email ?? ""); setFullName(user.user_metadata?.full_name ?? ""); }
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await createClient().auth.updateUser({ data: { full_name: fullName.trim() } });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={save} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Hesap bilgileri</h2>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" type="email" value={email} disabled className="bg-slate-50 text-slate-500" />
        <p className="text-xs text-slate-400">E-posta buradan değiştirilemez.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Ad soyad</Label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Adınız" />
      </div>
      <Button type="submit" disabled={saving} className="gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? "Kaydedildi!" : "Kaydet"}
      </Button>
    </form>
  );
}

// ── Kendi şifresi ────────────────────────────────────────────────────────────
function SifreTab() {
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (next !== confirm) { setError("Şifreler eşleşmiyor."); return; }
    if (next.length < 8) { setError("Şifre en az 8 karakter olmalıdır."); return; }
    setSaving(true);
    const { error: err } = await createClient().auth.updateUser({ password: next });
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true); setNext(""); setConfirm(""); setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={save} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Şifre değiştir</h2>
      <div className="space-y-1.5">
        <Label htmlFor="next">Yeni şifre</Label>
        <Input id="next" type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Yeni şifre (tekrar)</Label>
        <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <Button type="submit" disabled={saving} className="gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
        {saved ? "Şifre güncellendi!" : "Şifreyi güncelle"}
      </Button>
    </form>
  );
}

// ── Muhasebeci e-posta + şifre yönetimi ──────────────────────────────────────
type Acc = { id: string; full_name: string; email: string; benzersiz_kod: string; is_active: boolean };

function MuhasebeciTab() {
  const [list, setList] = useState<Acc[]>([]);
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [pws, setPws] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string>(""); // `email:<id>` | `pw:<id>`
  const [note, setNote] = useState<Record<string, { ok: boolean; text: string }>>({});

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/yetkili/muhasebeciler");
      const json = await res.json().catch(() => ({}));
      const acc: Acc[] = json.muhasebeciler ?? [];
      setList(acc);
      setEmails(Object.fromEntries(acc.map((a) => [a.id, a.email])));
      setLoading(false);
    })();
  }, []);

  function setNoteFor(id: string, ok: boolean, text: string) {
    setNote((p) => ({ ...p, [id]: { ok, text } }));
    setTimeout(() => setNote((p) => { const n = { ...p }; delete n[id]; return n; }), 3500);
  }

  async function saveEmail(a: Acc) {
    const email = (emails[a.id] ?? "").trim();
    if (!email || email === a.email) return;
    setBusy(`email:${a.id}`);
    const res = await fetch(`/api/yetkili/muhasebeciler/${a.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) { setNoteFor(a.id, false, json.error ?? "Kaydedilemedi"); return; }
    setList((p) => p.map((x) => (x.id === a.id ? { ...x, email } : x)));
    setNoteFor(a.id, true, "E-posta güncellendi.");
  }

  async function savePw(a: Acc) {
    const password = pws[a.id] ?? "";
    if (password.length < 8) { setNoteFor(a.id, false, "Şifre en az 8 karakter olmalı."); return; }
    setBusy(`pw:${a.id}`);
    const res = await fetch(`/api/yetkili/muhasebeciler/${a.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) { setNoteFor(a.id, false, json.error ?? "Şifre güncellenemedi"); return; }
    setPws((p) => ({ ...p, [a.id]: "" }));
    setNoteFor(a.id, true, "Şifre güncellendi.");
  }

  if (loading) return <div className="flex justify-center py-12 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Muhasebecilerin <strong>giriş e-postasını</strong> ve <strong>şifresini</strong> buradan değiştirebilirsin. Değişiklik anında geçerli olur.
      </p>
      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm text-slate-400">Henüz muhasebeci yok.</div>
      ) : list.map((a) => (
        <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">{a.full_name}</div>
              <code className="text-[11px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{a.benzersiz_kod}</code>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${a.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {a.is_active ? "Aktif" : "Pasif"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">E-posta</Label>
              <Input value={emails[a.id] ?? ""} onChange={(e) => setEmails((p) => ({ ...p, [a.id]: e.target.value }))} type="email" />
            </div>
            <Button type="button" variant="outline" disabled={busy !== "" || (emails[a.id] ?? "").trim() === a.email} onClick={() => saveEmail(a)} className="gap-1.5">
              {busy === `email:${a.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Kaydet
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Yeni şifre</Label>
              <Input value={pws[a.id] ?? ""} onChange={(e) => setPws((p) => ({ ...p, [a.id]: e.target.value }))} type="password" placeholder="En az 8 karakter" />
            </div>
            <Button type="button" disabled={busy !== "" || (pws[a.id] ?? "").length < 8} onClick={() => savePw(a)} className="gap-1.5">
              {busy === `pw:${a.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />} Şifre belirle
            </Button>
          </div>

          {note[a.id] && <p className={`text-xs ${note[a.id].ok ? "text-emerald-600" : "text-red-600"}`}>{note[a.id].text}</p>}
        </div>
      ))}
    </div>
  );
}
