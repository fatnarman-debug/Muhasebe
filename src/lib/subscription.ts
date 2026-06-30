/** Åtkomstlogik för provperiod / prenumeration. */

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "expired";

export type AccessState = {
  hasAccess: boolean; // aktiv prenumeration ELLER inom provperioden
  trialing: boolean;
  expired: boolean;
  daysLeft: number | null;
  status: string;
};

export function getAccess(
  p?: { subscription_status?: string | null; trial_ends_at?: string | null } | null
): AccessState {
  const status = p?.subscription_status ?? "trialing";

  if (status === "active") {
    return { hasAccess: true, trialing: false, expired: false, daysLeft: null, status };
  }

  if (status === "trialing" && p?.trial_ends_at) {
    const ends = new Date(p.trial_ends_at).getTime();
    if (!Number.isNaN(ends) && ends > Date.now()) {
      const daysLeft = Math.max(0, Math.ceil((ends - Date.now()) / 86_400_000));
      return { hasAccess: true, trialing: true, expired: false, daysLeft, status };
    }
    return { hasAccess: false, trialing: false, expired: true, daysLeft: 0, status: "expired" };
  }

  // past_due, canceled, expired eller okänt → ingen åtkomst
  return { hasAccess: false, trialing: false, expired: true, daysLeft: 0, status };
}
