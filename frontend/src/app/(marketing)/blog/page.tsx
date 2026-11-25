import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/ui/ComingSoon";
import { BLOG_POSTS } from "@/content/pages";

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides for creators: scripts, voiceovers and growing your channel.",
};

export default function BlogPage() {
  return (
    <>
      <PageIntro title="Blog" lead="Guides on scripts, voiceovers and growing your channel." />
      <section className="wrap section" style={{ paddingTop: 24 }}>
        {BLOG_POSTS.length === 0 ? (
          <p className="muted">The first articles are on the way.</p>
        ) : (
          <div className="grid">
            {BLOG_POSTS.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="card link-card">
                <span className="muted">{p.date}</span>
                <span className="name">{p.title}</span>
                <span>{p.summary}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
