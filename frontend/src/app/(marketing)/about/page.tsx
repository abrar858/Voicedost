import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/ComingSoon";
import { SignupBand } from "@/components/marketing/Sections";

export const metadata: Metadata = {
  title: "About",
  description: "VoiceDost makes natural AI voiceovers affordable for creators in the UK and South Asia.",
};

export default function AboutPage() {
  return (
    <>
      <PageIntro
        title="Voiceovers everyone can afford"
        lead="VoiceDost was started for creators who need clear English and Hindi narration without paying £20 a month or more."
      />
      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="stack" style={{ maxWidth: 720, fontSize: 18, color: "var(--ink-2)" }}>
          <p>[YOUR STORY] A few lines on who runs VoiceDost and why: for example, building it for your own channel first.</p>
          <p>We use open voice technology that is licensed for commercial use, and we keep plans simple: minutes per month, no confusing credits.</p>
        </div>
      </section>
      <SignupBand />
    </>
  );
}
