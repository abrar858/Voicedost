"use client";

import Link from "next/link";
import { useAccount, type AccountState } from "@/lib/auth/useAccount";

type SignedIn = Extract<AccountState, { status: "signed-in" }>;

/** Shows children only to signed-in users (when accounts are on). */
export function RequireLogin({ children }: { children: (s: SignedIn, refresh: () => Promise<void>) => React.ReactNode }) {
  const { state, refresh } = useAccount();
  if (state.status === "loading") return <p className="muted">Loading your account…</p>;
  if (state.status === "off") {
    return (
      <div className="stack">
        <p>Accounts are coming soon. Until then the studio is open for everyone.</p>
        <Link href="/studio" className="btn btn-dark" style={{ alignSelf: "start" }}>Open the studio</Link>
      </div>
    );
  }
  if (state.status === "signed-out") {
    return (
      <div className="stack" style={{ maxWidth: 520 }}>
        <h1 style={{ fontSize: 36 }}>Please log in</h1>
        <p>Log in or create a free account to see this page.</p>
        <div className="row">
          <Link href="/signup" className="btn btn-orange">Create free account</Link>
          <Link href="/login" className="btn btn-outline">Log in</Link>
        </div>
      </div>
    );
  }
  return <>{children(state, refresh)}</>;
}
