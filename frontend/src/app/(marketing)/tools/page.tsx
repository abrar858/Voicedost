import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/ui/ComingSoon";
import { TOOL_PAGES } from "@/content/pages";

export const metadata: Metadata = {
  title: "Free voice tools",
  description: "Free text-to-speech tools in Hindi and English. No sign-up needed.",
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
