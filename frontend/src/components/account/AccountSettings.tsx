"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { SITE } from "@/config/site";
import { RequireLogin } from "./RequireLogin";

export function AccountSettings() {
  const router = useRouter();
  return (
    <RequireLogin>
      {(s) => (
        <div className="stack" style={{ maxWidth: 640, gap: 20 }}>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 52px)" }}>Account</h1>
          <section className="panel stack">
            <div><strong>Email</strong><br />{s.email}</div>
            <div><strong>Plan</strong><br />{s.account?.plan ?? "free"}</div>
            <p className="muted">To change your email or delete your account and data, email {SITE.email}.</p>
            <button
              type="button"
              className="btn btn-outline"
              style={{ alignSelf: "start" }}
              onClick={async () => { await signOut(); router.push("/"); }}
            >
              Sign out
            </button>
          </section>
        </div>
      )}
    </RequireLogin>
  );
}
