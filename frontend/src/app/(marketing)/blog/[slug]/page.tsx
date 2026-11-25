import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/content/pages";

export function generateStaticParams() {
  // Next.js needs at least one entry to prerender; "welcome" is never linked and 404s.
  return BLOG_POSTS.length ? BLOG_POSTS.map((p) => ({ slug: p.slug })) : [{ slug: "welcome" }];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  return post ? { title: post.title, description: post.summary } : {};
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <article className="wrap section stack" style={{ maxWidth: 760 }}>
      <span className="muted">{post.date}</span>
      <h1>{post.title}</h1>
      {post.body.map((para, i) => <p key={i} style={{ fontSize: 18 }}>{para}</p>)}
    </article>
  );
}
