"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchAccount } from "@/lib/api";
import type { Account } from "@/lib/auth";

export type AccountState =
  | { status: "loading" }
  | { status: "off" }          // accounts not switched on
  | { status: "signed-out" }
  | { status: "signed-in"; email: string; token: string; account: Account | null; error?: string };

/** Who is signed in, plus their plan and minutes from the voice server. */
export function useAccount() {
  const [state, setState] = useState<AccountState>(() =>
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? { status: "loading" } : { status: "off" });

  const load = useCallback(async (token: string | null, email: string) => {
    if (!token) return setState({ status: "signed-out" });
    try {
      const account = await fetchAccount(token);
      setState({ status: "signed-in", email, token, account });
    } catch (e) {
      setState({ status: "signed-in", email, token, account: null,
        error: e instanceof Error ? e.message : "Could not load your minutes." });
    }
  }, []);

  useEffect(() => {
    const c = supabase();
    if (!c) return;
    c.auth.getSession().then(({ data }) => load(data.session?.access_token ?? null, data.session?.user.email ?? ""));
    const { data: sub } = c.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        load(session?.access_token ?? null, session?.user.email ?? "");
      } else if (event === "TOKEN_REFRESHED" && session) {
        setState((s) => (s.status === "signed-in" ? { ...s, token: session.access_token } : s));
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const refresh = useCallback(async () => {
    const c = supabase();
    if (!c) return;
    const { data } = await c.auth.getSession();
    await load(data.session?.access_token ?? null, data.session?.user.email ?? "");
  }, [load]);

  return { state, refresh };
}
