import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { ClientCompany, Customer, Invoice, InvoiceLine } from "@/types/database";

// ── Şablon görselleri: yapı/sıra sabit, yalnızca renk + başlık bandı değişir ──
type PdfTpl = { accent: string; band: boolean; bandBg?: string; minimal?: boolean };
const PDF_TEMPLATES: Record<string, PdfTpl> = {
  "klasik-standart":    { accent: "#1f2937", band: false },
  "klasik-minimal":     { accent: "#111827", band: false, minimal: true },
  "klasik-profesyonel": { accent: "#334155", band: false },
  "klasik-corporate":   { accent: "#111827", band: true, bandBg: "#111827" },
  "klasik-clean":       { accent: "#475569", band: false, minimal: true },
  "modern-colorful":    { accent: "#0d9488", band: true, bandBg: "#0d9488" },
  "modern-gradient":    { accent: "#7c3aed", band: true, bandBg: "#7c3aed" },
  "modern-bold":        { accent: "#0d9488", band: true, bandBg: "#111827" },
  "modern-tech":        { accent: "#16a34a", band: true, bandBg: "#0b0f0c" },
  "modern-creative":    { accent: "#ea580c", band: true, bandBg: "#ea580c" },
};

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: "#1a1a1a", paddingTop: 40, paddingBottom: 90, paddingHorizontal: 40, backgroundColor: "#ffffff" },
  logo: { width: 130, height: 44, objectFit: "contain", marginBottom: 6 },
  companyName: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  companyLine: { fontSize: 8, color: "#555" },
  fakturaTitle: { fontSize: 26, fontFamily: "Helvetica-Bold", textAlign: "right" },
  sida: { fontSize: 8, color: "#888", textAlign: "right", marginTop: 2 },
  recipientName: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  recipientLine: { fontSize: 9, color: "#222", lineHeight: 1.5 },
  bandLabelSm: { fontSize: 8 },
  bandBig: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  bandColLabel: { fontSize: 8 },
  bandColVal: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  infoBox: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 4, padding: 12, flexDirection: "row", marginBottom: 22 },
  infoCol: { width: "50%" },
  infoRow: { flexDirection: "row", marginBottom: 3 },
  infoKey: { fontSize: 8.5, color: "#6b7280", width: 78 },
  infoVal: { fontSize: 8.5, color: "#111827", fontFamily: "Helvetica-Bold" },
  thRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#9ca3af", paddingBottom: 5, marginBottom: 2 },
  th: { fontSize: 8, color: "#6b7280" },
  row: { flexDirection: "row", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  cKind: { width: 56, fontSize: 9, fontFamily: "Helvetica-Bold" },
  cDesc: { flex: 1, fontSize: 9, color: "#222", paddingRight: 8 },
  cQty: { width: 78, fontSize: 9, color: "#444", textAlign: "right" },
  cVat: { width: 42, fontSize: 9, color: "#444", textAlign: "right" },
  cAmt: { width: 80, fontSize: 9, fontFamily: "Helvetica-Bold", textAlign: "right" },
  sumWrap: { flexDirection: "row", justifyContent: "flex-end", marginTop: 14 },
  sumBox: { width: 320 },
  sumHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 4 },
  sumHeadCell: { fontSize: 8, color: "#6b7280", textAlign: "right" },
  sumRow: { flexDirection: "row", paddingVertical: 4 },
  sumLabel: { flex: 1, fontSize: 9, color: "#374151" },
  sumCell: { width: 90, fontSize: 9, textAlign: "right", color: "#374151" },
  attRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  attText: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  giro: { position: "absolute", bottom: 24, left: 40, right: 40, borderTopWidth: 1, borderTopColor: "#111827", paddingTop: 8, flexDirection: "row", justifyContent: "space-between" },
  giroLabel: { fontSize: 7, color: "#6b7280" },
  giroVal: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827" },
});

function fmt(n: number) {
  return new Intl.NumberFormat("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " kr";
}
function fmtDate(d: string) {
  return new Intl.DateTimeFormat("sv-SE").format(new Date(d));
}

interface Props {
  invoice: Invoice;
  company: ClientCompany;
  customer: Customer;
  lines: InvoiceLine[];
  template?: string;
  qrDataUrl?: string | null;
}

export function InvoicePDF({ invoice, company, customer, lines, template, qrDataUrl }: Props) {
  const tpl = PDF_TEMPLATES[template ?? ""] ?? PDF_TEMPLATES["klasik-standart"];
  const accent = tpl.accent;

  const sorted = [...lines].sort((a, b) => a.sort_order - b.sort_order);
  const vatByRate: Record<number, { net: number; vat: number }> = {};
  sorted.forEach((l) => {
    const r = l.vat_rate;
    vatByRate[r] = vatByRate[r] ?? { net: 0, vat: 0 };
    vatByRate[r].net += l.line_total;
    vatByRate[r].vat += l.vat_amount;
  });
  const vatRates = Object.keys(vatByRate).map(Number).filter((r) => vatByRate[r].net !== 0).sort((a, b) => b - a);
  const rounding = invoice.total - (invoice.subtotal + invoice.vat_amount);

  // "Att betala" özet bandı: band şablonlarda renkli (beyaz yazı), diğerlerinde gri (accent tutar)
  const bandBg = tpl.band ? tpl.bandBg! : "#f3f4f6";
  const bandFg = tpl.band ? "#ffffff" : "#111827";
  const bandSub = tpl.band ? "rgba(255,255,255,0.75)" : "#6b7280";
  const bandAmt = tpl.band ? "#ffffff" : accent;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 1) Üst: logo + firma satırı (sol) · Faktura + sida (sağ) */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <View style={{ maxWidth: "62%" }}>
            {company.logo_url ? <Image src={company.logo_url} style={styles.logo} /> : <Text style={styles.companyName}>{company.name}</Text>}
            <Text style={styles.companyLine}>
              {company.name}, {company.address_line1}, {company.postal_code} {company.city}
            </Text>
          </View>
          <View>
            <Text style={[styles.fakturaTitle, { color: accent }]}>Faktura</Text>
            <Text style={styles.sida}>sida 1/1</Text>
          </View>
        </View>

        {/* 2) Alıcı (Mottagare) */}
        <View style={{ alignItems: "flex-end", marginTop: 28, marginBottom: 28 }}>
          <View style={{ width: 240 }}>
            <Text style={styles.recipientName}>{customer.name}</Text>
            <Text style={styles.recipientLine}>{customer.address_line1}</Text>
            {customer.address_line2 ? <Text style={styles.recipientLine}>{customer.address_line2}</Text> : null}
            <Text style={styles.recipientLine}>{customer.postal_code} {customer.city}</Text>
          </View>
        </View>

        {/* 3) "Att betala" özet bandı (tam genişlik) */}
        <View style={{ marginHorizontal: -40, paddingHorizontal: 40, paddingVertical: 16, backgroundColor: bandBg, flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <View style={{ flex: 1.3 }}>
            <Text style={[styles.bandLabelSm, { color: bandSub }]}>Att betala (inkl. moms)</Text>
            <Text style={[styles.bandBig, { color: bandAmt }]}>{fmt(invoice.total)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bandColLabel, { color: bandSub }]}>Förfallodatum</Text>
            <Text style={[styles.bandColVal, { color: bandFg }]}>{fmtDate(invoice.due_date)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bandColLabel, { color: bandSub }]}>Bankgiro</Text>
            <Text style={[styles.bandColVal, { color: bandFg }]}>{company.bankgiro ?? "—"}</Text>
          </View>
          <View style={{ flex: 1.4 }}>
            <Text style={[styles.bandColLabel, { color: bandSub }]}>OCR/Referensnr.</Text>
            <Text style={[styles.bandColVal, { color: bandFg }]}>{invoice.ocr_number ?? invoice.invoice_number}</Text>
          </View>
        </View>

        {/* 4) Bilgi kutusu */}
        <View style={styles.infoBox}>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}><Text style={styles.infoKey}>Fakturanummer</Text><Text style={styles.infoVal}>{invoice.invoice_number}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoKey}>Utställare</Text><Text style={styles.infoVal}>{company.name}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoKey}>Mottagare</Text><Text style={styles.infoVal}>{customer.name}</Text></View>
          </View>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}><Text style={styles.infoKey}>Fakturadatum</Text><Text style={styles.infoVal}>{fmtDate(invoice.invoice_date)}</Text></View>
            {customer.org_no ? <View style={styles.infoRow}><Text style={styles.infoKey}>Org.nr</Text><Text style={styles.infoVal}>{customer.org_no}</Text></View> : null}
            {invoice.your_reference ? <View style={styles.infoRow}><Text style={styles.infoKey}>Er referens</Text><Text style={styles.infoVal}>{invoice.your_reference}</Text></View> : null}
          </View>
        </View>

        {/* 5) Satırlar */}
        <View style={styles.thRow}>
          <Text style={[styles.th, { flex: 1 }]}>Beskrivning</Text>
          <Text style={[styles.th, styles.cQty]}>Antal/À-pris</Text>
          <Text style={[styles.th, styles.cVat]}>Moms</Text>
          <Text style={[styles.th, styles.cAmt, { color: "#6b7280" }]}>Pris inkl. moms</Text>
        </View>
        {sorted.map((l, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.cDesc}>{l.description}</Text>
            <Text style={styles.cQty}>{l.quantity} {l.unit} × {fmt(l.unit_price)}</Text>
            <Text style={styles.cVat}>{l.vat_rate}%</Text>
            <Text style={[styles.cAmt, { color: "#111827" }]}>{fmt(l.line_total + l.vat_amount)}</Text>
          </View>
        ))}

        {/* 6) Toplam (+ banka QR'ı, sola) */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 14 }}>
          {qrDataUrl ? (
            <View style={{ alignItems: "center", width: 110 }}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={qrDataUrl} style={{ width: 96, height: 96 }} />
              <Text style={{ fontSize: 7, color: "#6b7280", marginTop: 3, textAlign: "center" }}>Skanna i bankappen{"\n"}för att betala</Text>
            </View>
          ) : <View />}
          <View style={styles.sumBox}>
            <View style={styles.sumHead}>
              <Text style={[styles.sumLabel, { fontSize: 8, color: "#6b7280" }]}> </Text>
              <Text style={[styles.sumHeadCell, { width: 90 }]}>Netto</Text>
              <Text style={[styles.sumHeadCell, { width: 70 }]}>Moms</Text>
              <Text style={[styles.sumHeadCell, { width: 90 }]}>Summering</Text>
            </View>
            {vatRates.map((r) => (
              <View key={r} style={styles.sumRow}>
                <Text style={styles.sumLabel}>{r}% Moms</Text>
                <Text style={[styles.sumCell, { width: 90 }]}>{fmt(vatByRate[r].net)}</Text>
                <Text style={[styles.sumCell, { width: 70 }]}>{fmt(vatByRate[r].vat)}</Text>
                <Text style={[styles.sumCell, { width: 90, fontFamily: "Helvetica-Bold", color: "#111827" }]}>{fmt(vatByRate[r].net + vatByRate[r].vat)}</Text>
              </View>
            ))}
            {Math.abs(rounding) >= 0.005 && (
              <View style={styles.sumRow}>
                <Text style={styles.sumLabel}>Öresavrundning</Text>
                <Text style={[styles.sumCell, { width: 90 }]}> </Text>
                <Text style={[styles.sumCell, { width: 70 }]}> </Text>
                <Text style={[styles.sumCell, { width: 90 }]}>{fmt(rounding)}</Text>
              </View>
            )}
            <View style={styles.attRow}>
              <Text style={[styles.attText, { color: accent }]}>Att betala {fmt(invoice.total)}</Text>
            </View>
          </View>
        </View>

        {/* 7) Alt ödeme şeridi (giro) */}
        <View style={styles.giro} fixed>
          <View>
            <Text style={styles.giroLabel}>Referensnr (OCR)</Text>
            <Text style={styles.giroVal}>{invoice.ocr_number ?? invoice.invoice_number}</Text>
          </View>
          <View>
            <Text style={styles.giroLabel}>Att betala</Text>
            <Text style={styles.giroVal}>{fmt(invoice.total)}</Text>
          </View>
          <View>
            <Text style={styles.giroLabel}>Bankgiro</Text>
            <Text style={styles.giroVal}>{company.bankgiro ?? "—"}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
