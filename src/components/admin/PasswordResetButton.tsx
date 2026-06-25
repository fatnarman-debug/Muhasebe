"use client";

import { useState } from "react";
import { KeyRound, Loader2, Check, X } from "lucide-react";
import { resetUserPassword } from "@/lib/admin-buros-actions";

export function PasswordResetButton({ userId, label }: { userId: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);

  function genPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let p = "";
    for (let i = 0; i < 10; i++) p += chars[Math.floor((i * 7 + pw.length + 13) % chars.length)];
    // basit, deterministik olmayan istemiyoruz; her tıklamada farklı olsun diye time bazlı karıştır
    const r = Math.floor(performance.now()) % chars.length;
    setPw((chars[r] + p).slice(0, 12));
  }

  async function submit() {
    setSaving(true);
    setMsg(null);
    const res = await resetUserPassword(userId, pw);
    setSaving(false);
    if ("error" in res) {
      setMsg({ ok: false, text: res.error });
    } else {
      setMsg({ ok: true, text: "Şifre güncellendi. Yeni şifreyi kullanıcıya iletin." });
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setMsg(null); setPw(""); }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
      >
        <KeyRound className="w-3.5 h-3.5" /> Şifre sıfırla
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 w-full max-w-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-700">{label} — yeni şifre</span>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex gap-2">
        <input
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="En az 8 karakter"
          className="flex-1 h-9 rounded-md border border-slate-200 px-3 text-sm font-mono"
        />
        <button onClick={genPassword} type="button" className="px-2.5 h-9 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white">Üret</button>
        <button
          onClick={submit}
          disabled={saving || pw.length < 8}
          className="px-3 h-9 rounded-md bg-red-600 text-white text-xs font-semibold disabled:bg-slate-300 inline-flex items-center gap-1.5"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Kaydet
        </button>
      </div>
      {msg && (
        <p className={`mt-2 text-xs ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>
      )}
    </div>
  );
}
