import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/InvoicePDF";
import { generateInvoiceQr } from "@/lib/invoice-qr";
import { logEmail, logError } from "@/lib/app-logs";
import { Resend } from "resend";
import type { ClientCompany, Customer, Invoice, InvoiceLine } from "@/types/database";
import { createElement } from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customers(*), client_companies(*), invoice_lines(*)")
    .eq("id", id)
    .single();

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Yetki RLS ile sağlanıyor (sahip veya atanan muhasebeci); ek sahip kontrolü konsult'u engellerdi.
  const company = invoice.client_companies as unknown as ClientCompany & { user_id: string; invoice_template?: string };

  const customer = invoice.customers as unknown as Customer;
  const lines = invoice.invoice_lines as unknown as InvoiceLine[];
  const inv = invoice as unknown as Invoice;

  const isOffert = inv.doc_type === "offert";
  const isCredit = inv.doc_type === "credit";
  const hidePay = isOffert || isCredit;
  const docLabel = isOffert ? "Offert" : isCredit ? "Kreditfaktura" : "Faktura";
  const docLabelLc = isOffert ? "offert" : isCredit ? "kreditfaktura" : "faktura";
  const numLabel = isOffert ? "Offertnummer" : "Fakturanummer";
  const dateLabel = isOffert ? "Giltigt t.o.m." : isCredit ? "Krediteringsdatum" : "Förfallodatum";

  if (!customer.email) {
    return NextResponse.json({ error: "Kunden har ingen e-postadress." }, { status: 400 });
  }

  // Kreditfaktura: hangi faturayı kredite ettiğine dair görünür referans (PDF + not)
  let creditRef: string | null = null;
  if (isCredit && inv.credited_invoice_id) {
    const { data: orig } = await supabase
      .from("invoices").select("invoice_number, invoice_date")
      .eq("id", inv.credited_invoice_id).maybeSingle();
    if (orig) creditRef = `Avser faktura ${orig.invoice_number} (${orig.invoice_date})`;
  }

  // HTML-escape för all användarstyrd text i e-postmallen (förhindrar HTML-injektion)
  const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  // Generate PDF (offert & kreditfaktura → ingen QR/betalning)
  const qrDataUrl = hidePay ? null : await generateInvoiceQr(inv, company);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(
    createElement(InvoicePDF, { invoice: inv, company, customer, lines, template: company.invoice_template, qrDataUrl, docType: inv.doc_type, creditRef }) as any
  );

  const formattedTotal = new Intl.NumberFormat("sv-SE", {
    style: "currency", currency: "SEK", minimumFractionDigits: 2,
  }).format(inv.total);

  const formattedDue = new Intl.DateTimeFormat("sv-SE").format(new Date(inv.due_date));

  const { error: sendError } = await resend.emails.send({
    from: `${company.name} <faktura@resend.dev>`,
    to: customer.email,
    subject: `${docLabel} ${inv.invoice_number} från ${company.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <h2 style="color:#1e40af">${docLabel} ${esc(inv.invoice_number)}</h2>
        <p>Hej ${esc(customer.name)},</p>
        <p>Bifogat hittar du ${docLabelLc} <strong>${esc(inv.invoice_number)}</strong> från <strong>${esc(company.name)}</strong>.${isCredit && creditRef ? ` ${esc(creditRef)}.` : ""}</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;background:#f8fafc;border-radius:8px;overflow:hidden">
          <tr><td style="padding:12px 16px;color:#6b7280;font-size:14px">${numLabel}</td><td style="padding:12px 16px;font-weight:600">${esc(inv.invoice_number)}</td></tr>
          <tr style="background:#f1f5f9"><td style="padding:12px 16px;color:#6b7280;font-size:14px">Belopp</td><td style="padding:12px 16px;font-weight:600;font-size:18px;color:#1e40af">${formattedTotal}</td></tr>
          <tr><td style="padding:12px 16px;color:#6b7280;font-size:14px">${dateLabel}</td><td style="padding:12px 16px;font-weight:600;color:${hidePay ? "#111" : "#dc2626"}">${formattedDue}</td></tr>
          ${!hidePay && inv.ocr_number ? `<tr style="background:#f1f5f9"><td style="padding:12px 16px;color:#6b7280;font-size:14px">OCR-nummer</td><td style="padding:12px 16px;font-weight:600;font-family:monospace">${esc(inv.ocr_number)}</td></tr>` : ""}
          ${!hidePay && company.bankgiro ? `<tr><td style="padding:12px 16px;color:#6b7280;font-size:14px">Bankgiro</td><td style="padding:12px 16px;font-weight:600">${esc(company.bankgiro)}</td></tr>` : ""}
        </table>
        ${inv.notes ? `<p style="color:#4b5563;font-size:14px">${esc(inv.notes)}</p>` : ""}
        <p style="color:#6b7280;font-size:13px">${isOffert ? "Offerten" : isCredit ? "Kreditfakturan" : "Fakturan"} finns bifogad som PDF.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">${esc(company.name)} · ${esc(company.address_line1)}, ${esc(company.postal_code)} ${esc(company.city)}</p>
      </div>
    `,
    attachments: [{
      filename: `${inv.invoice_number}.pdf`,
      content: Buffer.from(pdfBuffer).toString("base64"),
    }],
  });

  if (sendError) {
    await logEmail({ kind: "invoice", status: "failed", toEmail: customer.email, subject: `${docLabel} ${inv.invoice_number}`, invoiceId: inv.id, invoiceNumber: inv.invoice_number, companyName: company.name, errorMessage: sendError.message });
    await logError({ scope: "invoice.send", message: sendError.message, detail: { invoiceId: inv.id }, userId: user.id });
    return NextResponse.json({ error: sendError.message }, { status: 500 });
  }

  await logEmail({ kind: "invoice", status: "sent", toEmail: customer.email, subject: `${docLabel} ${inv.invoice_number}`, invoiceId: inv.id, invoiceNumber: inv.invoice_number, companyName: company.name });

  // Update status to sent
  await supabase
    .from("invoices")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
