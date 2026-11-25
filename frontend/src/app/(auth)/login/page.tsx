import type { Metadata } from "next";
import Link from "next/link";
import { FEATURES } from "@/config/features";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  if (!FEATURES.accounts) {
    return (
      <div className="stack">
        <h1 style={{ fontSize: 36 }}>Log in</h1>
        <p>Accounts are coming soon. Until then the studio is open for everyone to test.</p>
        <Link href="/studio" className="btn btn-dark">Open the studio</Link>
      </div>
    );
  }
  // [ACCOUNTS] email-link and Google sign-in form, calling signIn() from @/lib/auth
  return (
    <form className="stack">
      <h1 style={{ fontSize: 36 }}>Log in</h1>
      <label htmlFor="email" style={{ fontWeight: 600 }}>Email</label>
      <input id="email" type="email" autoComplete="email" required />
      <button type="submit" className="btn btn-dark">Send me a sign-in link</button>
      <p className="muted">New here? <Link href="/signup">Create a free account</Link></p>
    </form>
  );
}
