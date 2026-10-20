"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, Check, X, AlertTriangle } from "lucide-react";

/** Bjuder in en ny anvandare. Losenordet satts av anvandaren sjalv via
    inbjudningsmailet – det passerar aldrig administratoren. */
export function AdminAddUser() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<"privat" | "buro">("privat");
  const [free, setFree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  function reset() {
    setEmail(""); setFullName(""); setAccountType("privat"); setFree(true);
    setError(null); setWarning(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setWarning(null); setDone(null);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, full_name: fullName, account_type: accountType, free }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok && res.status !== 207) {
      setError(data.error ?? "Bir hata oluştu.");
      return;
    }
    if (data.warning) setWarning(data.warning);
    setDone(email);
    reset();
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => { setOpen(true); setDone(null); }}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Kullanıcı ekle
        </button>

        {done && (
          <div className="flex items-start gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5">
            <Check className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              <strong>{done}</strong> adresine davet gönderildi. Kullanıcı maildeki linkten
              kendi şifresini belirleyecek.
            </span>
          </div>
        )}
        {warning && (
          <div className="flex items-start gap-2 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{warning}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 max-w-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Yeni kullanıcı
        </h3>
        <button type="button" onClick={() => { setOpen(false); reset(); }} aria-label="Kapat"
          className="text-slate-400 hover:text-slate-700 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="au-name" className="block text-sm font-medium text-slate-700 mb-1">Ad soyad</label>
          <input id="au-name" value={fullName} onChange={(e) => setFullName(e.target.value)}
            required minLength={2} autoComplete="off"
            className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400" />
        </div>

        <div>
          <label htmlFor="au-email" className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
          <input id="au-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required autoComplete="off" placeholder="arkadas@example.com"
            className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400" />
          <p className="text-xs text-slate-500 mt-1">Davet bu adrese gönderilir.</p>
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-slate-700 mb-1">Hesap tipi</legend>
          <div className="grid grid-cols-2 gap-2">
            {([
              { v: "privat", t: "Bireysel", d: "Tek şirket" },
              { v: "buro", t: "Büro", d: "Çoklu konsült" },
            ] as const).map((o) => (
              <label key={o.v}
                className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${accountType === o.v ? "bg-blue-50 border-blue-300" : "border-slate-200 hover:border-slate-300"}`}>
                <input type="radio" name="account_type" value={o.v} checked={accountType === o.v}
                  onChange={() => setAccountType(o.v)} className="accent-blue-600 mt-0.5" />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{o.t}</span>
                  <span className="block text-xs text-slate-500">{o.d}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
          <input type="checkbox" checked={free} onChange={(e) => setFree(e.target.checked)}
            className="accent-emerald-600 mt-0.5" />
          <span>
            <span className="block text-sm font-semibold text-slate-900">Ücretsiz erişim</span>
            <span className="block text-xs text-slate-500">
              Süresiz açık. Hesap <code className="font-mono">plan=free</code> olarak işaretlenir,
              böylece ileride ödeyen müşterilerle karışmaz.
            </span>
          </span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">{error}</p>
      )}

      <button type="submit" disabled={loading}
        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor…</> : <>Davet gönder</>}
      </button>
    </form>
  );
}
