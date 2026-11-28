import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/ui/ComingSoon";
import { TOOL_PAGES } from "@/content/pages";

export const metadata: Metadata = {
  title: "Free Text to Speech Tools: Hindi, Urdu, English",
  description: "Free text-to-speech tools in Hindi, Urdu and English: AI voiceovers for YouTube, subtitles, podcasts and British accents. No sign-up needed.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <>
      <PageIntro pill="Free · no sign-up" title="Free voice tools" lead="Try VoiceDost voices for free with up to 200 characters." />
      <section className="wrap section" style={{ paddingTop: 24 }}>
        <div className="grid">
          {TOOL_PAGES.map((t) => (
            <Link key={t.slug} href={`/tools/${t.slug}`} className="card link-card">
              <span className="name">{t.h1}</span>
              <span>{t.intro}</span>
              <span className="accent" style={{ fontWeight: 700 }}>Try it →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
