import type { Metadata } from "next";
import Link from "next/link";
import { FEATURES } from "@/config/features";
import { AuthForm } from "@/components/account/AuthForm";

export const metadata: Metadata = { title: "Create a free account" };

export default function SignupPage() {
  if (!FEATURES.accounts) {
    return (
      <div className="stack">
        <h1 style={{ fontSize: 36 }}>Create a free account</h1>
        <p>Sign-up opens soon with 60 free minutes a month. You can already try every voice in the studio.</p>
        <Link href="/studio" className="btn btn-dark">Open the studio</Link>
      </div>
    );
  }
  return <AuthForm mode="signup" />;
}
