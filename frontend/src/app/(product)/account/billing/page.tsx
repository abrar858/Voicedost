import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  // [PAYMENTS] show current plan, buttons calling createCheckout() / createBillingPortal()
  return (
    <ComingSoon
      title="Plan and billing"
      description="Choose a plan, buy a one-off pack or top up minutes once payments are live."
      items={["Starter £3 and Creator £5 subscriptions", "One-off 30-day packs for cards that block subscriptions", "£1 top-ups", "Invoices and card details"]}
    />
  );
}
