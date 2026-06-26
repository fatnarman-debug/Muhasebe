"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Snowflake, Sun, Trash2, Loader2, X, AlertTriangle, ShieldAlert } from "lucide-react";
import { freezeAccount, unfreezeAccount, deleteAccount } from "@/lib/admin-account-actions";

type Props = {
  userId: string;
  email: string;
  isFrozen: boolean;
  frozenReason?: string | null;
  /** Silme sonrası yönlendirme (varsayılan: /admin/buros) */
  redirectAfterDelete?: string;
};

export function AccountLifecycleControls({ userId, email, isFrozen, frozenReason, redirectAfterDelete = "/admin/buros" }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<null | "freeze" | "delete">(null);
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);

  async function doFreeze() {
    setBusy(true); setMsg(null);
    const res = await freezeAccount(userId, reason.trim());
    setBusy(false);
    if ("error" in res) { setMsg({ ok: false, text: res.error }); return; }
    setModal(null); setReason("");
    router.refresh();
  }

  async function doUnfreeze() {
    setBusy(true); setMsg(null);
    const res = await unfreezeAccount(userId);
    setBusy(false);
    if ("error" in res) { setMsg({ ok: false, text: res.error }); return; }
    router.refresh();
  }

  async function doDelete() {
    setBusy(true); setMsg(null);
    const res = await deleteAccount(userId, confirm.trim());
    setBusy(false);
    if ("error" in res) { setMsg({ ok: false, text: res.error }); return; }
    router.push(redirectAfterDelete);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Durum + butonlar */}
      <div className="flex items-center gap-2">
        {isFrozen ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200">
            <Snowflake className="w-3 h-3" /> Donduruldu
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
            Aktif
          </span>
        )}

        {isFrozen ? (
          <button
            onClick={doUnfreeze}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sun className="w-3.5 h-3.5" />} Aktifleştir
          </button>
        ) : (
          <button
            onClick={() => { setModal("freeze"); setMsg(null); setReason(""); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 text-xs font-medium text-orange-700 hover:bg-orange-50 transition-colors"
          >
            <Snowflake className="w-3.5 h-3.5" /> Dondur
          </button>
        )}

        <button
          onClick={() => { setModal("delete"); setMsg(null); setConfirm(""); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Sil
        </button>
      </div>

      {isFrozen && frozenReason && (
        <p className="text-[11px] text-orange-600 max-w-xs text-right">Sebep: {frozenReason}</p>
      )}

      {/* Dondurma modalı */}
      {modal === "freeze" && (
        <Modal onClose={() => setModal(null)} accent="orange"
          icon={<Snowflake className="w-5 h-5 text-orange-600" />}
          title={`${email} dondurulsun mu?`}>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Giriş <strong>engellenir</strong>, veri <strong>silinmez</strong> (Bokföringslagen — 7 yıl saklama).
            Büro hesabıysa muhasebecilerin girişi de kapatılır. İstediğin zaman geri açabilirsin.
          </p>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Sebep (audit'e kaydedilir)</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="ör. Ödeme yapılmadı"
            className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm mb-3"
          />
          {msg && <p className={`text-xs mb-2 ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setModal(null)} className="px-3 h-9 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Vazgeç</button>
            <button onClick={doFreeze} disabled={busy}
              className="px-4 h-9 rounded-md bg-orange-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Snowflake className="w-3.5 h-3.5" />} Dondur
            </button>
          </div>
        </Modal>
      )}

      {/* Silme modalı */}
      {modal === "delete" && (
        <Modal onClose={() => setModal(null)} accent="red"
          icon={<ShieldAlert className="w-5 h-5 text-red-600" />}
          title={`${email} kalıcı olarak silinsin mi?`}>
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 leading-relaxed">
              Bu işlem <strong>geri alınamaz</strong>. Tüm faturalar, müşteriler ve veriler silinir.
              GDPR/Bokföringslagen gereği muhasebe verisi 7 yıl saklanmalı — silmek yerine genelde
              <strong> Dondur</strong> kullan. Silmeden önce <strong>yedek almanız önerilir</strong> (Faz D).
            </p>
          </div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            Onaylamak için e-postayı yaz: <span className="font-mono text-slate-700 normal-case">{email}</span>
          </label>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={email}
            className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm font-mono mb-3"
          />
          {msg && <p className={`text-xs mb-2 ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setModal(null)} className="px-3 h-9 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Vazgeç</button>
            <button onClick={doDelete} disabled={busy || confirm.trim().toLowerCase() !== email.toLowerCase()}
              className="px-4 h-9 rounded-md bg-red-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:bg-slate-300">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Kalıcı sil
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title, icon, accent }: {
  children: React.ReactNode; onClose: () => void; title: string; icon: React.ReactNode; accent: "orange" | "red";
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className={`h-1 ${accent === "red" ? "bg-red-500" : "bg-orange-500"}`} />
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent === "red" ? "bg-red-50" : "bg-orange-50"}`}>
              {icon}
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug pt-1">{title}</h3>
            <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
