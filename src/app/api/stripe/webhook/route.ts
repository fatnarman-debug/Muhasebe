import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { getStripe, tillVarStatus } from "@/lib/stripe";

/**
 * Tar emot Stripes handelser och skriver om prenumerationen i profiles.
 *
 * Tre saker avgor om det har ar sakert:
 *
 * 1. Signaturen kontrolleras mot STRIPE_WEBHOOK_SECRET. Adressen ar oppen mot
 *    internet, sa utan den kontrollen kan vem som helst skicka en begaran och
 *    sjalv bli betalande kund.
 *
 * 2. Kroppen lases som text, inte json. Signaturen galler exakt de bytes
 *    Stripe skickade; parsas kroppen forst stammer den inte langre.
 *
 * 3. Skrivningen gors med service_role. Triggern protect_subscription_columns
 *    hindrar vanliga anvandare fran att rora de har kolumnerna och gor undantag
 *    just for service_role.
 *
 * Handelser kan komma flera ganger och i fel ordning. Allt harunder skriver
 * darfor hela tillstandet pa nytt i stallet for att andra stegvis, sa att
 * samma handelse tva ganger ger samma resultat.
 */

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/** Hittar vilken anvandare en prenumeration hor till. */
async function hittaAnvandare(sub: Stripe.Subscription): Promise<string | null> {
  const franMetadata = sub.metadata?.supabase_user_id;
  if (franMetadata) return franMetadata;

  // Prenumerationer som skapats pa annat satt, till exempel i Stripes panel,
  // saknar metadata. Da far kund-id:t leda tillbaka.
  const kundId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!kundId) return null;

  const { data } = await adminClient()
    .from("profiles").select("id").eq("stripe_customer_id", kundId).maybeSingle();
  return data?.id ?? null;
}

async function skrivPrenumeration(sub: Stripe.Subscription) {
  const userId = await hittaAnvandare(sub);
  if (!userId) {
    // Ingen traff: troligen en prenumeration som inte hor till den har appen.
    // Logga och slapp igenom - svarar vi med fel forsoker Stripe om i dagar.
    console.warn("[stripe-webhook] hittade ingen anvandare for", sub.id);
    return;
  }

  const kundId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

  // Det som avgor om kunden slapps in skrivs for sig.
  //
  // Forst lag planens namn med i samma uppdatering. Kolumnen hade ett villkor
  // fran en aldre prismodell och slappte inte igenom 'egen', sa hela raden
  // avvisades: kunden betalade, statusen skrevs aldrig om och kontot forblev
  // utelast. Ett falt som bara visas i superadmin far inte kunna stoppa det
  // falt som styr atkomsten.
  const { error } = await adminClient()
    .from("profiles")
    .update({
      subscription_status: tillVarStatus(sub.status),
      stripe_subscription_id: sub.id,
      ...(kundId ? { stripe_customer_id: kundId } : {}),
    })
    .eq("id", userId);

  if (error) {
    // Kastas vidare sa att Stripe forsoker igen. Ett tappat
    // "betalningen gick igenom" ar varre an en extra leverans.
    throw new Error(`kunde inte uppdatera profilen: ${error.message}`);
  }

  // Planens namn ar till for att kunna se vem som koper vad. Misslyckas den
  // har loggas det, men begaran far inte falla - atkomsten ar redan satt.
  const plan = sub.metadata?.plan;
  if (plan) {
    const { error: planFel } = await adminClient()
      .from("profiles").update({ subscription_tier: plan }).eq("id", userId);
    if (planFel) {
      console.warn(`[stripe-webhook] kunde inte spara plannamn "${plan}":`, planFel.message);
    }
  }
}

export async function POST(req: Request) {
  const hemlighet = process.env.STRIPE_WEBHOOK_SECRET;
  if (!hemlighet) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET saknas");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const signatur = req.headers.get("stripe-signature");
  if (!signatur) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Rakroppen, inte json - se punkt 2 ovan.
  const rakropp = await req.text();

  let handelse: Stripe.Event;
  try {
    handelse = getStripe().webhooks.constructEvent(rakropp, signatur, hemlighet);
  } catch (e) {
    console.error("[stripe-webhook] ogiltig signatur:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (handelse.type) {
      case "checkout.session.completed": {
        const session = handelse.data.object;
        const userId = session.client_reference_id ?? session.metadata?.supabase_user_id;
        const kundId = typeof session.customer === "string" ? session.customer : session.customer?.id;

        // Knyt kunden till kontot direkt. Sker det forst vid nasta handelse
        // kan en prenumeration hinna komma in utan att vi vet vems den ar.
        if (userId && kundId) {
          const { error } = await adminClient()
            .from("profiles").update({ stripe_customer_id: kundId }).eq("id", userId);
          if (error) throw new Error(`kunde inte spara kund-id: ${error.message}`);
        }

        // Hamta prenumerationen och skriv statusen fran den, i stallet for att
        // anta "active". Betalar kunden under provperioden ar den `trialing`.
        const subId = typeof session.subscription === "string"
          ? session.subscription : session.subscription?.id;
        if (subId) {
          const sub = await getStripe().subscriptions.retrieve(subId);
          await skrivPrenumeration(sub);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await skrivPrenumeration(handelse.data.object);
        break;
      }

      case "invoice.payment_failed": {
        // Ingen atgard har. Stripe satter prenumerationen till past_due och
        // skickar en subscription.updated, som fangas ovan. Skrivs statusen
        // aven har kan de tva handelserna komma i fel ordning och ta ut
        // varandra.
        console.warn("[stripe-webhook] betalning misslyckades:", handelse.data.object.id);
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error(`[stripe-webhook] fel vid ${handelse.type}:`, e instanceof Error ? e.message : e);
    // 500 far Stripe att forsoka igen. Handlingarna ovan gar att upprepa.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
