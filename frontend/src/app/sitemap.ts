import type { MetadataRoute } from "next";
import { SITE_URL, TOOL_PAGES } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...TOOL_PAGES.map((t) => ({
      url: `${SITE_URL}/tools/${t.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
