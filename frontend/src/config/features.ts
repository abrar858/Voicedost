/**
 * Feature switches. Turn a feature on once it is built and its accounts
 * (Supabase, Stripe) are set up. Values come from environment variables
 * so the live site can be switched without a code change.
 */
const on = (v: string | undefined) => v === "1" || v === "true";

export const FEATURES = {
  /** Sign up, log in, dashboard, minute balances. */
  accounts: on(process.env.NEXT_PUBLIC_FEATURE_ACCOUNTS),
  /** Stripe checkout for plans, packs and top-ups. */
  payments: on(process.env.NEXT_PUBLIC_FEATURE_PAYMENTS),
  /** Admin panel. */
  admin: on(process.env.NEXT_PUBLIC_FEATURE_ADMIN),
  /** Studio open to everyone without an account (testing phase). */
  openStudio: process.env.NEXT_PUBLIC_FEATURE_OPEN_STUDIO !== "0",
};
