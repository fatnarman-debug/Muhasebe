"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toDateInput } from "@/lib/utils";
import { Loader2, Undo2 } from "lucide-react";

type Line = {
  description: string; quantity: number; unit: string; unit_price: number;
  vat_rate: number; line_total: number; vat_amount: number; sort_order: number; is_labor?: boolean;
};

/**
 * Kreditfaktura (fatura iptali). Yasal (Bokföringslagen): gönderilmiş bir fatura
 * silinemez → negatif tutarlı bir kreditfaktura oluşturulur (aynı FAK numara
 * serisinden), orijinal fatura "credited" (krediterad) olarak işaretlenir.
 * Sadece doc_type='invoice' ve status sent/overdue/paid için görünür.
 */
export function CreditInvoiceAction({
  invoiceId, status, docType, redirectBase,
}: { invoiceId: string; status: string; docType: string; redirectBase: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const eligible = docType === "invoice" && ["sent", "overdue", "paid"].includes(status);
  if (!eligible) return null;

  async function createCredit() {
    if (!window.confirm(
      "Skapa en kreditfaktura för denna faktura?\n\nFakturan kan inte raderas (bokföringslagen) – istället skapas en kreditfaktura med negativa belopp som upphäver originalet. Originalet markeras som krediterad."
    )) return;

    setBusy(true); setErr("");
    const supabase = createClient();

    // Orijinal fatura + satırlar (RLS sahibe/atanan muhasebeciye sınırlı)
    const { data: orig, error: e1 } = await supabase
      .from("invoices")
      .select("*, invoice_lines(*)")
      .eq("id", invoiceId)
      .maybeSingle();
    if (e1 || !orig) { setBusy(false); setErr(e1?.message ?? "Fakturan hittades inte."); return; }
    if (orig.doc_type !== "invoice" || orig.status === "credited") {
      setBusy(false); setErr("Fakturan kan inte krediteras."); return;
    }

    const { data: company } = await supabase
      .from("client_companies")
      .select("invoice_prefix, next_invoice_number")
      .eq("id", orig.client_company_id)
      .maybeSingle();
    if (!company) { setBusy(false); setErr("Klientföretag saknas."); return; }

    // Kreditfaktura numarası: AYNI faktura serisinden (gap-free)
    const number = `${company.invoice_prefix ?? "FAK"}-${String(company.next_invoice_number ?? 1).padStart(4, "0")}`;
    const today = toDateInput(new Date());
    const ref = `Kreditfaktura avseende faktura ${orig.invoice_number} (${orig.invoice_date}).`;

    const { data: credit, error: e2 } = await supabase.from("invoices").insert({
      client_company_id: orig.client_company_id,
      customer_id: orig.customer_id,
      invoice_number: number,
      ocr_number: null,              // kredi ödeme talebi değildir → OCR yok
      doc_type: "credit",
      credited_invoice_id: orig.id,
      status: "draft",
      invoice_date: today,
      due_date: today,
      currency: orig.currency ?? "SEK",
      exchange_rate: orig.exchange_rate ?? 1,
      rot_rut_type: orig.rot_rut_type ?? null,
      rot_rut_amount: -(orig.rot_rut_amount ?? 0),
      subtotal: -(orig.subtotal ?? 0),
      vat_amount: -(orig.vat_amount ?? 0),
      total: -(orig.total ?? 0),
      amount_due: -(orig.total ?? 0),
      paid_amount: 0,
      your_reference: orig.your_reference,
      our_reference: orig.our_reference,
      notes: orig.notes ? `${ref}\n${orig.notes}` : ref,
    }).select("id").single();
    if (e2 || !credit) { setBusy(false); setErr(e2?.message ?? "Kunde inte skapa kreditfaktura."); return; }

    // Satırları negatif kopyala
    const origLines = (orig.invoice_lines as unknown as Line[]) ?? [];
    const linePayloads = [...origLines]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((l, i) => ({
        invoice_id: credit.id, sort_order: i, description: l.description,
        quantity: l.quantity, unit: l.unit,
        unit_price: -l.unit_price, vat_rate: l.vat_rate as 0 | 6 | 12 | 25,
        line_total: -l.line_total, vat_amount: -l.vat_amount, is_labor: l.is_labor ?? false,
      }));
    if (linePayloads.length) await supabase.from("invoice_lines").insert(linePayloads);

    // Faktura serisini ilerlet + orijinali krediterad yap
    await supabase.from("client_companies")
      .update({ next_invoice_number: (company.next_invoice_number ?? 1) + 1 })
      .eq("id", orig.client_company_id);
    await supabase.from("invoices").update({ status: "credited" }).eq("id", orig.id);

    router.push(`${redirectBase}/${credit.id}`);
    router.refresh();
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button onClick={createCredit} disabled={busy}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-50 disabled:opacity-50">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />} Skapa kreditfaktura
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </span>
  );
}
