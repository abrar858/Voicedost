import Link from "next/link";
import { FEATURES } from "@/config/features";
import { LiveCounter } from "@/components/marketing/LiveCounter";
import { TryBox } from "@/components/marketing/TryBox";
import { Faq, Features, Pricing, SignupBand, Steps, VoiceCards } from "@/components/marketing/Sections";

export default function Home() {
  return (
    <>
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
