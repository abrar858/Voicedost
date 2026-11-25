import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/ui/ComingSoon";
import { USE_CASES } from "@/content/pages";

export const metadata: Metadata = {
  title: "Use cases",
  description: "How creators and businesses use VoiceDost: faceless YouTube, Reels and Shorts, training videos and ads.",
};

export default function UseCasesPage() {
  return (
    <>
      <PageIntro title="Made for creators and small teams" lead="Pick what you make and see how VoiceDost fits." />
      <section className="wrap section" style={{ paddingTop: 24 }}>
        <div className="grid">
          {USE_CASES.map((u) => (
            <Link key={u.slug} href={`/use-cases/${u.slug}`} className="card link-card">
              <span className="name">{u.h1}</span>
              <span>{u.intro}</span>
              <span className="accent" style={{ fontWeight: 700 }}>Read more →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
