import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";
import { FAQS } from "@/content/plans";
import { VOICES } from "@/content/voices";
import { JsonLd, faqLd } from "@/components/seo/JsonLd";
import { FEATURES } from "@/config/features";
import { LiveCounter } from "@/components/marketing/LiveCounter";
import { TryBox } from "@/components/marketing/TryBox";
import { Faq, Features, Pricing, SignupBand, Steps, VoiceCards } from "@/components/marketing/Sections";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const homeLd = [
  { "@context": "https://schema.org", "@type": "Organization", "@id": `${SITE.url}/#organization`, name: SITE.name, url: SITE.url, logo: `${SITE.url}/icon.svg`, email: SITE.email },
  { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url, inLanguage: "en-GB", publisher: { "@id": `${SITE.url}/#organization` } },
  {
    "@context": "https://schema.org", "@type": "WebApplication", name: SITE.name, url: SITE.url, description: SITE.description,
    applicationCategory: "MultimediaApplication", operatingSystem: "Any modern web browser",
    featureList: [`${VOICES.length} AI voices`, "British and American English, Hindi and Urdu script", "MP3 download", "SRT subtitles", "Background music", "Several voices in one script"],
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" }, publisher: { "@id": `${SITE.url}/#organization` },
  },
  faqLd(FAQS),
];

export default function Home() {
  return (
    <>
      <JsonLd data={homeLd} />
      <section className="hero wrap">
        <div className="stack">
          <span className="pill">13 AI voices · English, Hindi & Urdu</span>
          <h1>
            Your voiceover <span className="accent">dost</span>.
          </h1>
          <p className="lead">
            Paste your script, pick a natural voice and download an MP3 with subtitles and background music in
            seconds. Made for YouTube, Reels and TikTok creators.
          </p>
          <div className="row">
            <Link href="/studio" className="btn btn-orange">{FEATURES.accounts ? "Try 60 minutes free" : "Open the studio free"}</Link>
            <Link href="/pricing" className="btn btn-outline">Plans from £3</Link>
          </div>
          <p className="muted">{FEATURES.accounts ? "No card needed for the free plan." : "30 free minutes every day while we launch. No sign-up needed."}</p>
          <LiveCounter />
        </div>
        <TryBox defaultText="Welcome back to the channel! Today I'll show you three easy ways to save money on your weekly shop." />
      </section>
      <VoiceCards featured />
      <Features />
      <Steps />
      <Pricing />
      <Faq />
      <SignupBand />
    </>
  );
}
