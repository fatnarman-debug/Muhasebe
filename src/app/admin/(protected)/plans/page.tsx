import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Tag, ChevronRight } from "lucide-react";
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

export default async function AdminPlansPage() {
  if (!(await getAdminSession())) redirect("/admin/login");

  const supabase = adminClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, subscription_tier, subscription_status, created_at")
    .order("created_at", { ascending: false });

  const rows = users ?? [];

  const tierCount: Record<string, number> = {};
  const statusCount: Record<string, number> = {};
  for (const u of rows) {
    tierCount[u.subscription_tier ?? "free"] = (tierCount[u.subscription_tier ?? "free"] ?? 0) + 1;
    statusCount[u.subscription_status ?? "—"] = (statusCount[u.subscription_status ?? "—"] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
          <Tag className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plan Yönetimi</h1>
          <p className="text-sm text-slate-500">Abonelik planları ve durum dağılımı.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(tierCount).map(([tier, n]) => (
          <div key={tier} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{tier}</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{n}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCount).map(([status, n]) => {
          const st = STATUS_LABELS[status] ?? { label: status, tone: "bg-slate-100 text-slate-600" };
          return (
            <span key={status} className={st.tone + " inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"}>
              {st.label}: {n}
            </span>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Kullanıcı", "Plan", "Durum", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">Henüz kullanıcı yok.</td></tr>
            ) : rows.map((u) => {
              const st = STATUS_LABELS[u.subscription_status] ?? { label: u.subscription_status ?? "—", tone: "bg-slate-100 text-slate-600" };
              return (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-900">{u.full_name || "—"}</div>
                    <div className="text-xs text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-medium">{u.subscription_tier ?? "free"}</td>
                  <td className="px-5 py-3">
                    <span className={st.tone + " inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"}>{st.label}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/users/${u.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700">
                      Yönet <ChevronRight className="w-4 h-4" />
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
