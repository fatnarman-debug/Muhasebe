import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Building2 } from "lucide-react";
import { getAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function AdminCompaniesPage() {
  if (!(await getAdminSession())) redirect("/admin/login");

  const supabase = adminClient();

  const [{ data: companies }, { data: invoices }] = await Promise.all([
    supabase
      .from("client_companies")
      .select("id, name, org_no, city, user_id, is_active, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("invoices").select("client_company_id"),
  ]);

  const rows = companies ?? [];

  const ownerIds = [...new Set(rows.map((c) => c.user_id).filter(Boolean))];
  const { data: owners } = ownerIds.length
    ? await supabase.from("profiles").select("id, email, full_name").in("id", ownerIds)
    : { data: [] };
  const ownerById = new Map((owners ?? []).map((o) => [o.id, o]));

  const invoiceByCompany: Record<string, number> = {};
  for (const inv of invoices ?? []) {
    invoiceByCompany[inv.client_company_id] = (invoiceByCompany[inv.client_company_id] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Şirketler</h1>
          <p className="text-sm text-slate-500">Tüm fatura kesen şirketler ({rows.length}).</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Şirket", "Org.nr", "Şehir", "Sahip", "Fatura", "Durum"].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Henüz şirket yok.</td></tr>
            ) : rows.map((c) => {
              const owner = ownerById.get(c.user_id);
              return (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.created_at ? new Date(c.created_at).toLocaleDateString("sv-SE") : ""}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.org_no || "—"}</td>
                  <td className="px-5 py-3 text-slate-600">{c.city || "—"}</td>
                  <td className="px-5 py-3 text-slate-600 text-xs">{owner?.email ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-700 font-medium">{invoiceByCompany[c.id] ?? 0}</td>
                  <td className="px-5 py-3">
                    <span className={(c.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600") + " inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"}>
                      {c.is_active ? "Aktif" : "Pasif"}
                    </span>
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
