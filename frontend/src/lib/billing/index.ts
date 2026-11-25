/**
 * Payments – interface only. Implement with Stripe Checkout when
 * FEATURES.payments is switched on. Local methods (JazzCash, Easypaisa,
 * crypto) are added later behind the same functions.
 */
import type { PlanId } from "@/content/plans";

export type PurchaseKind = "subscription" | "pack30" | "topup";

/** Stripe price ids, set per environment. */
export const STRIPE_PRICES: Record<Exclude<PlanId, "free">, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  creator: process.env.STRIPE_PRICE_CREATOR,
  topup: process.env.STRIPE_PRICE_TOPUP,
};

/** Returns a checkout URL to send the user to. [PAYMENTS] create a Stripe Checkout Session. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createCheckout(_plan: PlanId, _kind: PurchaseKind): Promise<string> {
  throw new Error("Payments are not enabled yet.");
}

/** Returns a link to the Stripe customer portal (cancel, change card, invoices). */
export async function createBillingPortal(): Promise<string> {
  throw new Error("Payments are not enabled yet.");
}
