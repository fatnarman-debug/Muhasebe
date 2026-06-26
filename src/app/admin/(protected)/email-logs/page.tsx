import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { getAdminSession } from "@/lib/admin-session";
import { fetchEmailLogs } from "@/lib/app-logs";

export const dynamic = "force-dynamic";

export default async function AdminEmailLogsPage() {
  if (!(await getAdminSession())) redirect("/admin/login");
  const logs = await fetchEmailLogs(200);

  const sent = logs.filter((l) => l.status === "sent").length;
  const failed = logs.length - sent;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">E-posta Logları</h1>
          <p className="text-sm text-slate-500">
            Gönderilen fatura ve hatırlatma e-postaları · {sent} başarılı · {failed} başarısız (son {logs.length}).
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Tarih", "Tür", "Durum", "Alıcı", "Fatura", "Firma", "Hata"].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">Henüz e-posta kaydı yok.</td></tr>
            ) : logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50 transition-colors align-top">
                <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{new Date(l.created_at).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" })}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ring-1 ring-inset ${l.kind === "reminder" ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-sky-50 text-sky-700 ring-sky-200"}`}>
                    {l.kind === "reminder" ? "Hatırlatma" : "Fatura"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ring-1 ring-inset ${l.status === "sent" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
                    {l.status === "sent" ? "Gönderildi" : "Başarısız"}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{l.to_email ?? "—"}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{l.invoice_number ?? "—"}</td>
                <td className="px-5 py-3 text-slate-600">{l.company_name ?? "—"}</td>
                <td className="px-5 py-3 text-xs text-red-600 max-w-[220px] break-words">{l.error_message ?? <span className="text-slate-300">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
