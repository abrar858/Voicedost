"use client";

import { useEffect, useState } from "react";
import { fetchStats } from "@/lib/api";

/** "12,480 voiceovers made" social proof. Hidden until the number is worth showing. */
export function LiveCounter({ min = 500 }: { min?: number }) {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    fetchStats().then((s) => setN(s ? s.voiceovers : null));
  }, []);
  if (n === null || n < min) return null;
  return (
    <p className="live-counter" aria-live="polite">
      <span className="dot" aria-hidden /> <strong>{n.toLocaleString("en-GB")}</strong> voiceovers made so far
    </p>
  );
}
