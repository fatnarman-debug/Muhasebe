import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getStripe } from "@/lib/stripe";

/**
 * Skickar kunden till Stripes egen sida for prenumerationen, dar den gar att
 * saga upp, byta kort och hamta kvitton.
 *
 * Prissidan lovar "Säg upp när du vill". Gar uppsagningen bara via ett mejl
 * till supporten ar det inte sant - det ar vi som sager upp, nar vi hinner.
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

export async function POST() {
  const supabase = await userClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Du måste vara inloggad." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles").select("stripe_customer_id").eq("id", user.id).maybeSingle();

  // Kund-id:t hamtas ur den inloggades egen profil, aldrig ur begaran. Kom det
  // utifran skulle vem som helst kunna oppna nagon annans prenumeration.
  const kundId = profile?.stripe_customer_id;
  if (!kundId) {
    return NextResponse.json(
      { error: "Du har ingen prenumeration att hantera ännu." },
      { status: 400 }
    );
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: kundId,
      return_url: `${BASE}/dashboard/settings`,
      locale: "sv",
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[portal] Stripe-fel:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Kunde inte öppna sidan." }, { status: 502 });
  }
}
