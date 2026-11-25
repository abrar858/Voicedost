import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/SiteChrome";
import { SITE_URL } from "@/lib/content";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "VoiceDost – Natural AI Voiceovers in English and Hindi",
  description:
    "Paste your script, pick a natural English or Hindi voice and download an MP3 in seconds. Free plan, paid plans from £3.",
  openGraph: {
    title: "VoiceDost – Your voiceover dost",
    description: "Natural AI voiceovers in English and Hindi for YouTube, Reels and TikTok.",
    url: SITE_URL,
    siteName: "VoiceDost",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
