import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import type { ClientCompany, Customer, Invoice, InvoiceLine } from "@/types/database";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: "#1a1a1a", padding: 48, backgroundColor: "#ffffff" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  logo: { width: 120, height: 48, objectFit: "contain" },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  companyMeta: { fontSize: 8, color: "#666", lineHeight: 1.5 },
  invoiceLabel: { fontSize: 28, fontFamily: "Helvetica-Bold", color: "#1e40af", textAlign: "right" },
  invoiceNumber: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#1e40af", textAlign: "right", marginTop: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 16 },
  twoCol: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  col: { width: "48%" },
  label: { fontSize: 7, color: "#9ca3af", fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginBottom: 4 },
  value: { fontSize: 9, color: "#111827", lineHeight: 1.6 },
  valueBold: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827", lineHeight: 1.6 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 24 },
  metaItem: { width: "30%" },
  table: { marginBottom: 8 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: "6 8", borderRadius: 3 },
  tableRow: { flexDirection: "row", padding: "6 8", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  thDesc: { flex: 1, fontSize: 7, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase" },
  thRight: { width: 60, fontSize: 7, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", textAlign: "right" },
  thVat: { width: 40, fontSize: 7, fontFamily: "Helvetica-Bold", color: "#6b7280", textTransform: "uppercase", textAlign: "right" },
  tdDesc: { flex: 1, fontSize: 9, color: "#111827" },
  tdRight: { width: 60, fontSize: 9, color: "#374151", textAlign: "right" },
  tdVat: { width: 40, fontSize: 9, color: "#6b7280", textAlign: "right" },
  totalsBox: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  totalsInner: { width: 200 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", padding: "3 0" },
  totalLabel: { fontSize: 9, color: "#6b7280" },
  totalValue: { fontSize: 9, color: "#374151", textAlign: "right" },
  totalBoldLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827" },
  totalBoldValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827", textAlign: "right" },
  totalDivider: { borderTopWidth: 1.5, borderTopColor: "#111827", marginVertical: 4 },
  paymentBox: { backgroundColor: "#eff6ff", borderRadius: 4, padding: 12, marginTop: 24 },
  paymentTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1e40af", marginBottom: 4 },
  paymentRow: { flexDirection: "row", gap: 24 },
  paymentItem: { flexDirection: "column" },
  paymentItemLabel: { fontSize: 7, color: "#3b82f6", marginBottom: 1 },
  paymentItemValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1e3a8a" },
  notesBox: { marginTop: 16 },
  notesLabel: { fontSize: 7, color: "#9ca3af", fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginBottom: 3 },
  notesText: { fontSize: 8, color: "#4b5563", lineHeight: 1.5 },
  fskatt: { fontSize: 7, color: "#16a34a", fontFamily: "Helvetica-Bold", marginTop: 2 },
  footer: { position: "absolute", bottom: 24, left: 48, right: 48, borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 8, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#9ca3af" },
});

function fmt(n: number) {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", minimumFractionDigits: 2 }).format(n);
}
function fmtDate(d: string) {
  return new Intl.DateTimeFormat("sv-SE").format(new Date(d));
}

interface Props {
  invoice: Invoice;
  company: ClientCompany;
  customer: Customer;
  lines: InvoiceLine[];
}

export function InvoicePDF({ invoice, company, customer, lines }: Props) {
  const sorted = [...lines].sort((a, b) => a.sort_order - b.sort_order);
  const vatByRate: Record<number, number> = {};
  sorted.forEach((l) => { vatByRate[l.vat_rate] = (vatByRate[l.vat_rate] ?? 0) + l.vat_amount; });
  const vatRates = Object.keys(vatByRate).map(Number).filter((r) => vatByRate[r] > 0).sort((a, b) => b - a);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {company.logo_url ? (
              <Image src={company.logo_url} style={styles.logo} />
            ) : (
              <Text style={styles.companyName}>{company.name}</Text>
            )}
            {company.logo_url && <Text style={[styles.companyName, { marginTop: 4 }]}>{company.name}</Text>}
            <Text style={styles.companyMeta}>Org.nr: {company.org_no}</Text>
            {company.moms_no && <Text style={styles.companyMeta}>Moms.nr: {company.moms_no}</Text>}
            {company.f_skatt && <Text style={styles.fskatt}>✓ Godkänd för F-skatt</Text>}
            <Text style={[styles.companyMeta, { marginTop: 4 }]}>{company.address_line1}</Text>
            <Text style={styles.companyMeta}>{company.postal_code} {company.city}</Text>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>FAKTURA</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill to + Meta */}
        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.label}>Faktureras till</Text>
            <Text style={styles.valueBold}>{customer.name}</Text>
            {customer.org_no && <Text style={styles.value}>Org.nr: {customer.org_no}</Text>}
            <Text style={styles.value}>{customer.address_line1}</Text>
            {customer.address_line2 && <Text style={styles.value}>{customer.address_line2}</Text>}
            <Text style={styles.value}>{customer.postal_code} {customer.city}</Text>
            {customer.email && <Text style={[styles.value, { marginTop: 4 }]}>{customer.email}</Text>}
          </View>
          <View style={[styles.col, { alignItems: "flex-end" }]}>
            <View style={styles.metaGrid}>
              {[
                ["Fakturadatum", fmtDate(invoice.invoice_date)],
                ["Förfallodatum", fmtDate(invoice.due_date)],
                ["OCR-nummer", invoice.ocr_number ?? "—"],
                ...(invoice.your_reference ? [["Er referens", invoice.your_reference]] : []),
                ...(invoice.our_reference ? [["Vår referens", invoice.our_reference]] : []),
              ].map(([l, v]) => (
                <View key={l} style={{ alignItems: "flex-end", marginBottom: 8 }}>
                  <Text style={styles.label}>{l}</Text>
                  <Text style={styles.valueBold}>{v}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Lines */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.thDesc}>Beskrivning</Text>
            <Text style={styles.thRight}>Antal</Text>
            <Text style={[styles.thRight, { width: 40 }]}>Enhet</Text>
            <Text style={styles.thRight}>À-pris</Text>
            <Text style={styles.thVat}>Moms%</Text>
            <Text style={styles.thRight}>Belopp</Text>
          </View>
          {sorted.map((l, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tdDesc}>{l.description}</Text>
              <Text style={styles.tdRight}>{l.quantity}</Text>
              <Text style={[styles.tdRight, { width: 40 }]}>{l.unit}</Text>
              <Text style={styles.tdRight}>{fmt(l.unit_price)}</Text>
              <Text style={styles.tdVat}>{l.vat_rate}%</Text>
              <Text style={styles.tdRight}>{fmt(l.line_total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalsInner}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Netto (ex. moms)</Text>
              <Text style={styles.totalValue}>{fmt(invoice.subtotal)}</Text>
            </View>
            {vatRates.map((r) => (
              <View key={r} style={styles.totalRow}>
                <Text style={styles.totalLabel}>Moms {r}%</Text>
                <Text style={styles.totalValue}>{fmt(vatByRate[r])}</Text>
              </View>
            ))}
            <View style={styles.totalDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalBoldLabel}>Totalt att betala</Text>
              <Text style={styles.totalBoldValue}>{fmt(invoice.total)}</Text>
            </View>
          </View>
        </View>

        {/* Payment box */}
        <View style={styles.paymentBox}>
          <Text style={styles.paymentTitle}>Betalningsinformation</Text>
          <View style={styles.paymentRow}>
            {invoice.ocr_number && (
              <View style={styles.paymentItem}>
                <Text style={styles.paymentItemLabel}>OCR-nummer</Text>
                <Text style={styles.paymentItemValue}>{invoice.ocr_number}</Text>
              </View>
            )}
            {company.bankgiro && (
              <View style={styles.paymentItem}>
                <Text style={styles.paymentItemLabel}>Bankgiro</Text>
                <Text style={styles.paymentItemValue}>{company.bankgiro}</Text>
              </View>
            )}
            {company.swish && (
              <View style={styles.paymentItem}>
                <Text style={styles.paymentItemLabel}>Swish</Text>
                <Text style={styles.paymentItemValue}>{company.swish}</Text>
              </View>
            )}
            <View style={styles.paymentItem}>
              <Text style={styles.paymentItemLabel}>Förfallodatum</Text>
              <Text style={styles.paymentItemValue}>{fmtDate(invoice.due_date)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Meddelande</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{company.name} · {company.address_line1}, {company.postal_code} {company.city}</Text>
          <Text style={styles.footerText}>{invoice.invoice_number}</Text>
        </View>
      </Page>
    </Document>
  );
}
