import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TryBox } from "@/components/marketing/TryBox";
import { TOOL_PAGES } from "@/content/pages";

export function generateStaticParams() {
  return TOOL_PAGES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tools/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = TOOL_PAGES.find((t) => t.slug === slug);
  if (!page) return {};
  return {
    title: { absolute: page.title },
    description: page.intro,
    alternates: { canonical: `/tools/${page.slug}` },
  };
}

export default async function ToolPage({ params }: PageProps<"/tools/[slug]">) {
  const { slug } = await params;
  const page = TOOL_PAGES.find((t) => t.slug === slug);
  if (!page) notFound();

  return (
    <>
      <section className="hero wrap">
        <div className="stack">
          <span className="pill">Free tool · no sign-up</span>
          <h1>{page.h1}</h1>
          <p className="lead">{page.intro}</p>
          {page.local && <p className="lead" lang={page.local.lang} dir={page.local.dir} style={{ fontSize: 22 }}>{page.local.text}</p>}
          <div className="row">
            <Link href="/studio" className="btn btn-orange">Open the full studio</Link>
            <Link href="/#pricing" className="btn btn-outline">See plans</Link>
          </div>
        </div>
        <TryBox defaultText={page.sample} defaultVoice={page.defaultVoice} />
      </section>
      <section className="band section">
        <div className="wrap stack" style={{ maxWidth: 840 }}>
          <h2>Tips for the best result</h2>
          <ul style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 8, fontSize: 18 }}>
            {page.tips.map((t) => <li key={t}>{t}</li>)}
          </ul>
          <p className="muted">The free box takes up to 200 characters. The studio handles full scripts up to 10,000 characters (about 9 minutes of audio) and gives you subtitles too.</p>
        </div>
      </section>
      {page.faq && (
        <section className="section">
          <div className="wrap stack" style={{ maxWidth: 840 }}>
            <h2>Questions</h2>
            {page.faq.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
              "@context": "https://schema.org", "@type": "FAQPage",
              mainEntity: page.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            }) }} />
          </div>
        </section>
      )}
    </>
  );
}
