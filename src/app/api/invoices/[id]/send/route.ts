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
  const docLabel = isOffert ? "Offert" : "Faktura";        // Offert / Faktura
  const numLabel = isOffert ? "Offertnummer" : "Fakturanummer";
  const dateLabel = isOffert ? "Giltigt t.o.m." : "Förfallodatum";

  if (!customer.email) {
    return NextResponse.json({ error: "Kunden har ingen e-postadress." }, { status: 400 });
  }

  // Generate PDF (offert → ingen QR/betalning)
  const qrDataUrl = isOffert ? null : await generateInvoiceQr(inv, company);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(
    createElement(InvoicePDF, { invoice: inv, company, customer, lines, template: company.invoice_template, qrDataUrl, docType: inv.doc_type }) as any
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
        <h2 style="color:#1e40af">${docLabel} ${inv.invoice_number}</h2>
        <p>Hej ${customer.name},</p>
        <p>Bifogat hittar du ${isOffert ? "offert" : "faktura"} <strong>${inv.invoice_number}</strong> från <strong>${company.name}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;background:#f8fafc;border-radius:8px;overflow:hidden">
          <tr><td style="padding:12px 16px;color:#6b7280;font-size:14px">${numLabel}</td><td style="padding:12px 16px;font-weight:600">${inv.invoice_number}</td></tr>
          <tr style="background:#f1f5f9"><td style="padding:12px 16px;color:#6b7280;font-size:14px">Belopp</td><td style="padding:12px 16px;font-weight:600;font-size:18px;color:#1e40af">${formattedTotal}</td></tr>
          <tr><td style="padding:12px 16px;color:#6b7280;font-size:14px">${dateLabel}</td><td style="padding:12px 16px;font-weight:600;color:#dc2626">${formattedDue}</td></tr>
          ${!isOffert && inv.ocr_number ? `<tr style="background:#f1f5f9"><td style="padding:12px 16px;color:#6b7280;font-size:14px">OCR-nummer</td><td style="padding:12px 16px;font-weight:600;font-family:monospace">${inv.ocr_number}</td></tr>` : ""}
          ${!isOffert && company.bankgiro ? `<tr><td style="padding:12px 16px;color:#6b7280;font-size:14px">Bankgiro</td><td style="padding:12px 16px;font-weight:600">${company.bankgiro}</td></tr>` : ""}
        </table>
        ${inv.notes ? `<p style="color:#4b5563;font-size:14px">${inv.notes}</p>` : ""}
        <p style="color:#6b7280;font-size:13px">${isOffert ? "Offerten" : "Fakturan"} finns bifogad som PDF.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">${company.name} · ${company.address_line1}, ${company.postal_code} ${company.city}</p>
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
