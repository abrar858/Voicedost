import Link from "next/link";
import { TryBox } from "@/components/TryBox";
import { Faq, Pricing, SignupBand, Steps, VoiceCards } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <section className="hero wrap">
        <div className="stack">
          <span className="pill">English + Hindi AI voices</span>
          <h1>
            Your voiceover <span className="accent">dost</span>.
          </h1>
          <p className="lead">
            Paste your script, pick a natural voice and download an MP3 in seconds. Made for YouTube, Reels and
            TikTok creators.
          </p>
          <div className="row">
            <Link href="/studio" className="btn btn-orange">Try 10 minutes free</Link>
            <Link href="/#pricing" className="btn btn-outline">Plans from £3</Link>
          </div>
          <p className="muted">No card needed for the free plan.</p>
        </div>
        <TryBox defaultText="Welcome back to the channel! Today I'll show you three easy ways to save money on your weekly shop." />
      </section>
      <VoiceCards />
      <Steps />
      <Pricing />
      <Faq />
      <SignupBand />
    </>
  );
}
