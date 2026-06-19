import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/InvoicePDF";
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

  const company = invoice.client_companies as unknown as ClientCompany & { user_id: string };
  if (company?.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const customer = invoice.customers as unknown as Customer;
  const lines = invoice.invoice_lines as unknown as InvoiceLine[];
  const inv = invoice as unknown as Invoice;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(
    createElement(InvoicePDF, { invoice: inv, company, customer, lines }) as any
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`,
    },
  });
}
