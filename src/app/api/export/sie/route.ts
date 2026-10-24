import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { byggSie, type SieFaktura } from "@/lib/sie";

/* SIE4-export av kundfakturor for inlasning i byrans bokforingsprogram.
   Kors med anvandarens egen session - radnivasakerheten avgor vilka
   fakturor som kommer med, sa ingen kan exportera nagon annans bokforing. */

async function userClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
      },
    }
  );
}

export async function GET(req: Request) {
  const supabase = await userClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Du måste vara inloggad." }, { status: 401 });

  const url = new URL(req.url);
  const foretagId = url.searchParams.get("foretag");
  const ar = Number(url.searchParams.get("ar") ?? new Date().getFullYear());
  if (!foretagId) return NextResponse.json({ error: "Välj ett klientföretag." }, { status: 400 });
  if (!Number.isInteger(ar) || ar < 2000 || ar > 2100) {
    return NextResponse.json({ error: "Ogiltigt år." }, { status: 400 });
  }

  const start = `${ar}-01-01`;
  const slut = `${ar}-12-31`;

  const { data: foretag, error: fErr } = await supabase
    .from("client_companies")
    .select("id, name, org_no")
    .eq("id", foretagId)
    .single();
  if (fErr || !foretag) {
    return NextResponse.json({ error: "Klientföretaget hittades inte." }, { status: 404 });
  }

  // Offerter och utkast ska inte bokforas - bara skickade fakturor.
  const { data: fakturor, error: iErr } = await supabase
    .from("invoices")
    .select("invoice_number, invoice_date, subtotal, vat_amount, total, rot_rut_amount, reverse_charge, doc_type, status, customers(name), invoice_lines(line_total, vat_amount, vat_rate)")
    .eq("client_company_id", foretagId)
    .gte("invoice_date", start)
    .lte("invoice_date", slut)
    .in("status", ["sent", "paid", "overdue", "credit"])
    .order("invoice_date");

  if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });

  const underlag: SieFaktura[] = (fakturor ?? [])
    .filter((f) => (f as { doc_type?: string }).doc_type !== "offert")
    .map((f) => {
      const kund = f.customers as unknown as { name?: string } | { name?: string }[] | null;
      const namn = Array.isArray(kund) ? kund[0]?.name : kund?.name;
      return {
        invoice_number: f.invoice_number,
        invoice_date: f.invoice_date,
        customer_name: namn ?? "",
        subtotal: Number(f.subtotal ?? 0),
        vat_amount: Number(f.vat_amount ?? 0),
        total: Number(f.total ?? 0),
        rot_rut_amount: f.rot_rut_amount == null ? null : Number(f.rot_rut_amount),
        reverse_charge: (f as { reverse_charge?: boolean }).reverse_charge ?? null,
        lines: (f.invoice_lines ?? []).map((r: { line_total: number; vat_amount: number; vat_rate: number }) => ({
          line_total: Number(r.line_total ?? 0),
          vat_amount: Number(r.vat_amount ?? 0),
          vat_rate: Number(r.vat_rate ?? 0),
        })),
      };
    });

  const { fil, antal, uteslutna } = byggSie(
    { name: foretag.name, org_no: foretag.org_no },
    underlag,
    { start, slut }
  );

  // Uteslutna fakturor far inte passera tyst - mottagaren ska se att
  // filen inte ar komplett. Headern lases av granssnittet.
  const rubriker: Record<string, string> = {
    "Content-Type": "application/octet-stream",
    "Content-Disposition": `attachment; filename="${foretag.name.replace(/[^\w\-]+/g, "_")}_${ar}.si"`,
    "Cache-Control": "no-store",
    "X-Sie-Antal": String(antal),
  };
  if (uteslutna.length) {
    rubriker["X-Sie-Uteslutna"] = encodeURIComponent(JSON.stringify(uteslutna));
  }

  return new NextResponse(Buffer.from(fil), { headers: rubriker });
}
