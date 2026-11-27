import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SITE } from "@/config/site";
import { FeedbackButton } from "@/components/ui/FeedbackButton";

export const viewport: Viewport = { themeColor: "#f97316" };

export const metadata: Metadata = {
  appleWebApp: { capable: true, title: "VoiceDost", statusBarStyle: "default" },
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} – Natural AI Voiceovers in English and Hindi`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} – ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image" },
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
        {children}
        <FeedbackButton />
        <Analytics />
      </body>
    </html>
  );
}
