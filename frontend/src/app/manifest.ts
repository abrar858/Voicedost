import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VoiceDost – AI voiceovers",
    short_name: "VoiceDost",
    description: "Natural AI voiceovers in English, Hindi and Urdu for YouTube, Reels and TikTok.",
    start_url: "/studio?source=app",
    scope: "/",
    display: "standalone",
    background_color: "#fff7ed",
    theme_color: "#f97316",
    categories: ["productivity", "multimedia"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Open the studio", url: "/studio?source=shortcut", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
