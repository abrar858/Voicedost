import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { API_URL, shareAudioUrl, type Share } from "@/lib/api";
import { formatMinutes } from "@/components/account/MinutesMeter";

async function getShare(id: string): Promise<Share | null> {
  "use cache";
  cacheLife("hours");
  if (!API_URL || !/^[A-Za-z0-9_-]{6,32}$/.test(id)) return null;
  try {
    const res = await fetch(`${API_URL}/shares/${id}`);
    return res.ok ? ((await res.json()) as Share) : null;
  } catch {
    return null;
  }
}

function clip(raw: string, n: number): string {
  const text = raw.replace(/\s+/g, " ").trim();
  return text.length > n ? `${text.slice(0, n - 1).trimEnd()}…` : text;
}

export async function generateMetadata({ params }: PageProps<"/s/[id]">): Promise<Metadata> {
  const { id } = await params;
  const share = await getShare(id);
  if (!share) return { title: "Voiceover not found", robots: { index: false } };
  const title = `Listen to ${share.voice_name}: “${clip(share.excerpt, 60)}”`;
  const description = "A voiceover made with VoiceDost. Make your own in English, Hindi or Urdu: 30 free minutes every day.";
  return {
    title: { absolute: `${title} | VoiceDost` },
    description,
    robots: { index: false, follow: true },
    openGraph: { title, description, type: "website", url: `/s/${id}`, audio: [{ url: shareAudioUrl(id), type: "audio/mpeg" }],
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "VoiceDost – AI voiceovers" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

async function ShareCard({ params }: { params: PageProps<"/s/[id]">["params"] }) {
  const { id } = await params;
  const share = await getShare(id);
  if (!share) notFound();
  return (
    <div className="share-card panel stack">
      <span className="pill">🎙️ Made with VoiceDost</span>
      <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)" }}>{share.voice_name}&apos;s voiceover</h1>
      <blockquote className="share-quote" dir="auto">{share.excerpt.length > 160 ? `${share.excerpt.slice(0, 159)}…` : share.excerpt}</blockquote>
      <audio controls src={shareAudioUrl(id)} style={{ width: "100%" }} preload="metadata" />
      <span className="muted">{formatMinutes(share.seconds / 60)} · {share.voice_name} voice{share.music ? " · with background music" : ""}</span>
      <div className="share-cta stack">
        <strong style={{ fontSize: 20 }}>Make your own voiceover, free</strong>
        <span className="muted">13 natural voices in English, Hindi and Urdu. 30 free minutes every day, no sign-up.</span>
        <div className="row">
          <Link href="/studio" className="btn btn-orange">Make my voiceover</Link>
          <Link href="/voices" className="btn btn-outline">Hear all voices</Link>
        </div>
      </div>
    </div>
  );
}

export default function SharePage({ params }: PageProps<"/s/[id]">) {
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 720 }}>
        <Suspense fallback={<div className="panel"><p className="muted">Loading voiceover…</p></div>}>
          <ShareCard params={params} />
        </Suspense>
      </div>
    </section>
  );
}
