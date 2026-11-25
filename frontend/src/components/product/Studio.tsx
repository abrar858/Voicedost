"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { estimateSeconds, generateVoice, type GenerateResult } from "@/lib/api";
import { VOICES } from "@/content/voices";
import { useAccount } from "@/lib/auth/useAccount";
import { formatMinutes } from "@/components/account/MinutesMeter";

const MAX_CHARS = 5000;

function splitLines(script: string): string[] {
  return script
    .replace(/\r\n/g, "\n")
    .split("\n")
    .flatMap((block) => block.trim().split(/(?<=[.!?।])\s+/))
    .map((s) => s.trim())
    .filter(Boolean);
}

export function Studio() {
  const { state, refresh } = useAccount();
  const signedIn = state.status === "signed-in" ? state : null;
  const mustLogIn = state.status === "signed-out";
  const freePlan = signedIn?.account?.plan === "free";
  const [text, setText] = useState(
    "Welcome back to the channel!\nToday we're looking at how the British Empire grew, and why it fell apart.\nLet's get started."
  );
  const [voice, setVoice] = useState("george");
  const [speed, setSpeed] = useState(1);
  const [pause, setPause] = useState(350);
  const [chosenFormat, setFormat] = useState<"mp3" | "wav">("mp3");
  const format = freePlan ? "mp3" : chosenFormat;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);

  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  const lines = useMemo(() => splitLines(text), [text]);
  const over = text.length > MAX_CHARS;

  async function onGenerate() {
    setBusy(true);
    setError("");
    try {
      const r = await generateVoice({ text, voice, speed, pauseMs: pause, format, token: signedIn?.token });
      setResult(r);
      if (r.minutesLeft !== null) refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate the voice.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="studio">
      <section className="panel" aria-labelledby="script-label">
        <label id="script-label" htmlFor="script" className="field">Script</label>
        <textarea id="script" value={text} onChange={(e) => setText(e.target.value)} />
        <span className={over ? "error-light" : "muted"}>
          {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters · about{" "}
          {estimateSeconds(text.length, speed)} seconds of audio · {lines.length} lines
        </span>
        {lines.length > 0 && (
          <details>
            <summary className="muted" style={{ cursor: "pointer" }}>Show how your script is split into lines</summary>
            <ol className="lines">
              {lines.map((l, i) => <li key={i}>{l}</li>)}
            </ol>
          </details>
        )}
      </section>

      <aside className="panel" aria-label="Voice settings">
        {signedIn?.account && (
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>{formatMinutes(signedIn.account.minutes_left)} left</strong>
            <Link href="/pricing" className="muted">Get more</Link>
          </div>
        )}
        {signedIn && !signedIn.account && signedIn.error && <span className="error-light">{signedIn.error}</span>}
        <div className="field" id="voice-label">Voice</div>
        <div className="chips" role="group" aria-labelledby="voice-label">
          {VOICES.map((v) => (
            <button
              key={v.id}
              type="button"
              className="chip on-light"
              aria-pressed={voice === v.id}
              onClick={() => setVoice(v.id)}
              title={v.use}
            >
              {v.name} · {v.language.replace(" English", "")}
            </button>
          ))}
        </div>
        <label className="field">
          Speed: {speed.toFixed(1)}×
          <input type="range" min={0.5} max={2} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        </label>
        <label className="field">
          Pause between lines: {pause} ms
          <input type="range" min={0} max={1500} step={50} value={pause} onChange={(e) => setPause(Number(e.target.value))} />
        </label>
        <div className="field" id="format-label">Format</div>
        <div className="chips" role="group" aria-labelledby="format-label">
          {(["mp3", "wav"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className="chip on-light"
              aria-pressed={format === f}
              onClick={() => setFormat(f)}
              disabled={f === "wav" && freePlan}
              title={f === "wav" && freePlan ? "WAV comes with Starter and Creator" : undefined}
            >
              {f.toUpperCase()}{f === "wav" && freePlan ? " (paid plans)" : ""}
            </button>
          ))}
        </div>
        {mustLogIn ? (
          <div className="stack" style={{ gap: 10 }}>
            <p style={{ margin: 0 }}>Create a free account to generate voiceovers: 10 minutes every month, no card needed.</p>
            <div className="row">
              <Link href="/signup" className="btn btn-orange">Start free</Link>
              <Link href="/login" className="btn btn-outline">Log in</Link>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-dark"
            onClick={onGenerate}
            disabled={busy || over || !text.trim() || state.status === "loading"}
          >
            {busy ? "Generating…" : "Generate voice"}
          </button>
        )}
        <span role="status" className={error ? "error-light" : "muted"}>{error}</span>
        {result && (
          <div className="stack" style={{ gap: 10 }}>
            <audio controls src={result.url} style={{ width: "100%" }} />
            <a className="btn btn-orange" href={result.url} download={`voicedost-${voice}.${format}`}>
              Download {format.toUpperCase()}
            </a>
            <span className="muted">
              {result.seconds.toFixed(1)} seconds · {result.lines} lines · {result.minutes.toFixed(2)} minutes used
            </span>
          </div>
        )}
      </aside>
    </div>
  );
}
