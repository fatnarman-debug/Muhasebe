import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList } from "lucide-react";
import { formatSEK, formatDate } from "@/lib/utils";

const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http");

const STATUS: Record<string, [string, string]> = {
  draft:     ["bg-gray-100 text-gray-600", "Utkast"],
  sent:      ["bg-indigo-50 text-indigo-700", "Skickad"],
  accepted:  ["bg-emerald-50 text-emerald-700", "Accepterad"],
  declined:  ["bg-red-50 text-red-700", "Avvisad"],
};

export default async function TekliflerPage() {
  if (!isSupabaseConfigured) {
    return <div className="max-w-7xl mx-auto p-4 text-gray-400">Anslut Supabase för att visa offerter.</div>;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: companies } = await supabase.from("client_companies").select("id").eq("user_id", user!.id);
  const companyIds = companies?.map((c) => c.id) ?? [];

  const { data: offers } = companyIds.length
    ? await supabase
        .from("invoices")
        .select("id, invoice_number, invoice_date, due_date, total, status, customers(name), client_companies(name)")
        .in("client_company_id", companyIds)
        .eq("doc_type", "offert")
        .order("invoice_date", { ascending: false })
    : { data: [] };

  const list = (offers ?? []) as unknown as Array<{
    id: string; invoice_number: string; invoice_date: string; due_date: string; total: number; status: string;
    customers: { name: string } | null; client_companies: { name: string } | null;
  }>;

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offerter</h1>
          <p className="text-gray-500 text-sm mt-0.5">{list.length} offerter</p>
        </div>
        <Link href="/dashboard/invoices/new?type=offert">
          <Button className="gap-2"><Plus className="w-4 h-4" /> Ny offert</Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Inga offerter ännu</h3>
          <p className="text-gray-500 text-sm mb-6">Skapa en offert som kan omvandlas till faktura när kunden accepterar.</p>
          <Link href="/dashboard/invoices/new?type=offert">
            <Button className="gap-2"><Plus className="w-4 h-4" /> Skapa offert</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Offertnr", "Kund", "Giltigt t.o.m.", "Status", "Belopp"].map((h) => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === "Belopp" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((o) => {
                const [cls, label] = STATUS[o.status] ?? ["bg-gray-100 text-gray-600", o.status];
                return (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/invoices/${o.id}`} className="font-mono font-medium text-gray-900 hover:text-blue-600">{o.invoice_number}</Link>
                      {o.client_companies && <p className="text-xs text-gray-400">{o.client_companies.name}</p>}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{o.customers?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(o.due_date)}</td>
                    <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span></td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">{formatSEK(o.total)}</td>
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
