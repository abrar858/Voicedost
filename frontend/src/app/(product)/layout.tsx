import type { Metadata } from "next";
import { Footer, ProductHeader } from "@/components/marketing/SiteChrome";

// Product pages are for signed-in users and should not appear in search results.
export const metadata: Metadata = { robots: { index: false } };

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  // [ACCOUNTS] When FEATURES.accounts is on, check getCurrentUser() here and
  // redirect to /login if nobody is signed in (except /studio while it is open).
  return (
    <>
      <ProductHeader />
      <main className="wrap" style={{ padding: "24px 24px 72px" }}>{children}</main>
      <Footer />
    </>
  );
}
