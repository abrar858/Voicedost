import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TryBox } from "@/components/marketing/TryBox";
import { SignupBand } from "@/components/marketing/Sections";
import { USE_CASES } from "@/content/pages";

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
      <SignupBand />
    </>
  );
}
