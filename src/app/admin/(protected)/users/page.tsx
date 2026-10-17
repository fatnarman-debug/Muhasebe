import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Users, ChevronRight } from "lucide-react";
import { getAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  trialing: { label: "Deneme", tone: "bg-blue-100 text-blue-700" },
  active: { label: "Aktif", tone: "bg-emerald-100 text-emerald-700" },
  past_due: { label: "Gecikmiş", tone: "bg-amber-100 text-amber-700" },
  canceled: { label: "İptal", tone: "bg-slate-100 text-slate-600" },
  expired: { label: "Süresi doldu", tone: "bg-red-100 text-red-700" },
};

export default async function AdminUsersPage() {
  if (!(await getAdminSession())) redirect("/admin/login");

  const supabase = adminClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, account_type, subscription_status, subscription_tier, created_at")
    .order("created_at", { ascending: false });

  const rows = users ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kullanıcılar</h1>
          <p className="text-sm text-slate-500">Tüm kayıtlı kullanıcılar ({rows.length}).</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Kullanıcı", "Tip", "Abonelik", "Plan", "Kayıt", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Henüz kullanıcı yok.</td></tr>
            ) : rows.map((u) => {
              const st = STATUS_LABELS[u.subscription_status] ?? { label: u.subscription_status ?? "—", tone: "bg-slate-100 text-slate-600" };
              return (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-900">{u.full_name || "—"}</div>
                    <div className="text-xs text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={(u.account_type === "buro" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600") + " inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"}>
                      {u.account_type === "buro" ? "Büro" : "Bireysel"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={st.tone + " inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"}>{st.label}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{u.subscription_tier ?? "free"}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString("sv-SE") : "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/users/${u.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700">
                      Detay <ChevronRight className="w-4 h-4" />
                    </Link>
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
