"use client";

import Link from "next/link";
import { PLANS } from "@/content/plans";
import { RequireLogin } from "./RequireLogin";
import { MinutesMeter } from "./MinutesMeter";

export function Dashboard() {
  return (
    <RequireLogin>
      {(s) => {
        const plan = s.account ? PLANS.find((p) => p.id === s.account!.plan) : undefined;
        return (
          <div className="stack" style={{ gap: 24 }}>
            <div className="stack" style={{ gap: 6 }}>
              <h1 style={{ fontSize: "clamp(36px, 5vw, 52px)" }}>Your dashboard</h1>
              <span className="muted">Signed in as {s.email}</span>
            </div>
            <div className="account-grid">
              <section className="panel stack">
                <span className="pill">{plan?.name ?? s.account?.plan ?? "Plan"} plan</span>
                {s.account ? <MinutesMeter account={s.account} /> : <p className="error-light">{s.error}</p>}
                <div className="row">
                  <Link href="/studio" className="btn btn-dark">Open the studio</Link>
                  <Link href="/pricing" className="btn btn-outline">Get more minutes</Link>
                </div>
              </section>
              <section className="panel stack">
                <h2 style={{ fontSize: 24 }}>Your projects</h2>
                <p className="muted">Saved voiceovers are coming soon. For now, download your MP3 or WAV straight after generating it.</p>
              </section>
            </div>
          </div>
        );
      }}
    </RequireLogin>
  );
}
