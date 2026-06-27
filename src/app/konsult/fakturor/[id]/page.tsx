"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatSEK } from "@/lib/utils";
import { OfferActions } from "@/components/invoices/OfferActions";
import { Download, Send, Pencil, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

type Line = { id: string; description: string; quantity: number; unit: string; unit_price: number; vat_rate: number; line_total: number; vat_amount: number; sort_order: number };
type Inv = {
  id: string; invoice_number: string; status: string; doc_type: string; invoice_date: string; due_date: string;
  client_company_id: string; customer_id: string;
  ocr_number: string | null; subtotal: number; vat_amount: number; total: number;
  your_reference: string | null; our_reference: string | null; notes: string | null;
  customers: { name: string; email: string | null } | null;
  client_companies: { name: string } | null;
  invoice_lines: Line[];
};

const STATUS: Record<string, [string, string, string]> = {
  draft: ["#f3f4f6", "#6b7280", "Utkast"], sent: ["#eff1ff", "#3730a3", "Skickad"],
  paid: ["#dcfce7", "#15803d", "Betald"], overdue: ["#fee2e2", "#dc2626", "Försenad"],
  cancelled: ["#f3f4f6", "#9ca3af", "Makulerad"], credit: ["#fef9c3", "#a16207", "Kredit"],
  accepted: ["#dcfce7", "#15803d", "Accepterad"], declined: ["#fee2e2", "#dc2626", "Avvisad"],
};

export default function KonsultInvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [inv, setInv] = useState<Inv | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("invoices")
      .select("*, customers(name,email), client_companies(name), invoice_lines(*)")
      .eq("id", id)
      .maybeSingle();
    setInv(data as unknown as Inv);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function handleSend() {
    setMsg(""); setSending(true);
    try {
      const res = await fetch(`/api/invoices/${id}/send`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Kunde inte skicka");
      setMsg(inv?.doc_type === "offert" ? "Offerten skickades till kunden." : "Fakturan skickades till kunden.");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Kunde inte skicka");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!inv) return <div className="p-8 text-gray-500">Fakturan hittades inte.</div>;

  const [bg, color, label] = STATUS[inv.status] ?? ["#f3f4f6", "#6b7280", inv.status];
  const isDraft = inv.status === "draft";
  const isOffert = inv.doc_type === "offert";
  const lines = [...(inv.invoice_lines ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div style={{ padding: "24px 32px 48px", maxWidth: 860, margin: "0 auto" }}>
      <Link href={isOffert ? "/konsult/fakturor?tab=offert" : "/konsult/fakturor"} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4">
        <ArrowLeft className="w-4 h-4" /> {isOffert ? "Offerter" : "Fakturor"}
      </Link>

      {/* Üst aksiyon kartı */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div className="flex items-center gap-3">
          <code style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>{inv.invoice_number}</code>
          <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/api/invoices/${id}/pdf`} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Ladda ner PDF
          </a>
          {isDraft && (
            <button onClick={() => router.push(`/konsult/fakturor/${id}/edit`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Pencil className="w-4 h-4" /> Redigera
            </button>
          )}
          {inv.status !== "paid" && inv.status !== "cancelled" && (
            <button onClick={handleSend} disabled={sending || !inv.customers?.email}
              title={!inv.customers?.email ? "Kunden saknar e-postadress" : ""}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold disabled:opacity-50">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {inv.status === "sent" ? "Skicka igen" : "Skicka till kund"}
            </button>
          )}
        </div>
      </div>

      {isOffert && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, marginBottom: 18 }}>
          <p className="text-xs text-gray-400 mb-2.5 uppercase tracking-wide">Offertåtgärder</p>
          <OfferActions
            offer={{
              id: inv.id, status: inv.status, client_company_id: inv.client_company_id, customer_id: inv.customer_id,
              subtotal: inv.subtotal, vat_amount: inv.vat_amount, total: inv.total,
              your_reference: inv.your_reference, our_reference: inv.our_reference, notes: inv.notes,
            }}
            lines={lines}
            redirectBase="/konsult/fakturor"
          />
        </div>
      )}

      {msg && (
        <div className="mb-4 flex items-center gap-2 text-sm rounded-lg px-4 py-3" style={{ background: "#ecfdf5", color: "#15803d" }}>
          <CheckCircle2 className="w-4 h-4" /> {msg}
        </div>
      )}
      {isDraft && (
        <p className="mb-4 text-xs text-gray-400">Utkast — kan redigeras tills den skickas till kunden.</p>
      )}

      {/* Özet */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderBottom: "1px solid #f3f4f6" }}>
          <div>
            <p style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Kund</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{inv.customers?.name ?? "—"}</p>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>{inv.customers?.email ?? "Ingen e-post"}</p>
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Klientföretag: {inv.client_companies?.name ?? "—"}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 12, color: "#6b7280" }}>{isOffert ? "Offertdatum" : "Fakturadatum"}: <b>{inv.invoice_date}</b></p>
            <p style={{ fontSize: 12, color: "#6b7280" }}>{isOffert ? "Giltigt t.o.m." : "Förfaller"}: <b>{inv.due_date}</b></p>
            {!isOffert && inv.ocr_number && <p style={{ fontSize: 12, color: "#6b7280" }}>OCR: <b>{inv.ocr_number}</b></p>}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
              {["Beskrivning", "Antal", "À-pris", "Moms", "Belopp"].map((h, i) => (
                <th key={h} style={{ padding: "10px 16px", textAlign: i === 0 ? "left" : "right", fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                <td style={{ padding: "10px 16px", fontSize: 13, color: "#111827" }}>{l.description}</td>
                <td style={{ padding: "10px 16px", fontSize: 13, color: "#6b7280", textAlign: "right" }}>{l.quantity} {l.unit}</td>
                <td style={{ padding: "10px 16px", fontSize: 13, color: "#6b7280", textAlign: "right" }}>{formatSEK(l.unit_price)}</td>
                <td style={{ padding: "10px 16px", fontSize: 13, color: "#6b7280", textAlign: "right" }}>{l.vat_rate}%</td>
                <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#111827", textAlign: "right" }}>{formatSEK(l.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "flex-end", padding: 16 }}>
          <div style={{ width: 260 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 13, color: "#6b7280" }}><span>Netto</span><span>{formatSEK(inv.subtotal)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 13, color: "#6b7280" }}><span>Moms</span><span>{formatSEK(inv.vat_amount)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, paddingTop: 8, borderTop: "1px solid #e5e7eb", fontSize: 15, fontWeight: 800, color: "#111827" }}><span>{isOffert ? "Summa" : "Att betala"}</span><span>{formatSEK(inv.total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
