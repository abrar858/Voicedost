/**
 * Accounts – interface only. Implement with Supabase Auth when FEATURES.accounts
 * is switched on. Everything else in the app talks to these functions, so the
 * provider can change without touching pages.
 */
import type { PlanId } from "@/content/plans";

export type User = {
  id: string;
  email: string;
  name?: string;
  plan: PlanId;
  /** Minutes left this period (plan + top-ups). */
  minutesLeft: number;
  periodEndsAt?: string;
  isAdmin?: boolean;
};

/** Returns the signed-in user, or null. [ACCOUNTS] read the Supabase session. */
export async function getCurrentUser(): Promise<User | null> {
  return null;
}

/** [ACCOUNTS] Supabase signInWithOtp (email link) or signInWithOAuth (Google). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function signIn(_email: string): Promise<void> {
  throw new Error("Accounts are not enabled yet.");
}

export async function signOut(): Promise<void> {
  throw new Error("Accounts are not enabled yet.");
}
