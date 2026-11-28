import type { Metadata } from "next";
import { Faq, Pricing, SignupBand } from "@/components/marketing/Sections";
import { FAQS } from "@/content/plans";
import { JsonLd, faqLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Pricing – Plans from £3",
  description: "Free plan with 60 minutes a month. Starter £3, Creator £5, top-ups £1. Subscriptions or one-off 30-day packs.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <Pricing headingLevel={1} />
      <Faq />
      <JsonLd data={faqLd(FAQS)} />
      <SignupBand />
    </>
  );
}
