"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateOCR, toDateInput, addDays } from "@/lib/utils";
import { Loader2, Check, X, FileText } from "lucide-react";

type Line = {
  description: string; quantity: number; unit: string; unit_price: number;
  vat_rate: number; line_total: number; vat_amount: number; sort_order: number;
};

type Offer = {
  id: string; status: string; client_company_id: string; customer_id: string;
  subtotal: number; vat_amount: number; total: number;
  your_reference: string | null; our_reference: string | null; notes: string | null;
};

// Offert (teklif) aksiyonları: kabul/ret + faturaya dönüştürme.
// Dönüşüm yeni bir FAKTURA satırı oluşturur (FAK- serisi); teklif kayıtta kalır (status=accepted).
export function OfferActions({ offer, lines, redirectBase }: { offer: Offer; lines: Line[]; redirectBase: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function setStatus(status: "accepted" | "declined") {
    setBusy(status); setMsg(null);
    const { error } = await createClient().from("invoices").update({ status }).eq("id", offer.id);
    setBusy("");
    if (error) { setMsg({ ok: false, text: error.message }); return; }
    router.refresh();
  }

  async function convert() {
    setBusy("convert"); setMsg(null);
    const supabase = createClient();

    const { data: company } = await supabase
      .from("client_companies")
      .select("invoice_prefix, next_invoice_number, payment_terms_days")
      .eq("id", offer.client_company_id)
      .maybeSingle();
    if (!company) { setBusy(""); setMsg({ ok: false, text: "Klientföretag saknas." }); return; }

    const number = `${company.invoice_prefix ?? "FAK"}-${String(company.next_invoice_number ?? 1).padStart(4, "0")}`;
    const { data: inv, error } = await supabase.from("invoices").insert({
      client_company_id: offer.client_company_id,
      customer_id: offer.customer_id,
      invoice_number: number,
      ocr_number: generateOCR(number),
      doc_type: "invoice",
      source_offer_id: offer.id,
      status: "draft",
      invoice_date: toDateInput(new Date()),
      due_date: toDateInput(addDays(new Date(), company.payment_terms_days ?? 30)),
      currency: "SEK", exchange_rate: 1,
      subtotal: offer.subtotal, vat_amount: offer.vat_amount, total: offer.total,
      amount_due: offer.total, paid_amount: 0, rot_rut_amount: 0,
      your_reference: offer.your_reference, our_reference: offer.our_reference, notes: offer.notes,
    }).select("id").single();

    if (error || !inv) { setBusy(""); setMsg({ ok: false, text: error?.message ?? "Kunde inte skapa faktura." }); return; }

    const linePayloads = lines.map((l, i) => ({
      invoice_id: inv.id, sort_order: i, description: l.description, quantity: l.quantity,
      unit: l.unit, unit_price: l.unit_price, vat_rate: l.vat_rate as 0 | 6 | 12 | 25,
      line_total: l.line_total, vat_amount: l.vat_amount, is_labor: false,
    }));
    if (linePayloads.length) await supabase.from("invoice_lines").insert(linePayloads);

    await supabase.from("client_companies")
      .update({ next_invoice_number: (company.next_invoice_number ?? 1) + 1 })
      .eq("id", offer.client_company_id);
    await supabase.from("invoices").update({ status: "accepted" }).eq("id", offer.id);

    router.push(`${redirectBase}/${inv.id}`);
    router.refresh();
  }

  const decided = offer.status === "accepted" || offer.status === "declined";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {!decided && (
        <>
          <button onClick={() => setStatus("accepted")} disabled={busy !== ""}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-200 text-emerald-700 text-sm font-medium hover:bg-emerald-50 disabled:opacity-50">
            {busy === "accepted" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Markera accepterad
          </button>
          <button onClick={() => setStatus("declined")} disabled={busy !== ""}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
            {busy === "declined" ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />} Markera avvisad
          </button>
        </>
      )}
      {offer.status !== "declined" && (
        <button onClick={convert} disabled={busy !== ""}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold disabled:opacity-50">
          {busy === "convert" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Skapa faktura
        </button>
      )}
      {msg && <span className={`text-xs ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</span>}
    </div>
  );
}
