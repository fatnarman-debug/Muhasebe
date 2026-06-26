"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload, Loader2, ShieldCheck, AlertTriangle, X } from "lucide-react";
import { exportBuroData, restoreBuroData } from "@/lib/admin-backup-actions";

type Counts = { companies: number; customers: number; articles: number; invoices: number; lines: number; payments: number };

export function BackupControls({ userId, email }: { userId: string; email: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"" | "export" | "restore">("");
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  const [pending, setPending] = useState<{ b64: string; name: string } | null>(null);

  async function doExport() {
    setBusy("export"); setMsg(null);
    const res = await exportBuroData(userId);
    setBusy("");
    if ("error" in res) { setMsg({ ok: false, text: res.error }); return; }
    // Şifreli base64'ü dosya olarak indir
    const blob = new Blob([res.dataB64], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = res.filename; a.click();
    URL.revokeObjectURL(url);
    const c = res.counts;
    setMsg({ ok: true, text: `Yedek indirildi: ${c.companies} firma · ${c.invoices} fatura · ${c.customers} müşteri.` });
  }

  function pickFile() { fileRef.current?.click(); }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // aynı dosya tekrar seçilebilsin
    if (!file) return;
    const text = (await file.text()).trim();
    setPending({ b64: text, name: file.name });
    setMsg(null);
  }

  async function confirmRestore() {
    if (!pending) return;
    setBusy("restore"); setMsg(null);
    const res = await restoreBuroData(userId, pending.b64);
    setBusy("");
    setPending(null);
    if ("error" in res) { setMsg({ ok: false, text: res.error }); return; }
    const c: Counts = res.counts;
    setMsg({ ok: true, text: `Geri yüklendi: ${c.companies} firma · ${c.invoices} fatura · ${c.lines} satır · ${c.payments} ödeme.` });
    router.refresh();
  }

  return (
    <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-700">Yedekleme &amp; Geri Yükleme</h2>
      </div>
      <div className="p-5 space-y-3">
        <p className="text-xs text-slate-500 leading-relaxed">
          Yedek <strong>şifreli</strong> (AES-256-GCM) bir dosya olarak iner; muhasebe geçmişi (tarihler) korunur.
          Hesabı dondurmadan/silmeden önce yedek al. Dönen müşteride aynı dosyayı bu hesaba geri yükle.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={doExport} disabled={busy !== ""}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50">
            {busy === "export" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} Yedekle (şifreli indir)
          </button>
          <button onClick={pickFile} disabled={busy !== ""}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50">
            <Upload className="w-3.5 h-3.5" /> Geri Yükle (.fktbak)
          </button>
          <input ref={fileRef} type="file" accept=".fktbak,application/octet-stream,text/plain" onChange={onFile} className="hidden" />
        </div>
        {msg && <p className={`text-xs ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</p>}
      </div>

      {/* Geri yükleme onay modalı */}
      {pending && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPending(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-1 bg-indigo-500" />
            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug pt-1">Yedek geri yüklensin mi?</h3>
                <button onClick={() => setPending(null)} className="ml-auto text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 p-3 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  <span className="font-mono">{pending.name}</span> dosyasındaki tüm firma/müşteri/fatura verisi
                  <strong> {email}</strong> hesabının altına <strong>yeni kayıtlar</strong> olarak eklenir.
                  Bu hesapta zaten veri varsa <strong>çoğaltma</strong> olabilir — genelde boş/yeni hesaba yükle.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setPending(null)} className="px-3 h-9 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Vazgeç</button>
                <button onClick={confirmRestore} disabled={busy === "restore"}
                  className="px-4 h-9 rounded-md bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50">
                  {busy === "restore" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Geri yükle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
