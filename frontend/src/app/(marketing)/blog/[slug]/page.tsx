import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/content/pages";

export function generateStaticParams() {
  // Next.js needs at least one entry to prerender; "welcome" is never linked and 404s.
  return BLOG_POSTS.length ? BLOG_POSTS.map((p) => ({ slug: p.slug })) : [{ slug: "welcome" }];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  return post
    ? { title: post.seoTitle ?? post.title, description: post.summary, alternates: { canonical: `/blog/${post.slug}` }, openGraph: { type: "article", title: post.title, description: post.summary, images: ["/og.png"] } }
    : {};
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) blocks.push(<ul key={`ul${blocks.length}`} className="post-list">{bullets.map((b) => <li key={b}>{b}</li>)}</ul>);
    bullets = [];
  };
  post.body.forEach((para, i) => {
    if (para.startsWith("- ")) { bullets.push(para.slice(2)); return; }
    flush();
    if (para.startsWith("## ")) blocks.push(<h2 key={i} className="post-h2">{para.slice(3)}</h2>);
    else blocks.push(<p key={i} style={{ fontSize: 18 }}>{para}</p>);
  });
  flush();
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.summary,
    datePublished: new Date(post.date).toISOString().slice(0, 10), author: { "@type": "Organization", name: "VoiceDost" },
    publisher: { "@type": "Organization", name: "VoiceDost", logo: { "@type": "ImageObject", url: "https://www.voicedost.com/icon-512.png" } },
    image: "https://www.voicedost.com/og.png", mainEntityOfPage: `https://www.voicedost.com/blog/${post.slug}`,
  };
  return (
    <article className="wrap section stack" style={{ maxWidth: 760 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/blog" className="muted">← All guides</Link>
      <span className="muted">{post.date}</span>
      <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>{post.title}</h1>
      <p className="lead">{post.summary}</p>
      {blocks}
      <div className="panel stack" style={{ marginTop: 16 }}>
        <strong style={{ fontSize: 20 }}>Try it now, free</strong>
        <span className="muted">13 natural voices in English, Hindi and Urdu, with subtitles and background music. 30 free minutes every day.</span>
        <Link href="/studio" className="btn btn-orange" style={{ alignSelf: "start" }}>Open the studio</Link>
      </div>
    </article>
  );
}
