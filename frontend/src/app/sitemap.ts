import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { BLOG_POSTS, TOOL_PAGES, USE_CASES } from "@/content/pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number) => ({ url: `${SITE.url}${path}`, priority });
  return [
    page("", 1),
    page("/voices", 0.9),
    page("/pricing", 0.9),
    page("/use-cases", 0.8),
    page("/services", 0.8),
    page("/tools", 0.8),
    page("/about", 0.5),
    page("/contact", 0.5),
    page("/blog", 0.6),
    ...TOOL_PAGES.map((t) => page(`/tools/${t.slug}`, 0.8)),
    ...USE_CASES.map((u) => page(`/use-cases/${u.slug}`, 0.7)),
    ...BLOG_POSTS.map((p) => page(`/blog/${p.slug}`, 0.6)),
  ];
}
