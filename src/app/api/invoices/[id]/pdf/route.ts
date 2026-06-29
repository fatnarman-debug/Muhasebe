import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/InvoicePDF";
import { generateInvoiceQr } from "@/lib/invoice-qr";
import type { ClientCompany, Customer, Invoice, InvoiceLine } from "@/types/database";
import { createElement } from "react";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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

  // Yetki: RLS faturayı yalnızca sahibine VEYA atanan muhasebeciye döndürür.
  // invoice null değilse kullanıcı yetkilidir; ayrı sahip kontrolü konsult'u engellerdi.
  const company = invoice.client_companies as unknown as ClientCompany & { user_id: string; invoice_template?: string };
  const customer = invoice.customers as unknown as Customer;
  const lines = invoice.invoice_lines as unknown as InvoiceLine[];
  const inv = invoice as unknown as Invoice;
  const isOffert = inv.doc_type === "offert";
  const isCredit = inv.doc_type === "credit";

  // Offert & kreditfaktura ödeme talebi değildir → QR üretilmez
  const qrDataUrl = isOffert || isCredit ? null : await generateInvoiceQr(inv, company);

  // Kreditfaktura: hangi faturayı kredite ettiğine dair görünür referans
  let creditRef: string | null = null;
  if (isCredit && inv.credited_invoice_id) {
    const { data: orig } = await supabase
      .from("invoices")
      .select("invoice_number, invoice_date")
      .eq("id", inv.credited_invoice_id)
      .maybeSingle();
    if (orig) creditRef = `Avser faktura ${orig.invoice_number} (${orig.invoice_date})`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(
    createElement(InvoicePDF, { invoice: inv, company, customer, lines, template: company.invoice_template, qrDataUrl, docType: inv.doc_type, creditRef }) as any
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`,
    },
  });
}
