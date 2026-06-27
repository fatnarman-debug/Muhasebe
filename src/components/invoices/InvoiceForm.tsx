"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Plus, Trash2, Send, Package, Search, FileText, FileSpreadsheet } from "lucide-react";
import { formatSEK, generateOCR, toDateInput, addDays } from "@/lib/utils";
import type { ClientCompany, Customer, Article, DocumentType } from "@/types/database";

interface InvoiceLine {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: number;
}

interface Props {
  clientCompanies: (Pick<ClientCompany, "id" | "name" | "invoice_prefix" | "next_invoice_number" | "next_offert_number" | "payment_terms_days" | "default_vat_rate"> & { customers: Pick<Customer, "id" | "name" | "payment_terms_days">[] })[];
  // Kaydetme sonrası yönlendirme — varsayılan dashboard fatura detayı.
  // Konsult akışı kendi liste sayfasına yönlendirmek için override eder.
  getRedirectPath?: (invoiceId: string) => string;
  // Belge türü başlangıç değeri (faktura | offert). Toggle ile değiştirilebilir.
  initialDocType?: DocumentType;
}

const emptyLine = (): InvoiceLine => ({
  description: "",
  quantity: 1,
  unit: "st",
  unit_price: 0,
  vat_rate: 25,
});

export function InvoiceForm({ clientCompanies, getRedirectPath, initialDocType = "invoice" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [docType, setDocType] = useState<DocumentType>(initialDocType);
  const isOffert = docType === "offert";

  const firstCompany = clientCompanies[0];
  const [clientCompanyId, setClientCompanyId] = useState(firstCompany?.id ?? "");
  const [customerId, setCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(toDateInput(new Date()));
  const [dueDate, setDueDate] = useState(toDateInput(addDays(new Date(), firstCompany?.payment_terms_days ?? 30)));
  const [yourReference, setYourReference] = useState("");
  const [ourReference, setOurReference] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<InvoiceLine[]>([emptyLine()]);

  // Article picker state
  const [articles, setArticles] = useState<Article[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [articleSearch, setArticleSearch] = useState("");

  const selectedCompany = clientCompanies.find((c) => c.id === clientCompanyId);
  const customers = selectedCompany?.customers ?? [];

  const seqNo = isOffert ? (selectedCompany?.next_offert_number ?? 1) : (selectedCompany?.next_invoice_number ?? 1);
  const numPrefix = isOffert ? "OFF" : (selectedCompany?.invoice_prefix ?? "FAK");
  const invoiceNumber = selectedCompany ? `${numPrefix}-${String(seqNo).padStart(4, "0")}` : "";
  // Offert ödeme talebi değildir → OCR üretilmez
  const ocrNumber = !isOffert && invoiceNumber ? generateOCR(invoiceNumber) : "";

  // Recalc due date and reset customer when company changes
  useEffect(() => {
    const terms = selectedCompany?.payment_terms_days ?? 30;
    setDueDate(toDateInput(addDays(new Date(invoiceDate), terms)));
    setCustomerId(customers[0]?.id ?? "");
    // Fetch articles for this company
    const supabase = createClient();
    supabase
      .from("articles")
      .select("*")
      .eq("client_company_id", clientCompanyId)
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setArticles(data ?? []));
  }, [clientCompanyId, invoiceDate]); // eslint-disable-line

  const calcLine = useCallback((l: InvoiceLine) => {
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

  function updateLine(i: number, field: keyof InvoiceLine, value: string | number) {
    setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }
  function addLine() { setLines((prev) => [...prev, emptyLine()]); }
  function removeLine(i: number) { setLines((prev) => prev.filter((_, idx) => idx !== i)); }

  function addArticleLine(a: Article) {
    setLines((prev) => [
      ...prev.filter((l) => l.description || l.unit_price > 0), // remove empty trailing line
      {
        description: a.name + (a.description ? ` — ${a.description}` : ""),
        quantity: 1,
        unit: a.unit,
        unit_price: a.unit_price,
        vat_rate: a.vat_rate,
      },
    ]);
    setShowPicker(false);
    setArticleSearch("");
  }

  const filteredArticles = articles.filter((a) =>
    a.name.toLowerCase().includes(articleSearch.toLowerCase()) ||
    (a.description ?? "").toLowerCase().includes(articleSearch.toLowerCase())
  );

  async function handleSubmit(status: "draft" | "sent") {
    setError("");
    if (!customerId) { setError("Välj en kund."); return; }
    if (lines.every((l) => !l.description)) { setError("Lägg till minst en fakturarad."); return; }
    setLoading(true);

    const supabase = createClient();

    const invoicePayload = {
      client_company_id: clientCompanyId,
      customer_id: customerId,
      invoice_number: invoiceNumber,
      ocr_number: isOffert ? null : ocrNumber,
      doc_type: docType,
      status,
      invoice_date: invoiceDate,
      due_date: dueDate,
      currency: "SEK",
      exchange_rate: 1,
      subtotal,
      vat_amount: totalVat,
      total,
      amount_due: total,
      paid_amount: 0,
      rot_rut_amount: 0,
      your_reference: yourReference || null,
      our_reference: ourReference || null,
      notes: notes || null,
      sent_at: status === "sent" ? new Date().toISOString() : null,
    };

    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .insert(invoicePayload)
      .select()
      .single();

    if (invErr) { setError(invErr.message); setLoading(false); return; }

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

    await supabase
      .from("client_companies")
      .update(isOffert
        ? { next_offert_number: (selectedCompany?.next_offert_number ?? 1) + 1 }
        : { next_invoice_number: (selectedCompany?.next_invoice_number ?? 1) + 1 })
      .eq("id", clientCompanyId);

    router.push(getRedirectPath ? getRedirectPath(invoice.id) : `/dashboard/invoices/${invoice.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Dokumenttyp — Faktura / Offert */}
      <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
        <button type="button" onClick={() => setDocType("invoice")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${!isOffert ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"}`}>
          <FileText className="w-4 h-4" /> Faktura
        </button>
        <button type="button" onClick={() => setDocType("offert")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isOffert ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"}`}>
          <FileSpreadsheet className="w-4 h-4" /> Offert
        </button>
      </div>

      {/* Header */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{isOffert ? "Offerthuvud" : "Fakturahuvud"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Klientföretag <span className="text-red-500">*</span></Label>
            <select
              value={clientCompanyId}
              onChange={(e) => setClientCompanyId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {clientCompanies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Kund <span className="text-red-500">*</span></Label>
            {customers.length === 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                Inga kunder för detta företag.
              </p>
            ) : (
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>{isOffert ? "Offertnummer" : "Fakturanummer"}</Label>
            <Input value={invoiceNumber} readOnly className="bg-gray-50 font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label>{isOffert ? "Offertdatum" : "Fakturadatum"}</Label>
            <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{isOffert ? "Giltigt t.o.m." : "Förfallodatum"}</Label>
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
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{isOffert ? "Offertrader" : "Fakturarader"}</h2>
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
                    <Input
                      value={line.unit}
                      onChange={(e) => updateLine(i, "unit", e.target.value)}
                      className="h-8 text-sm w-16"
                    />
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
                  <td className="px-3 py-2 text-right font-medium text-gray-900 w-28 tabular-nums">
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

        {/* Article picker panel */}
        {showPicker && (
          <div className="border-t border-gray-100 bg-gray-50 p-4">
            <div className="mb-3 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                autoFocus
                placeholder="Sök artikel..."
                value={articleSearch}
                onChange={(e) => setArticleSearch(e.target.value)}
                className="pl-9 h-9 bg-white"
              />
            </div>
            {filteredArticles.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                {articles.length === 0 ? "Inga artiklar för detta företag." : "Ingen matchning."}
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto">
                {filteredArticles.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => addArticleLine(a)}
                    className="text-left bg-white border border-gray-200 rounded-lg px-3 py-2.5 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">{a.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", minimumFractionDigits: 0 }).format(a.unit_price)} · {a.unit} · {a.vat_rate}% moms
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addLine} className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> Lägg till rad
          </Button>
          {/* Artikelväljaren visas bara om företaget har sparade artiklar */}
          {articles.length > 0 && (
            <Button
              type="button"
              variant={showPicker ? "default" : "outline"}
              size="sm"
              onClick={() => { setShowPicker((v) => !v); setArticleSearch(""); }}
              className="gap-1.5 text-xs"
            >
              <Package className="w-3.5 h-3.5" />
              {showPicker ? "Stäng artiklar" : "Välj artikel"}
            </Button>
          )}
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
          {ocrNumber && (
            <div className="mt-3 bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">OCR-nummer</p>
              <p className="font-mono font-bold text-gray-900 tracking-wider">{ocrNumber}</p>
            </div>
          )}
        </section>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="flex gap-3">
        <Button onClick={() => handleSubmit("draft")} disabled={loading} variant="outline" className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Spara som utkast
        </Button>
        <Button onClick={() => handleSubmit("sent")} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {isOffert ? "Skicka offert" : "Skicka faktura"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>Avbryt</Button>
      </div>
    </div>
  );
}
