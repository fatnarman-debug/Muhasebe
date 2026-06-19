import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSEK, formatDate, getInvoiceStatusLabel, getInvoiceStatusColor } from "@/lib/utils";

const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http");

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; customer?: string }>;
}) {
  const { status, customer } = await searchParams;

  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Fakturor</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          Anslut Supabase för att visa fakturor.
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: companies } = await supabase
    .from("client_companies")
    .select("id")
    .eq("user_id", user!.id);

  const companyIds = companies?.map((c) => c.id) ?? [];

  let query = supabase
    .from("invoices")
    .select("*, customers(name), client_companies(name)")
    .in("client_company_id", companyIds)
    .order("invoice_date", { ascending: false });

  if (status) query = query.eq("status", status);
  if (customer) query = query.eq("customer_id", customer);

  const { data: invoices } = await query;

  const statuses = ["draft", "sent", "paid", "overdue", "cancelled"];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fakturor</h1>
          <p className="text-gray-500 text-sm mt-1">{invoices?.length ?? 0} fakturor</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button className="gap-2"><Plus className="w-4 h-4" /> Ny faktura</Button>
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/dashboard/invoices"
          className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${!status ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Alla
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/dashboard/invoices?status=${s}`}
            className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${status === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {getInvoiceStatusLabel(s)}
          </Link>
        ))}
      </div>

      {!invoices?.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Inga fakturor{status ? ` med status "${getInvoiceStatusLabel(status)}"` : " ännu"}</h3>
          <p className="text-gray-500 text-sm mb-6">Skapa din första faktura för att komma igång.</p>
          <Link href="/dashboard/invoices/new">
            <Button className="gap-2"><Plus className="w-4 h-4" /> Skapa faktura</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Faktura</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kund</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Datum</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Förfall</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Belopp</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => {
                const cust = inv.customers as unknown as { name: string } | null;
                const comp = inv.client_companies as unknown as { name: string } | null;
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/dashboard/invoices/${inv.id}`} className="font-medium text-gray-900 hover:text-blue-600 font-mono">
                        {inv.invoice_number}
                      </Link>
                      {comp && <p className="text-xs text-gray-400">{comp.name}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{cust?.name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(inv.invoice_date)}</td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(inv.due_date)}</td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums">{formatSEK(inv.total)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getInvoiceStatusColor(inv.status)}`}>
                        {getInvoiceStatusLabel(inv.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
