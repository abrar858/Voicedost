import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL_PAGES } from "@/content/legal";

export function generateStaticParams() {
  return LEGAL_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = LEGAL_PAGES.find((p) => p.slug === slug);
  return page ? { title: page.title, robots: { index: false } } : {};
}

export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const page = LEGAL_PAGES.find((p) => p.slug === slug);
  if (!page) notFound();
  return (
    <article className="wrap section stack" style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: "clamp(36px, 5vw, 52px)" }}>{page.title}</h1>
      <p className="pill">Draft outline – to be written before launch</p>
      {page.sections.map((s) => (
        <section key={s} className="stack" style={{ gap: 8 }}>
          <h2 style={{ fontSize: 24 }}>{s}</h2>
          <p className="muted">[TO BE WRITTEN]</p>
        </section>
      ))}
    </article>
  );
}
