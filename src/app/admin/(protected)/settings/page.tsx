import { redirect } from "next/navigation";
import { Settings, Shield, Database, Mail } from "lucide-react";
import { getAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const rows = [
    { icon: Shield, label: "Giriş yapan admin", value: session ?? "—" },
    { icon: Database, label: "Veritabanı", value: "Self-hosted Supabase (api.enkeltfaktura.com)" },
    { icon: Mail, label: "E-posta sağlayıcı", value: "Resend (send.enkeltfaktura.com)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
          <p className="text-sm text-slate-500">Sistem bilgileri ve admin durumu.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-4 px-5 py-4">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <r.icon className="w-4 h-4 text-slate-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{r.label}</div>
              <div className="text-sm text-slate-900 font-medium truncate">{r.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        Not: Admin şifresi ve diğer gizli ayarlar Coolify ortam değişkenlerinden yönetilir, bu panelden değiştirilmez.
      </div>
    </div>
  );
}
