import Stripe from "stripe";

/**
 * Stripe-klienten och kopplingen mellan vara planer och Stripes priser.
 *
 * Priset bestams HAR, pa servern, utifran ett plan-id. Webblasaren skickar
 * bara "egen" eller "byra" - aldrig ett belopp och aldrig ett price-id. Lat
 * aldrig nagon del av betalningen komma fran klienten: det som gar att andra
 * i en begaran kommer forr eller senare att andras.
 */

/**
 * Klienten skapas vid forsta anvandningen, inte nar modulen laddas.
 *
 * Bygget importerar route-filerna for att samla sidinformation, och da finns
 * inga nycklar. Skapas klienten direkt kraschar hela bygget pa en nyckel som
 * anda bara behovs nar nagon faktiskt betalar. Nu misslyckas i stallet den
 * enskilda begaran, med ett begripligt fel.
 *
 * API-versionen anges inte: biblioteket anvander den det byggdes for.
 */
let klient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!klient) {
    const nyckel = process.env.STRIPE_SECRET_KEY;
    if (!nyckel) throw new Error("STRIPE_SECRET_KEY saknas");
    klient = new Stripe(nyckel);
  }
  return klient;
}

export type PlanId = "egen" | "byra";
export type Interval = "month" | "year";

/** Priserna ar skapade i Stripe. Id:na ligger i miljon, inte i koden. */
const PRISER: Record<PlanId, Record<Interval, string | undefined>> = {
  egen: {
    month: process.env.STRIPE_PRICE_EGEN_MONTH,
    year: process.env.STRIPE_PRICE_EGEN_YEAR,
  },
  byra: {
    month: process.env.STRIPE_PRICE_BYRA_MONTH,
    year: process.env.STRIPE_PRICE_BYRA_YEAR,
  },
};

/** Svensk moms, 25 procent, pa priser som anges utan moms. */
export const MOMS_SKATTESATS = process.env.STRIPE_TAX_RATE_SE;

export function arPlanId(v: unknown): v is PlanId {
  return v === "egen" || v === "byra";
}

export function arInterval(v: unknown): v is Interval {
  return v === "month" || v === "year";
}

/** Hamtar price-id för en plan. Saknas det ar Stripe inte fardigkonfigurerat. */
export function prisFor(plan: PlanId, interval: Interval): string | null {
  return PRISER[plan][interval] ?? null;
}

/**
 * Oversatter Stripes prenumerationsstatus till var egen.
 *
 * `past_due` ger fortsatt atkomst med flit. Ett kort som gatt ut ska inte
 * stanga av faktureringen mitt i manaden - Stripe forsoker igen i nagra dagar,
 * och forst nar den ger upp blir prenumerationen `unpaid` eller `canceled`.
 */
export function tillVarStatus(
  stripeStatus: Stripe.Subscription.Status
): "trialing" | "active" | "past_due" | "canceled" | "expired" {
  switch (stripeStatus) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "unpaid":
    case "incomplete_expired":
      return "expired";
    case "incomplete":
    case "paused":
      // Betalningen ar pabörjad men inte slutford. Ingen atkomst an.
      return "expired";
    default:
      return "expired";
  }
}

/**
 * Stripe vagrar en provperiod som tar slut for snart. Ligger kundens
 * provperiod narmare an sa, eller har den redan gatt ut, debiterar vi direkt
 * i stallet - det ar battre an att betalningen avvisas i kassan.
 */
const MINSTA_MARGINAL_MS = 48 * 60 * 60 * 1000;

export function trialEndFor(trialEndsAt: string | null | undefined): number | undefined {
  if (!trialEndsAt) return undefined;
  const slut = new Date(trialEndsAt).getTime();
  if (Number.isNaN(slut)) return undefined;
  if (slut - Date.now() < MINSTA_MARGINAL_MS) return undefined;
  return Math.floor(slut / 1000);
}
