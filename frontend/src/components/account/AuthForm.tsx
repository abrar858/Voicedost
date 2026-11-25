"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "@/lib/auth";

/** Email sign-in link form, used for both log in and sign up. */
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(mode === "login");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the email.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="stack">
        <h1 style={{ fontSize: 36 }}>Check your email</h1>
        <p>We sent a sign-in link to <strong>{email}</strong>. Open it on this device to continue.</p>
        <p className="muted">Can&apos;t see it? Check your spam folder, or <button type="button" className="linkish" onClick={() => setSent(false)}>try again</button>.</p>
      </div>
    );
  }

  const signup = mode === "signup";
  return (
    <form className="stack" onSubmit={onSubmit}>
      <h1 style={{ fontSize: 36 }}>{signup ? "Create a free account" : "Log in"}</h1>
      <p className="muted">
        {signup ? "10 free minutes every month. No card, no password." : "We'll email you a link to sign in. No password needed."}
      </p>
      <label htmlFor="email" style={{ fontWeight: 600 }}>Email</label>
      <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      {signup && (
        <label className="row" style={{ gap: 8 }}>
          <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width: 20, minHeight: 20 }} />
          <span>I agree to the <Link href="/legal/terms">terms of use</Link></span>
        </label>
      )}
      <button type="submit" className={signup ? "btn btn-orange" : "btn btn-dark"} disabled={busy || !agreed}>
        {busy ? "Sending…" : signup ? "Start free" : "Send me a sign-in link"}
      </button>
      <span role="status" className="error-light">{error}</span>
      <p className="muted">
        {signup ? <>Already have an account? <Link href="/login">Log in</Link></> : <>New here? <Link href="/signup">Create a free account</Link></>}
      </p>
    </form>
  );
}
