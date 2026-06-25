import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, FileText, Mail, Clock } from "lucide-react";
import { formatSEK, formatDate } from "@/lib/utils";
import { AdminPlanForm } from "@/components/admin/AdminPlanForm";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = adminClient();

  const [{ data: user }, { data: companies }, { data: invoices }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("client_companies").select("id, name, org_number, is_active").eq("user_id", id),
    supabase.from("invoices").select("id, invoice_number, status, total, invoice_date, due_date").in(
      "client_company_id",
      // Will be replaced after companies load — do a separate query below
      ["00000000-0000-0000-0000-000000000000"]
    ).limit(1),
  ]);

  if (!user) notFound();

  const companyIds = companies?.map((c) => c.id) ?? [];

  const { data: userInvoices } = companyIds.length
    ? await supabase
        .from("invoices")
        .select("id, invoice_number, status, total, invoice_date, due_date, client_company_id")
        .in("client_company_id", companyIds)
        .order("invoice_date", { ascending: false })
        .limit(20)
    : { data: [] };

  const STATUS_COLOR: Record<string, string> = {
    draft: "bg-slate-100 text-slate-500",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-700",
    overdue: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-500",
  };
  const STATUS_LABEL: Record<string, string> = { draft: "Taslak", sent: "Gönderildi", paid: "Ödendi", overdue: "Gecikmiş", cancelled: "İptal" };

  const totalInvoiced = userInvoices?.reduce((s, i) => s + (i.total ?? 0), 0) ?? 0;

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kullanıcılar
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-900">{user.full_name || user.email}</span>
      </div>

      {/* Profile Card */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user.full_name || "İsimsiz"}</h2>
              <p className="text-slate-500 text-sm">{user.email}</p>
              <p className="text-slate-400 text-xs mt-1">Kayıt: {new Date(user.created_at).toLocaleDateString("sv-SE")}</p>
            </div>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${user.plan_type === "accountant" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
              {user.plan_type === "accountant" ? "Muhasebeci" : "Bireysel"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900">{companies?.length ?? 0}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Şirket</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900">{userInvoices?.length ?? 0}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Faktura</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900">{formatSEK(totalInvoiced)}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Toplam Ciro</div>
            </div>
          </div>
        </div>

        {/* Plan Change */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-3">Plan Yönetimi</h3>
          <AdminPlanForm userId={id} currentPlan={user.plan_type ?? "individual"} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Companies */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-slate-900 text-sm">Şirketler</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {(companies ?? []).map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-400">{c.org_number || "Org-no yok"}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                  {c.is_active ? "Aktif" : "Pasif"}
                </span>
              </div>
            ))}
            {!companies?.length && <p className="px-5 py-6 text-sm text-slate-400 text-center">Şirket yok</p>}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <h3 className="font-semibold text-slate-900 text-sm mb-3">Destek Araçları</h3>
          <a
            href={`mailto:${user.email}`}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">E-posta Gönder</div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </div>
          </a>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors cursor-default">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">Toplam Faktura</div>
              <div className="text-xs text-slate-500">{userInvoices?.length ?? 0} adet · {formatSEK(totalInvoiced)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors cursor-default">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">Son Giriş</div>
              <div className="text-xs text-slate-500">{user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Bilinmiyor"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-sm">Son Faturalar</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">No</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tarih</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vade</th>
              <th className="text-right px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tutar</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(userInvoices ?? []).map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{inv.invoice_number}</td>
                <td className="px-5 py-3 text-slate-500 text-xs">{formatDate(inv.invoice_date)}</td>
                <td className="px-5 py-3 text-slate-500 text-xs">{formatDate(inv.due_date)}</td>
                <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatSEK(inv.total)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[inv.status] ?? "bg-slate-100 text-slate-500"}`}>
                    {STATUS_LABEL[inv.status] ?? inv.status}
                  </span>
                </td>
              </tr>
            ))}
            {!userInvoices?.length && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">Faktura yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
