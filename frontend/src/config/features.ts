/**
 * Feature switches. Turn a feature on once it is built and its accounts
 * (Supabase, Stripe) are set up. Values come from environment variables
 * so the live site can be switched without a code change.
 */
const on = (v: string | undefined) => v === "1" || v === "true";

/** Soft launch: accounts are built but hidden until sign-in emails work for everyone. */
const ACCOUNTS_PAUSED = true;

const accounts =
  !ACCOUNTS_PAUSED &&
  on(process.env.NEXT_PUBLIC_FEATURE_ACCOUNTS) &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const FEATURES = {
  /** Sign up, log in, dashboard, minute balances. */
  accounts,
  /** Stripe checkout for plans, packs and top-ups. */
  payments: on(process.env.NEXT_PUBLIC_FEATURE_PAYMENTS),
  /** Admin panel. */
  admin: on(process.env.NEXT_PUBLIC_FEATURE_ADMIN),
  /** Studio open to everyone without an account (only while accounts are off). */
  openStudio: !accounts,
};
