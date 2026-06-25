"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Plus, Trash2, Send, AlertTriangle } from "lucide-react";
import { formatSEK, generateOCR, toDateInput } from "@/lib/utils";
import type { ClientCompany, Customer, Invoice, InvoiceLine } from "@/types/database";

interface EditLine {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: number;
}

interface Props {
  invoice: Invoice & { status: string };
  company: ClientCompany;
  customer: Customer;
  lines: InvoiceLine[];
  allCustomers: Pick<Customer, "id" | "name" | "payment_terms_days">[];
  getRedirectPath?: (id: string) => string;
}

const emptyLine = (): EditLine => ({ description: "", quantity: 1, unit: "st", unit_price: 0, vat_rate: 25 });

export function InvoiceEditForm({ invoice, company, customer, lines: initialLines, allCustomers, getRedirectPath }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [customerId, setCustomerId] = useState(invoice.customer_id);
  const [invoiceDate, setInvoiceDate] = useState(toDateInput(new Date(invoice.invoice_date)));
  const [dueDate, setDueDate] = useState(toDateInput(new Date(invoice.due_date)));
  const [yourReference, setYourReference] = useState(invoice.your_reference ?? "");
  const [ourReference, setOurReference] = useState(invoice.our_reference ?? "");
  const [notes, setNotes] = useState(invoice.notes ?? "");
  const [lines, setLines] = useState<EditLine[]>(
    initialLines.length > 0
      ? initialLines.map((l) => ({ id: l.id, description: l.description, quantity: l.quantity, unit: l.unit, unit_price: l.unit_price, vat_rate: l.vat_rate }))
      : [emptyLine()]
  );

  const isSent = invoice.status === "sent" || invoice.status === "overdue";

  const calcLine = useCallback((l: EditLine) => {
    const lineTotal = Math.round(l.quantity * l.unit_price * 100) / 100;
    const vatAmount = Math.round(lineTotal * (l.vat_rate / 100) * 100) / 100;
    return { lineTotal, vatAmount };
  }, []);

  const subtotal = lines.reduce((s, l) => s + calcLine(l).lineTotal, 0);
  const vatByRate: Record<number, number> = {};
  lines.forEach((l) => {
    const { vatAmount } = calcLine(l);
    vatByRate[l.vat_rate] = (vatByRate[l.vat_rate] ?? 0) + vatAmount;
  });
  const totalVat = Object.values(vatByRate).reduce((s, v) => s + v, 0);
  const total = subtotal + totalVat;

  function updateLine(i: number, field: keyof EditLine, value: string | number) {
    setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }
  function addLine() { setLines((prev) => [...prev, emptyLine()]); }
  function removeLine(i: number) { setLines((prev) => prev.filter((_, idx) => idx !== i)); }

  async function handleSave(resend = false) {
    setError("");
    if (!customerId) { setError("Välj en kund."); return; }
    if (lines.every((l) => !l.description)) { setError("Lägg till minst en fakturarad."); return; }
    setLoading(true);

    const supabase = createClient();
    const ocrNumber = generateOCR(invoice.invoice_number);

    // Update invoice
    const { error: invErr } = await supabase
      .from("invoices")
      .update({
        customer_id: customerId,
        invoice_date: invoiceDate,
        due_date: dueDate,
        ocr_number: ocrNumber,
        subtotal,
        vat_amount: totalVat,
        total,
        amount_due: total,
        your_reference: yourReference || null,
        our_reference: ourReference || null,
        notes: notes || null,
        // If resending, update status to sent
        ...(resend ? { status: "sent", sent_at: new Date().toISOString() } : {}),
      })
      .eq("id", invoice.id);

    if (invErr) { setError(invErr.message); setLoading(false); return; }

    // Delete old lines and re-insert
    await supabase.from("invoice_lines").delete().eq("invoice_id", invoice.id);

    const linePayloads = lines
      .filter((l) => l.description)
      .map((l, i) => {
        const { lineTotal, vatAmount } = calcLine(l);
        return {
          invoice_id: invoice.id,
          sort_order: i,
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          unit_price: l.unit_price,
          vat_rate: l.vat_rate as 0 | 6 | 12 | 25,
          line_total: lineTotal,
          vat_amount: vatAmount,
          is_labor: false,
        };
      });

    const { error: linesErr } = await supabase.from("invoice_lines").insert(linePayloads);
    if (linesErr) { setError(linesErr.message); setLoading(false); return; }

    router.push(getRedirectPath ? getRedirectPath(invoice.id) : `/dashboard/invoices/${invoice.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Warning for sent invoices */}
      {isSent && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Fakturan är redan skickad</p>
            <p className="text-amber-700 text-sm mt-0.5">
              Ändringar påverkar inte vad kunden redan har fått. Använd <strong>"Spara och skicka om"</strong> för att
              skicka en uppdaterad version till kunden.
            </p>
          </div>
        </div>
      )}

      {/* Header info (read-only) */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Fakturahuvud</h2>
          <span className="font-mono font-bold text-blue-600 text-sm">{invoice.invoice_number}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Klientföretag</Label>
            <Input value={company.name} disabled className="bg-gray-50 text-gray-500" />
          </div>
          <div className="space-y-1.5">
            <Label>Kund <span className="text-red-500">*</span></Label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {allCustomers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Fakturanummer</Label>
            <Input value={invoice.invoice_number} readOnly className="bg-gray-50 font-mono text-gray-500" />
            <p className="text-[10px] text-gray-400">Kan ej ändras</p>
          </div>
          <div className="space-y-1.5">
            <Label>Fakturadatum</Label>
            <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Förfallodatum</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Er referens</Label>
            <Input placeholder="Kontaktperson hos kund" value={yourReference} onChange={(e) => setYourReference(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Vår referens</Label>
            <Input placeholder="Din referens" value={ourReference} onChange={(e) => setOurReference(e.target.value)} />
          </div>
        </div>
      </section>

      {/* Invoice Lines */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Fakturarader</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-xs w-[38%]">Beskrivning</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500 text-xs w-16">Antal</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs w-16">Enhet</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500 text-xs w-28">À-pris (ex. moms)</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500 text-xs w-20">Moms%</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-500 text-xs w-28">Belopp</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2">
                    <Input
                      placeholder="Beskriv tjänsten eller produkten"
                      value={line.description}
                      onChange={(e) => updateLine(i, "description", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number" min={0} step="0.01"
                      value={line.quantity}
                      onChange={(e) => updateLine(i, "quantity", parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm text-right w-16"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input value={line.unit} onChange={(e) => updateLine(i, "unit", e.target.value)} className="h-8 text-sm w-16" />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number" min={0} step="0.01"
                      value={line.unit_price}
                      onChange={(e) => updateLine(i, "unit_price", parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm text-right w-28"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={line.vat_rate}
                      onChange={(e) => updateLine(i, "vat_rate", Number(e.target.value))}
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm w-20"
                    >
                      <option value={25}>25%</option>
                      <option value={12}>12%</option>
                      <option value={6}>6%</option>
                      <option value={0}>0%</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900 tabular-nums">
                    {formatSEK(calcLine(line).lineTotal)}
                  </td>
                  <td className="px-2 py-2">
                    {lines.length > 1 && (
                      <button onClick={() => removeLine(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100">
          <Button type="button" variant="outline" size="sm" onClick={addLine} className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> Lägg till rad
          </Button>
        </div>
      </section>

      {/* Summary + Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Anteckningar</h2>
          <Textarea
            placeholder="Betalningsinformation, tackmeddelande, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Summering</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Netto (ex. moms)</span>
              <span className="font-medium tabular-nums">{formatSEK(subtotal)}</span>
            </div>
            {Object.entries(vatByRate).filter(([, v]) => v > 0).sort(([a], [b]) => Number(b) - Number(a)).map(([rate, amt]) => (
              <div key={rate} className="flex justify-between text-gray-500">
                <span>Moms {rate}%</span>
                <span className="tabular-nums">{formatSEK(amt)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-base">
              <span>Totalt att betala</span>
              <span className="tabular-nums">{formatSEK(total)}</span>
            </div>
          </div>

          {/* Change summary */}
          {total !== invoice.total && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
              <p className="text-amber-700 font-medium">Beloppsändring</p>
              <div className="flex justify-between mt-1 text-amber-600">
                <span>Tidigare</span><span className="tabular-nums line-through">{formatSEK(invoice.total)}</span>
              </div>
              <div className="flex justify-between text-amber-900 font-semibold">
                <span>Nytt belopp</span><span className="tabular-nums">{formatSEK(total)}</span>
              </div>
              <div className="flex justify-between mt-1 text-amber-700 border-t border-amber-200 pt-1">
                <span>Skillnad</span>
                <span className={`tabular-nums font-medium ${total > invoice.total ? "text-red-600" : "text-green-600"}`}>
                  {total > invoice.total ? "+" : ""}{formatSEK(total - invoice.total)}
                </span>
              </div>
            </div>
          )}
        </section>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => handleSave(false)} disabled={loading} variant="outline" className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Spara ändringar
        </Button>
        {isSent && (
          <Button onClick={() => handleSave(true)} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Spara och skicka om
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={() => router.back()}>Avbryt</Button>
      </div>
    </div>
  );
}
