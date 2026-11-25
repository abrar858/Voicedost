import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { robots: { index: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-shell">
      <Logo />
      <div className="panel" style={{ width: "100%", maxWidth: 440 }}>{children}</div>
    </main>
  );
}
