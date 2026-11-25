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
          <p className="muted">The free box takes up to 200 characters. The studio handles full scripts up to 5,000 characters.</p>
        </div>
      </section>
    </>
  );
}
