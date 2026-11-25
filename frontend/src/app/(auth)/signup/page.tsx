import type { Metadata } from "next";
import Link from "next/link";
import { FEATURES } from "@/config/features";

export const metadata: Metadata = { title: "Create a free account" };

export default function SignupPage() {
  if (!FEATURES.accounts) {
    return (
      <div className="stack">
        <h1 style={{ fontSize: 36 }}>Create a free account</h1>
        <p>Sign-up opens soon with 10 free minutes a month. You can already try every voice in the studio.</p>
        <Link href="/studio" className="btn btn-dark">Open the studio</Link>
      </div>
    );
  }
  // [ACCOUNTS] sign-up form: email + accept terms, calling signIn() from @/lib/auth
  return (
    <form className="stack">
      <h1 style={{ fontSize: 36 }}>Create a free account</h1>
      <label htmlFor="email" style={{ fontWeight: 600 }}>Email</label>
      <input id="email" type="email" autoComplete="email" required />
      <label className="row" style={{ gap: 8 }}>
        <input type="checkbox" required style={{ width: 20, minHeight: 20 }} /> I agree to the <Link href="/legal/terms">terms of use</Link>
      </label>
      <button type="submit" className="btn btn-orange">Start free</button>
    </form>
  );
}
