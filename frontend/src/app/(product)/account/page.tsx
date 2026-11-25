import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <ComingSoon
      title="Account"
      description="Manage your email, plan and data once accounts are live."
      items={["Change email", "Download or delete your data", "Sign out"]}
    />
  );
}
