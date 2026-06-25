import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Building2, ChevronRight } from "lucide-react";
import { getAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function AdminBurosPage() {
  if (!(await getAdminSession())) redirect("/admin/login");

  const supabase = adminClient();

  const [{ data: dukkanlar }, { data: muhasebeciler }, { data: companies }, { data: invoices }] = await Promise.all([
    supabase.from("muhasebe_dukkanlar").select("id, dukkan_adi, user_id, created_at").order("created_at", { ascending: true }),
    supabase.from("muhasebeciler").select("id, dukkan_id"),
    supabase.from("client_companies").select("id, user_id"),
    supabase.from("invoices").select("client_company_id"),
  ]);

  const ownerIds = [...new Set((dukkanlar ?? []).map((d) => d.user_id))];
  const { data: owners } = ownerIds.length
    ? await supabase.from("profiles").select("id, email, full_name").in("id", ownerIds)
    : { data: [] };

  const ownerById = new Map((owners ?? []).map((o) => [o.id, o]));
  const companyOwner = new Map((companies ?? []).map((c) => [c.id, c.user_id]));

  const muhasebeciByDukkan: Record<string, number> = {};
  for (const m of muhasebeciler ?? []) muhasebeciByDukkan[m.dukkan_id] = (muhasebeciByDukkan[m.dukkan_id] ?? 0) + 1;

  const musteriByOwner: Record<string, number> = {};
  for (const c of companies ?? []) musteriByOwner[c.user_id] = (musteriByOwner[c.user_id] ?? 0) + 1;

  const faturaByOwner: Record<string, number> = {};
  for (const inv of invoices ?? []) {
    const owner = companyOwner.get(inv.client_company_id);
    if (owner) faturaByOwner[owner] = (faturaByOwner[owner] ?? 0) + 1;
  }

  const rows = (dukkanlar ?? []).map((d) => {
    const owner = ownerById.get(d.user_id);
    return {
      id: d.id,
      dukkan_adi: d.dukkan_adi,
      owner_email: owner?.email ?? "—",
      owner_name: owner?.full_name ?? "",
      muhasebeci: muhasebeciByDukkan[d.id] ?? 0,
      musteri: musteriByOwner[d.user_id] ?? 0,
      fatura: faturaByOwner[d.user_id] ?? 0,
      created_at: d.created_at,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bürolar</h1>
          <p className="text-sm text-slate-500">Tüm muhasebe büroları ve durumları — destek için.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Büro", "Yetkili (e-posta)", "Muhasebeci", "Müşteri", "Fatura", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Henüz büro yok.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="font-semibold text-slate-900">{r.dukkan_adi}</div>
                  <div className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString("sv-SE")}</div>
                </td>
                <td className="px-5 py-3 text-slate-600">{r.owner_email}</td>
                <td className="px-5 py-3 text-slate-700 font-medium">{r.muhasebeci}</td>
                <td className="px-5 py-3 text-slate-700 font-medium">{r.musteri}</td>
                <td className="px-5 py-3 text-slate-700 font-medium">{r.fatura}</td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/admin/buros/${r.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700">
                    Detay <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
