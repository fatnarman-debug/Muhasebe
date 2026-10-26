import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getStripe, prisFor, arPlanId, arInterval, trialEndFor, MOMS_SKATTESATS,
} from "@/lib/stripe";

/**
 * Oppnar en betalning i Stripe Checkout.
 *
 * Kortuppgifter passerar aldrig den har servern - besokaren skickas till
 * Stripes egen sida och kommer tillbaka darifran.
 */

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

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enkeltfaktura.com";

export async function POST(req: Request) {
  const supabase = await userClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Du måste vara inloggad." }, { status: 401 });
  }

  let body: { plan?: unknown; interval?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig begäran." }, { status: 400 });
  }

  // Klienten far valja plan och betalningsperiod - ingenting annat. Beloppet
  // slas upp har; kom det utifran skulle det ga att andra.
  const { plan, interval } = body;
  if (!arPlanId(plan) || !arInterval(interval)) {
    return NextResponse.json({ error: "Okänd plan." }, { status: 400 });
  }

  const price = prisFor(plan, interval);
  if (!price) {
    // Konfigurationsfel, inte anvandarfel. Sidan visar sitt reservmeddelande
    // och ber besokaren hora av sig - battre an en teknisk text.
    console.error(`[checkout] price-id saknas for ${plan}/${interval}`);
    return NextResponse.json({ error: "Betalningen är inte konfigurerad." }, { status: 503 });
  }

  // Priserna anges utan moms. Saknas skattesatsen skulle Stripe ta betalt
  // utan moms, kvittot bli fel och skillnaden bli var att betala i efterhand.
  // Det ar ett tyst fel, sa betalningen stoppas hellre helt.
  if (!MOMS_SKATTESATS) {
    console.error("[checkout] STRIPE_TAX_RATE_SE saknas - vagrar ta betalt utan moms");
    return NextResponse.json({ error: "Betalningen är inte konfigurerad." }, { status: 503 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, trial_ends_at")
    .eq("id", user.id)
    .maybeSingle();

  try {
    // Ateranvand kunden om den finns, annars later vi Stripe skapa en via
    // e-postadressen. Skapar vi en ny varje gang far samma person flera
    // kundposter och historiken splittras.
    const befintligKund = profile?.stripe_customer_id ?? undefined;

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      customer: befintligKund,
      customer_email: befintligKund ? undefined : (user.email ?? undefined),
      // Nyckeln tillbaka till ratt konto nar Stripe hor av sig. Metadata satts
      // bade pa sessionen och pa prenumerationen: webhookarna far inte alltid
      // med sig sessionen.
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id, plan },
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan },
        trial_end: trialEndFor(profile?.trial_ends_at),
        default_tax_rates: [MOMS_SKATTESATS],
      },
      // Kvittot ska ga att bokfora, sa adress och momsnummer samlas in.
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${BASE}/dashboard?betalning=klar`,
      cancel_url: `${BASE}/uppgradera?avbruten=1`,
    });

    if (!session.url) {
      console.error("[checkout] Stripe gav ingen url", session.id);
      return NextResponse.json({ error: "Kunde inte starta betalningen." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[checkout] Stripe-fel:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Kunde inte starta betalningen." }, { status: 502 });
  }
}
