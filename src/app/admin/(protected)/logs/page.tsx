import { redirect } from "next/navigation";
import { ScrollText } from "lucide-react";
import { getAdminSession } from "@/lib/admin-session";
import { fetchAuditLogs } from "@/lib/admin-audit";

export const dynamic = "force-dynamic";

// İşlem kodu -> Türkçe etiket + renk
const ACTION_LABELS: Record<string, { label: string; tone: string }> = {
  "user.password_reset":       { label: "Şifre sıfırlandı",        tone: "bg-amber-50 text-amber-700 ring-amber-200" },
  "accountant.activated":      { label: "Muhasebeci aktifleştirildi", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  "accountant.deactivated":    { label: "Muhasebeci pasifleştirildi", tone: "bg-slate-100 text-slate-600 ring-slate-200" },
  "account.frozen":            { label: "Hesap donduruldu",        tone: "bg-orange-50 text-orange-700 ring-orange-200" },
  "account.unfrozen":          { label: "Hesap aktifleştirildi",   tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  "account.deleted":           { label: "Hesap silindi",           tone: "bg-red-50 text-red-700 ring-red-200" },
  "data.export":               { label: "Yedek alındı",            tone: "bg-sky-50 text-sky-700 ring-sky-200" },
  "data.restore":              { label: "Yedek geri yüklendi",     tone: "bg-indigo-50 text-indigo-700 ring-indigo-200" },
  "data.backup_deleted":       { label: "Yedek silindi",           tone: "bg-slate-100 text-slate-600 ring-slate-200" },
};

const TARGET_LABELS: Record<string, string> = {
  user: "Kullanıcı",
  muhasebeci: "Muhasebeci",
  client_company: "Müşteri firma",
  buro: "Büro",
};

function actionMeta(action: string) {
  return ACTION_LABELS[action] ?? { label: action, tone: "bg-slate-100 text-slate-600 ring-slate-200" };
}

export default async function AdminLogsPage() {
  if (!(await getAdminSession())) redirect("/admin/login");

  const logs = await fetchAuditLogs({ limit: 200 });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
          <ScrollText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">İşlem Günlüğü</h1>
          <p className="text-sm text-slate-500">
            Tüm hassas admin işlemleri burada iz bırakır (GDPR hesap verebilirlik). Son {logs.length} kayıt.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Tarih", "İşlem", "Hedef", "Yapan", "IP", "Detay"].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Henüz kayıt yok. İlk admin işlemiyle birlikte günlük dolmaya başlar.</td></tr>
            ) : logs.map((l) => {
              const meta = actionMeta(l.action);
              const hasMeta = l.metadata && Object.keys(l.metadata).length > 0;
              return (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors align-top">
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.tone}`}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-700">
                    {l.target_type ? (
                      <div>
                        <span className="text-xs text-slate-400">{TARGET_LABELS[l.target_type] ?? l.target_type}</span>
                        <div className="font-medium text-slate-800">{l.target_label ?? <code className="text-xs text-slate-400">{l.target_id}</code>}</div>
                      </div>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{l.actor_email}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">{l.ip ?? "—"}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 max-w-[260px]">
                    {hasMeta ? <code className="break-words">{JSON.stringify(l.metadata)}</code> : <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
