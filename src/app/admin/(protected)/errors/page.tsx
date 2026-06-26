import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { getAdminSession } from "@/lib/admin-session";
import { fetchErrorLogs } from "@/lib/app-logs";

export const dynamic = "force-dynamic";

export default async function AdminErrorsPage() {
  if (!(await getAdminSession())) redirect("/admin/login");
  const logs = await fetchErrorLogs(200);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hata Logları</h1>
          <p className="text-sm text-slate-500">Sunucuda yakalanan uygulama hataları (son {logs.length}).</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Tarih", "Kapsam", "Mesaj", "Kullanıcı", "Detay"].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Hata kaydı yok — iyi haber. 🎉</td></tr>
            ) : logs.map((l) => {
              const hasDetail = l.detail && Object.keys(l.detail).length > 0;
              return (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors align-top">
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{new Date(l.created_at).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="px-5 py-3">
                    <code className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">{l.scope}</code>
                  </td>
                  <td className="px-5 py-3 text-red-700 max-w-[360px] break-words">{l.message}</td>
                  <td className="px-5 py-3 text-xs text-slate-400 font-mono whitespace-nowrap">{l.user_id ?? "—"}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 max-w-[220px]">
                    {hasDetail ? <code className="break-words">{JSON.stringify(l.detail)}</code> : <span className="text-slate-300">—</span>}
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
