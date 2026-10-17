import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { FileText } from "lucide-react";
import { getAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  draft: { label: "Taslak", tone: "bg-slate-100 text-slate-600" },
  sent: { label: "Gönderildi", tone: "bg-blue-100 text-blue-700" },
  paid: { label: "Ödendi", tone: "bg-emerald-100 text-emerald-700" },
  overdue: { label: "Gecikmiş", tone: "bg-amber-100 text-amber-700" },
  cancelled: { label: "İptal", tone: "bg-slate-100 text-slate-500" },
  credit: { label: "Kredi", tone: "bg-purple-100 text-purple-700" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(n ?? 0);
}

export default async function AdminInvoicesPage() {
  if (!(await getAdminSession())) redirect("/admin/login");

  const supabase = adminClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, status, total, invoice_date, client_company_id")
    .order("invoice_date", { ascending: false })
    .limit(200);

  const rows = invoices ?? [];

  const companyIds = [...new Set(rows.map((i) => i.client_company_id).filter(Boolean))];
  const { data: companies } = companyIds.length
    ? await supabase.from("client_companies").select("id, name").in("id", companyIds)
    : { data: [] };
  const companyById = new Map((companies ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faturalar</h1>
          <p className="text-sm text-slate-500">Son 200 fatura.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Fatura no", "Şirket", "Tutar", "Durum", "Tarih"].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Henüz fatura yok.</td></tr>
            ) : rows.map((inv) => {
              const st = STATUS_LABELS[inv.status] ?? { label: inv.status ?? "—", tone: "bg-slate-100 text-slate-600" };
              return (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-900">{inv.invoice_number}</td>
                  <td className="px-5 py-3 text-slate-600">{companyById.get(inv.client_company_id) ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-700 font-medium">{fmt(Number(inv.total))}</td>
                  <td className="px-5 py-3">
                    <span className={st.tone + " inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"}>{st.label}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString("sv-SE") : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
