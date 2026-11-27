"use client";

import { useState } from "react";
import { createShare, shareUrl } from "@/lib/api";

/** "Share" for a finished voiceover: makes a public link, then WhatsApp / copy / share sheet. */
export function ShareActions({ jobId, shareId, onShared }: {
  jobId?: string;
  shareId?: string;
  onShared?: (id: string) => void;
}) {
  const [id, setId] = useState(shareId ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function ensure(): Promise<string | null> {
    if (id) return id;
    if (!jobId) return null;
    setBusy(true);
    setMsg("");
    try {
      const newId = await createShare(jobId);
      setId(newId);
      onShared?.(newId);
      return newId;
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not make a share link.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  const text = (link: string) => `Listen to this voiceover I made with VoiceDost 🎙️ ${link}`;

  async function whatsapp() {
    // Open the window first (inside the click) so phones don't block it.
    const w = window.open("about:blank", "_blank");
    const sid = await ensure();
    if (!sid) { w?.close(); return; }
    const url = `https://wa.me/?text=${encodeURIComponent(text(shareUrl(sid)))}`;
    if (w) w.location.href = url; else window.location.href = url;
  }

  async function copy() {
    const sid = await ensure();
    if (!sid) return;
    try {
      await navigator.clipboard.writeText(shareUrl(sid));
      setMsg("Link copied!");
    } catch {
      setMsg(shareUrl(sid));
    }
  }

  async function more() {
    const sid = await ensure();
    if (!sid) return;
    try {
      await navigator.share({ title: "My VoiceDost voiceover", text: text(""), url: shareUrl(sid) });
    } catch {
      /* cancelled */
    }
  }

  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="share-row">
        <button type="button" className="btn btn-whatsapp" onClick={whatsapp} disabled={busy}>
          {busy ? "Making link…" : "Share on WhatsApp"}
        </button>
        <button type="button" className="btn btn-outline" onClick={copy} disabled={busy}>Copy link</button>
        {canNativeShare && (
          <button type="button" className="btn btn-outline" onClick={more} disabled={busy}>More…</button>
        )}
      </div>
      {msg && <span className="muted" role="status">{msg}</span>}
    </div>
  );
}
