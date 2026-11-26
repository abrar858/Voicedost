import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/ComingSoon";
import { TryBox } from "@/components/marketing/TryBox";
import { SignupBand, VoiceCards } from "@/components/marketing/Sections";
import { VOICES } from "@/content/voices";

export const metadata: Metadata = {
  title: "AI Voices in English and Hindi",
  description: "Listen to every VoiceDost voice: British and American English, plus male and female Hindi.",
};

export default function VoicesPage() {
  return (
    <>
      <PageIntro pill={`${VOICES.length} voices · 3 accents`} title="Meet the voices" lead="Play a sample, then try any voice with your own words below." />
      <VoiceCards heading={false} />
      <section className="wrap section">
        <div style={{ maxWidth: 640 }}>
          <TryBox defaultText="This is how my voice sounds with your script. Change the words and try another voice." />
        </div>
      </section>
      <SignupBand />
    </>
  );
}
