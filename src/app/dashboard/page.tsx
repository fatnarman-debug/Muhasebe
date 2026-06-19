import { formatSEK } from "@/lib/utils";
import { FileText, Building2, Users, TrendingUp, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";

const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http");

export default async function DashboardPage() {
  let clientCount = 0, customerCount = 0, paid = 0, open = 0, overdue = 0, draft = 0;

  if (isSupabaseConfigured) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [
      { count: cc },
      { count: cust },
      { data: invoices },
    ] = await Promise.all([
      supabase.from("client_companies").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("is_active", true),
      supabase.from("customers").select("id, client_company_id, client_companies!inner(user_id)", { count: "exact", head: true }).eq("client_companies.user_id", user!.id),
      supabase.from("invoices").select("status, total, amount_due, invoice_date").order("created_at", { ascending: false }).limit(100),
    ]);

    clientCount = cc ?? 0;
    customerCount = cust ?? 0;
    paid = invoices?.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0) ?? 0;
    open = invoices?.filter((i) => i.status === "sent").reduce((s, i) => s + i.amount_due, 0) ?? 0;
    overdue = invoices?.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount_due, 0) ?? 0;
    draft = invoices?.filter((i) => i.status === "draft").length ?? 0;
  }

  const stats = [
    { label: "Klientföretag", value: clientCount, icon: Building2, href: "/dashboard/clients", color: "bg-blue-50 text-blue-600" },
    { label: "Kunder", value: customerCount, icon: Users, href: "/dashboard/customers", color: "bg-indigo-50 text-indigo-600" },
    { label: "Inbetalat (år)", value: formatSEK(paid), icon: TrendingUp, href: "/dashboard/invoices", color: "bg-green-50 text-green-600" },
    { label: "Öppna fordringar", value: formatSEK(open), icon: Clock, href: "/dashboard/invoices?status=sent", color: "bg-yellow-50 text-yellow-600" },
    { label: "Förfallna", value: formatSEK(overdue), icon: AlertCircle, href: "/dashboard/invoices?status=overdue", color: "bg-red-50 text-red-600" },
    { label: "Utkast", value: draft, icon: FileText, href: "/dashboard/invoices?status=draft", color: "bg-gray-50 text-gray-600" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Översikt</h1>
        <p className="text-gray-500 text-sm mt-1">Välkommen tillbaka</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Snabbåtgärder</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/invoices/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
            <FileText className="w-4 h-4" /> Ny faktura
          </Link>
          <Link href="/dashboard/clients/new" className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
            <Building2 className="w-4 h-4" /> Nytt klientföretag
          </Link>
          <Link href="/dashboard/customers" className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
            <Users className="w-4 h-4" /> Lägg till kund
          </Link>
        </div>
      </div>
    </div>
  );
}
