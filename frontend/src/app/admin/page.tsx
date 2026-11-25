import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default function AdminPage() {
  // [ADMIN] only for users with isAdmin; data from the API's /admin endpoints
  return (
    <main className="wrap" style={{ padding: "48px 24px" }}>
      <ComingSoon
        title="Admin"
        description="Owner dashboard, available once accounts and payments are live."
        items={["Users and plans", "Minutes generated per day", "Revenue by plan and payment method", "Abuse reports and blocked users", "Service enquiries"]}
      />
    </main>
  );
}
