import type { Metadata } from "next";
import { Footer, ProductHeader } from "@/components/marketing/SiteChrome";

// Product pages are for signed-in users and should not appear in search results.
export const metadata: Metadata = { robots: { index: false } };

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  // Pages that need a login wrap their content in <RequireLogin>.
  return (
    <>
      <ProductHeader />
      <main className="wrap" style={{ padding: "24px 24px 72px" }}>{children}</main>
      <Footer />
    </>
  );
}
