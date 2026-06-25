import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/InvoicePDF";
import { generateInvoiceQr } from "@/lib/invoice-qr";
import { Resend } from "resend";
import type { ClientCompany, Customer, Invoice, InvoiceLine } from "@/types/database";
import { createElement } from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { reminderFee = 0 } = await req.json().catch(() => ({}));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customers(*), client_companies(*), invoice_lines(*)")
    .eq("id", id)
    .single();

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Yetki RLS ile sağlanıyor (sahip veya atanan muhasebeci).
  const company = invoice.client_companies as unknown as ClientCompany & { user_id: string; invoice_template?: string };

  const customer = invoice.customers as unknown as Customer;
  const lines = invoice.invoice_lines as unknown as InvoiceLine[];
  const inv = invoice as unknown as Invoice;

  if (!customer.email) {
    return NextResponse.json({ error: "Kunden har ingen e-postadress." }, { status: 400 });
  }

  // Generate PDF
  const qrDataUrl = await generateInvoiceQr(inv, company);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(
    createElement(InvoicePDF, { invoice: inv, company, customer, lines, template: company.invoice_template, qrDataUrl }) as any
  );

  const formattedTotal = new Intl.NumberFormat("sv-SE", {
    style: "currency", currency: "SEK", minimumFractionDigits: 2,
  }).format(inv.total + reminderFee);

  const formattedDue = new Intl.DateTimeFormat("sv-SE").format(new Date(inv.due_date));
  const today = new Intl.DateTimeFormat("sv-SE").format(new Date());

  const daysOverdue = Math.floor((Date.now() - new Date(inv.due_date).getTime()) / 86400000);

  const { error: sendError } = await resend.emails.send({
    from: `${company.name} <faktura@resend.dev>`,
    to: customer.email,
    subject: `PÅMINNELSE: Faktura ${inv.invoice_number} från ${company.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#dc2626;color:white;padding:12px 20px;border-radius:8px 8px 0 0;font-size:13px;font-weight:700;letter-spacing:1px;">
          PÅMINNELSE
        </div>
        <div style="border:2px solid #dc2626;border-top:none;padding:24px;border-radius:0 0 8px 8px;margin-bottom:24px">
          <h2 style="color:#dc2626;margin-top:0">Obetald faktura — ${daysOverdue} dagar försenad</h2>
          <p>Hej ${customer.name},</p>
          <p>Vi har noterat att följande faktura ännu inte betalts. Vänligen reglera betalningen snarast.</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#fef2f2;border-radius:8px;overflow:hidden">
            <tr><td style="padding:12px 16px;color:#6b7280;font-size:14px">Fakturanummer</td><td style="padding:12px 16px;font-weight:600">${inv.invoice_number}</td></tr>
            <tr style="background:#fee2e2"><td style="padding:12px 16px;color:#6b7280;font-size:14px">Ursprungligt förfallodatum</td><td style="padding:12px 16px;font-weight:600;color:#dc2626">${formattedDue}</td></tr>
            <tr><td style="padding:12px 16px;color:#6b7280;font-size:14px">Fakturabelopp</td><td style="padding:12px 16px;font-weight:600">${new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", minimumFractionDigits: 2 }).format(inv.total)}</td></tr>
            ${reminderFee > 0 ? `<tr style="background:#fee2e2"><td style="padding:12px 16px;color:#6b7280;font-size:14px">Påminnelseavgift</td><td style="padding:12px 16px;font-weight:600;color:#dc2626">+ ${new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", minimumFractionDigits: 2 }).format(reminderFee)}</td></tr>` : ""}
            <tr style="background:#fecaca"><td style="padding:12px 16px;color:#991b1b;font-size:14px;font-weight:700">Totalt att betala</td><td style="padding:12px 16px;font-weight:700;font-size:18px;color:#991b1b">${formattedTotal}</td></tr>
            ${inv.ocr_number ? `<tr><td style="padding:12px 16px;color:#6b7280;font-size:14px">OCR-nummer</td><td style="padding:12px 16px;font-weight:600;font-family:monospace">${inv.ocr_number}</td></tr>` : ""}
            ${company.bankgiro ? `<tr style="background:#fef2f2"><td style="padding:12px 16px;color:#6b7280;font-size:14px">Bankgiro</td><td style="padding:12px 16px;font-weight:600">${company.bankgiro}</td></tr>` : ""}
          </table>

          <p style="color:#4b5563;font-size:13px">Datumet för påminnelsen är ${today}. Kontakta oss omgående om du anser att detta är felaktigt.</p>
          <p style="color:#6b7280;font-size:12px">Originalfakturan finns bifogad som PDF.</p>
        </div>
        <p style="color:#9ca3af;font-size:11px;text-align:center">${company.name} · ${company.address_line1}, ${company.postal_code} ${company.city}</p>
      </div>
    `,
    attachments: [{
      filename: `PAMINNELSE-${inv.invoice_number}.pdf`,
      content: Buffer.from(pdfBuffer).toString("base64"),
    }],
  });

  if (sendError) {
    return NextResponse.json({ error: sendError.message }, { status: 500 });
  }

  // Mark as overdue if not already
  if (inv.status === "sent") {
    await supabase.from("invoices").update({ status: "overdue" }).eq("id", id);
  }

  return NextResponse.json({ ok: true });
}
