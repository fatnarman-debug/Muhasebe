import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSEK, formatDate, getInvoiceStatusLabel, getInvoiceStatusColor } from "@/lib/utils";
import { InvoiceStatusActions } from "@/components/invoices/InvoiceStatusActions";
import type { Customer, ClientCompany, InvoiceLine } from "@/types/database";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: invoice } = await supabase
    .from("invoices")
    .select(`
      *,
      customers(*),
      client_companies(*),
      invoice_lines(*)
    `)
    .eq("id", id)
    .single();

  if (!invoice) notFound();

  const company = invoice.client_companies as unknown as ClientCompany & { user_id: string };
  if (company?.user_id !== user!.id) notFound();

  const customer = invoice.customers as unknown as Customer;
  const lines = (invoice.invoice_lines as unknown as InvoiceLine[])?.sort((a, b) => a.sort_order - b.sort_order) ?? [];

  // VAT breakdown
  const vatByRate: Record<number, number> = {};
  lines.forEach((l) => { vatByRate[l.vat_rate] = (vatByRate[l.vat_rate] ?? 0) + l.vat_amount; });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500">
              <ArrowLeft className="w-4 h-4" /> Fakturor
            </Button>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-mono font-semibold text-gray-900">{invoice.invoice_number}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getInvoiceStatusColor(invoice.status)}`}>
            {getInvoiceStatusLabel(invoice.status)}
          </span>
        </div>
        <div className="flex gap-2">
          <InvoiceStatusActions
            invoiceId={id}
            currentStatus={invoice.status}
            customerEmail={customer?.email}
          />
        </div>
      </div>

      {/* Invoice card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Invoice header */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="h-16 max-w-[200px] object-contain mb-3"
                />
              ) : null}
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{company?.name}</h1>
              {company?.org_no && <p className="text-sm text-gray-500">Org.nr: {company.org_no}</p>}
              {company?.f_skatt && <p className="text-sm text-gray-500">Godkänd för F-skatt</p>}
              {company?.address_line1 && (
                <div className="text-sm text-gray-500 mt-1">
                  <p>{company.address_line1}</p>
                  <p>{company.postal_code} {company.city}</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 mb-1">FAKTURA</p>
              <p className="font-mono text-lg font-semibold text-blue-600">{invoice.invoice_number}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Faktureras till</p>
              <p className="font-semibold text-gray-900">{customer?.name}</p>
              {customer?.address_line1 && (
                <>
                  <p className="text-sm text-gray-600">{customer.address_line1}</p>
                  <p className="text-sm text-gray-600">{customer.postal_code} {customer.city}</p>
                </>
              )}
              {customer?.email && <p className="text-sm text-gray-600 mt-1">{customer.email}</p>}
              {customer?.org_no && <p className="text-xs text-gray-400 mt-1">Org.nr: {customer.org_no}</p>}
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Fakturadatum</span>
                <span className="font-medium">{formatDate(invoice.invoice_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Förfallodatum</span>
                <span className="font-medium">{formatDate(invoice.due_date)}</span>
              </div>
              {invoice.ocr_number && (
                <div className="flex justify-between">
                  <span className="text-gray-500">OCR</span>
                  <span className="font-mono font-semibold">{invoice.ocr_number}</span>
                </div>
              )}
              {invoice.your_reference && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Er referens</span>
                  <span className="font-medium">{invoice.your_reference}</span>
                </div>
              )}
              {company?.bankgiro && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Bankgiro</span>
                  <span className="font-medium">{company.bankgiro}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lines */}
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Beskrivning</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Antal</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Enhet</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">À-pris</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Moms</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Belopp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lines.map((line) => (
              <tr key={line.id}>
                <td className="px-6 py-3.5 text-gray-900">{line.description}</td>
                <td className="px-4 py-3.5 text-right text-gray-600 tabular-nums">{line.quantity}</td>
                <td className="px-4 py-3.5 text-gray-500">{line.unit}</td>
                <td className="px-4 py-3.5 text-right tabular-nums">{formatSEK(line.unit_price)}</td>
                <td className="px-4 py-3.5 text-right text-gray-500">{line.vat_rate}%</td>
                <td className="px-6 py-3.5 text-right font-medium tabular-nums">{formatSEK(line.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-gray-100 px-6 py-5">
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Netto (ex. moms)</span>
                <span className="tabular-nums">{formatSEK(invoice.subtotal)}</span>
              </div>
              {Object.entries(vatByRate).filter(([, v]) => v > 0).sort(([a], [b]) => Number(b) - Number(a)).map(([rate, amt]) => (
                <div key={rate} className="flex justify-between text-gray-500">
                  <span>Moms {rate}%</span>
                  <span className="tabular-nums">{formatSEK(amt)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base text-gray-900">
                <span>Totalt att betala</span>
                <span className="tabular-nums">{formatSEK(invoice.total)}</span>
              </div>
              {invoice.paid_amount > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Betalt</span>
                    <span className="tabular-nums">−{formatSEK(invoice.paid_amount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Kvar att betala</span>
                    <span className="tabular-nums">{formatSEK(invoice.amount_due)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="border-t border-gray-100 px-6 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Meddelande</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Payment info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
        <Clock className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-blue-900 mb-1">Betalningsinformation</p>
          <p className="text-blue-700">
            Betala senast {formatDate(invoice.due_date)} med OCR-nummer <strong className="font-mono">{invoice.ocr_number}</strong>
            {company?.bankgiro && <> till Bankgiro <strong>{company.bankgiro}</strong></>}.
          </p>
        </div>
      </div>
    </div>
  );
}
