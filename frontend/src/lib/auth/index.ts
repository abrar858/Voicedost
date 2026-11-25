"use client";
/**
 * Accounts (Supabase Auth, email sign-in links). Pages use these functions
 * and the useAccount() hook, so the provider can change without touching pages.
 */
import { supabase } from "@/lib/supabase";
import type { PlanId } from "@/content/plans";

export type Account = {
  id: string;
  email: string;
  plan: PlanId;
  plan_minutes: number;
  plan_left: number;
  topup_left: number;
  minutes_left: number;
  period_end: string;
  is_admin: boolean;
};

function sb() {
  const c = supabase();
  if (!c) throw new Error("Accounts are not switched on yet.");
  return c;
}

/** Sends a sign-in link. New emails get a free account automatically. */
export async function signIn(email: string, next = "/dashboard"): Promise<void> {
  const { error } = await sb().auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}${next}`, shouldCreateUser: true },
  });
  if (error) {
    if (error.status === 429) throw new Error("Too many sign-in emails. Please wait a minute and try again.");
    throw new Error(error.message);
  }
}

export async function signOut(): Promise<void> {
  await supabase()?.auth.signOut();
}

/** Current login token, or null when signed out. */
export async function getToken(): Promise<string | null> {
  const c = supabase();
  if (!c) return null;
  const { data } = await c.auth.getSession();
  return data.session?.access_token ?? null;
}
