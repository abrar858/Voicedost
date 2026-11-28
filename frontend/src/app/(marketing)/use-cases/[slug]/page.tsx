import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TryBox } from "@/components/marketing/TryBox";
import { SignupBand } from "@/components/marketing/Sections";
import { USE_CASES } from "@/content/pages";
import { SITE } from "@/config/site";
import { JsonLd, breadcrumbLd, faqLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: PageProps<"/use-cases/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const u = USE_CASES.find((x) => x.slug === slug);
  if (!u) return {};
  return { title: { absolute: u.title }, description: u.intro, alternates: { canonical: `/use-cases/${u.slug}` } };
}

export default async function UseCasePage({ params }: PageProps<"/use-cases/[slug]">) {
  const { slug } = await params;
  const u = USE_CASES.find((x) => x.slug === slug);
  if (!u) notFound();
  return (
    <>
      <JsonLd data={breadcrumbLd(SITE.url, [["Home", "/"], ["Use cases", "/use-cases"], [u.h1, `/use-cases/${u.slug}`]])} />
      <section className="hero wrap">
        <div className="stack">
          <span className="pill">Use case</span>
          <h1>{u.h1}</h1>
          <p className="lead">{u.intro}</p>
          <ul style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 8, fontSize: 18 }}>
            {u.points.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <div className="row">
            <Link href="/studio" className="btn btn-orange">Open the studio</Link>
            <Link href="/services" className="btn btn-outline">Or let us make it</Link>
          </div>
        </div>
        <TryBox defaultText={u.sample} defaultVoice={u.voice} />
      </section>
      <section className="band section">
        <div className="wrap stack" style={{ maxWidth: 840 }}>
          <h2>How it works</h2>
          <ol style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 8, fontSize: 18 }}>
            <li>Write or paste your script in the studio, in English, Hindi or Urdu script.</li>
            <li>Pick a voice and speed. Start a line with a name, like Grace:, to switch voices, and add [pause 2s] where you want a gap.</li>
            <li>Download the MP3 with its SRT subtitle file and drop both into CapCut, Premiere or your video editor.</li>
          </ol>
        </div>
      </section>
      {u.faq && (
        <section className="section">
          <div className="wrap stack" style={{ maxWidth: 840 }}>
            <h2>Questions</h2>
            {u.faq.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
            <JsonLd data={faqLd(u.faq)} />
          </div>
        </section>
      )}
      <SignupBand />
    </>
  );
}
