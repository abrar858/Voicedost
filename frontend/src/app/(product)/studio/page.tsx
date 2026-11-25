import type { Metadata } from "next";
import { Studio } from "@/components/product/Studio";
import { FEATURES } from "@/config/features";

export const metadata: Metadata = {
  title: "Studio",
  description: "Turn your script into a natural English or Hindi voiceover and download it as MP3 or WAV.",
};

export default function StudioPage() {
  return (
    <div className="stack">
      <h1 style={{ fontSize: "clamp(36px, 5vw, 52px)" }}>Studio</h1>
      {!FEATURES.accounts && (
        <p className="muted">Accounts and minute balances arrive in a later update. For now the studio is open for testing.</p>
      )}
      <Studio />
    </div>
  );
}
