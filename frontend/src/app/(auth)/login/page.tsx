import type { Metadata } from "next";
import Link from "next/link";
import { FEATURES } from "@/config/features";
import { AuthForm } from "@/components/account/AuthForm";

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
  return <AuthForm mode="login" />;
}
