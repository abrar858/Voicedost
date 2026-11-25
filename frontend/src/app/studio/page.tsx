import type { Metadata } from "next";
import { Studio } from "@/components/Studio";

export const metadata: Metadata = {
  title: "Studio – VoiceDost",
  description: "Turn your script into a natural English or Hindi voiceover and download it as MP3 or WAV.",
  robots: { index: false },
};

export default function StudioPage() {
  return (
    <section className="wrap" style={{ padding: "24px 24px 72px" }}>
      <div className="stack">
        <h1 style={{ fontSize: "clamp(36px, 5vw, 52px)" }}>Studio</h1>
        <p className="muted">
          Accounts and minute balances arrive in the next update. For now the studio is open for testing.
        </p>
        <Studio />
      </div>
    </section>
  );
}
