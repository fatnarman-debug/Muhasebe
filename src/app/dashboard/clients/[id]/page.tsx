import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, FileText, CheckCircle2, Building2 } from "lucide-react";
import { formatSEK, formatDate, getInvoiceStatusLabel, getInvoiceStatusColor } from "@/lib/utils";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: client }, { data: invoices }, { data: customers }] = await Promise.all([
    supabase.from("client_companies").select("*").eq("id", id).single(),
    supabase.from("invoices").select("*, customers(name)").eq("client_company_id", id).order("created_at", { ascending: false }).limit(20),
    supabase.from("customers").select("*").eq("client_company_id", id).eq("is_active", true),
  ]);

  if (!client) notFound();

  const totalPaid = invoices?.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0) ?? 0;
  const totalOpen = invoices?.filter((i) => ["sent", "overdue"].includes(i.status)).reduce((s, i) => s + i.amount_due, 0) ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              {client.f_skatt && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                  <CheckCircle2 className="w-3 h-3" /> F-skatt
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm">Org.nr: {client.org_no} {client.moms_no ? `• Moms: ${client.moms_no}` : ""}</p>
          </div>
        </div>
        <Link href={`/dashboard/clients/${id}/edit`}>
          <Button variant="outline" className="gap-2"><Edit className="w-4 h-4" /> Redigera</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Inbetalat totalt</p>
          <p className="text-xl font-bold text-green-600">{formatSEK(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Öppna fordringar</p>
          <p className="text-xl font-bold text-yellow-600">{formatSEK(totalOpen)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Antal kunder</p>
          <p className="text-xl font-bold text-gray-900">{customers?.length ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Company info */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Företagsuppgifter</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400">Adress</span><br /><span className="text-gray-700">{client.address_line1}<br />{client.postal_code} {client.city}</span></div>
              {client.email && <div><span className="text-gray-400">E-post</span><br /><span className="text-gray-700">{client.email}</span></div>}
              {client.phone && <div><span className="text-gray-400">Telefon</span><br /><span className="text-gray-700">{client.phone}</span></div>}
              {client.bankgiro && <div><span className="text-gray-400">Bankgiro</span><br /><span className="text-gray-700">{client.bankgiro}</span></div>}
              {client.swish && <div><span className="text-gray-400">Swish</span><br /><span className="text-gray-700">{client.swish}</span></div>}
              <div><span className="text-gray-400">Betalningsvillkor</span><br /><span className="text-gray-700">{client.payment_terms_days} dagar</span></div>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Senaste fakturor</h2>
            <Link href={`/dashboard/invoices/new?client=${id}`}>
              <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Ny faktura</Button>
            </Link>
          </div>

          {!invoices?.length ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Inga fakturor ännu</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Faktura</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Kund</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Datum</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Belopp</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/invoices/${inv.id}`} className="font-medium text-blue-600 hover:underline">
                          #{inv.invoice_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{(inv.customers as { name: string } | null)?.name}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(inv.invoice_date)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{formatSEK(inv.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getInvoiceStatusColor(inv.status)}`}>
                          {getInvoiceStatusLabel(inv.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
