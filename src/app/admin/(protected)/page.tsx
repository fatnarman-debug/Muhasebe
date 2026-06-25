import { createClient } from "@supabase/supabase-js";
import { Users, Building2, FileText, TrendingUp } from "lucide-react";
import { formatSEK } from "@/lib/utils";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function AdminDashboardPage() {
  const supabase = adminClient();

  const [
    { count: userCount },
    { count: companyCount },
    { count: invoiceCount },
    { data: invoiceTotals },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("client_companies").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("invoices").select("*", { count: "exact", head: true }),
    supabase.from("invoices").select("total, status"),
    supabase.from("profiles").select("id, email, full_name, plan_type, created_at").order("created_at", { ascending: false }).limit(10),
  ]);

  const totalRevenue = (invoiceTotals ?? []).filter(i => i.status === "paid").reduce((s, i) => s + (i.total ?? 0), 0);
  const statusCounts = (invoiceTotals ?? []).reduce((acc: Record<string, number>, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Genel Bakış</h1>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Toplam Kullanıcı", value: userCount ?? 0, Icon: Users, bg: "bg-blue-50", text: "text-blue-600" },
          { label: "Aktif Şirket", value: companyCount ?? 0, Icon: Building2, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: "Toplam Fatura", value: invoiceCount ?? 0, Icon: FileText, bg: "bg-violet-50", text: "text-violet-600" },
          { label: "Toplam Ciro", value: formatSEK(totalRevenue), Icon: TrendingUp, bg: "bg-amber-50", text: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={s.bg + " " + s.text + " w-11 h-11 rounded-xl flex items-center justify-center"}>
              <s.Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { key: "paid", label: "Ödendi", bg: "bg-emerald-50", text: "text-emerald-600" },
          { key: "sent", label: "Gönderildi", bg: "bg-blue-50", text: "text-blue-600" },
          { key: "overdue", label: "Gecikmiş", bg: "bg-red-50", text: "text-red-600" },
        ].map((s) => (
          <div key={s.key} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
            <div className={s.text + " text-3xl font-black"}>{statusCounts[s.key] ?? 0}</div>
            <div className={s.bg + " " + s.text + " inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold"}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 text-sm">Son Kayıt Olan Kullanıcılar</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kullanıcı</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kayıt Tarihi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(recentUsers ?? []).map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="font-medium text-slate-900">{u.full_name || "İsimsiz"}</div>
                  <div className="text-xs text-slate-400">{u.email}</div>
                </td>
                <td className="px-5 py-3">
                  <span className={(u.plan_type === "accountant" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600") + " inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"}>
                    {u.plan_type === "accountant" ? "Muhasebeci" : "Bireysel"}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-slate-500">
                  {new Date(u.created_at).toLocaleDateString("tr-TR")}
                </td>
              </tr>
            ))}
            {!recentUsers?.length && (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-400 text-sm">Henüz kullanıcı yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
