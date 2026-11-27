"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Registers the service worker and offers "Install app" (Android/desktop) or iPhone steps. */
export function InstallApp({ compact = false }: { compact?: boolean }) {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIos, setShowIos] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as InstallEvent); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    const t = setTimeout(() => {
      setInstalled(standalone);
      setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    }, 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || (!deferred && !ios)) return null;

  return (
    <div className="install-app">
      <button
        type="button"
        className={compact ? "linkish" : "btn btn-outline btn-small"}
        onClick={async () => {
          if (deferred) {
            await deferred.prompt();
            const { outcome } = await deferred.userChoice;
            if (outcome === "accepted") setInstalled(true);
            setDeferred(null);
          } else {
            setShowIos((s) => !s);
          }
        }}
      >
        📲 Install VoiceDost app
      </button>
      {showIos && (
        <p className="muted" style={{ margin: "6px 0 0" }}>
          On iPhone: tap the <strong>Share</strong> button in Safari, then <strong>Add to Home Screen</strong>.
        </p>
      )}
    </div>
  );
}
