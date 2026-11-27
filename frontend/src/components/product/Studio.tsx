"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { estimateSeconds, generateWithProgress, type JobResult, type JobStatus } from "@/lib/api";
import { VOICES } from "@/content/voices";
import { useAccount } from "@/lib/auth/useAccount";
import { formatMinutes } from "@/components/account/MinutesMeter";
import { saveHistory, updateHistory } from "@/lib/history";
import { MusicPicker } from "./MusicPicker";
import { TemplatePicker } from "./TemplatePicker";
import { ShareActions } from "./ShareActions";
import { RecentVoiceovers } from "./RecentVoiceovers";
import { InstallApp } from "@/components/ui/InstallApp";

const MAX_CHARS = 10000;
/** Matches VOICEDOST_OPEN_STUDIO_MINUTES_PER_DAY on the voice server. */
const FREE_DAILY_MINUTES = 30;

function splitLines(script: string): string[] {
  return script
    .replace(/\r\n/g, "\n")
    .split("\n")
    .flatMap((block) => block.trim().split(/(?<=[۔؟])\s*(?=\S)|(?<=[.!?।])\s+/))
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
  const [music, setMusic] = useState<string | null>(null);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [result, setResult] = useState<(JobResult & { fmt: string; voice: string; historyId: string }) | null>(null);
  const [progress, setProgress] = useState<JobStatus | null>(null);
  const [freeLeft, setFreeLeft] = useState<number | null>(null);

  useEffect(() => () => {
    if (result) {
      URL.revokeObjectURL(result.audioUrl);
      URL.revokeObjectURL(result.srtUrl);
    }
  }, [result]);

  const lines = useMemo(() => splitLines(text), [text]);
  const over = text.length > MAX_CHARS;

  async function onGenerate() {
    setBusy(true);
    setError("");
    setProgress(null);
    try {
      const r = await generateWithProgress(
        { text, voice, speed, pauseMs: pause, format, music, musicVolume, token: signedIn?.token },
        setProgress,
      );
      const historyId = r.job.id;
      setResult({ ...r, fmt: format, voice, historyId });
      const v = VOICES.find((x) => x.id === voice);
      await saveHistory({
        id: historyId, created: Date.now(), voice, voiceName: v?.name ?? voice,
        excerpt: text.trim().slice(0, 160), seconds: r.job.seconds, format, music,
        audio: r.audio, srt: r.srt,
      });
      setHistoryVersion((n) => n + 1);
      const left = r.job.minutes_left;
      if (signedIn && left !== null) refresh();
      if (!signedIn && left !== null) setFreeLeft(left);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate the voice.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  return (
    <div className="studio">
      <section className="panel" aria-labelledby="script-label">
        <div className="script-head">
          <label id="script-label" htmlFor="script" className="field">Script</label>
          <TemplatePicker onPick={(t) => {
            setText(t.text);
            setVoice(t.voice);
            setMusic(t.music ?? null);
            setResult(null);
          }} />
        </div>
        <textarea id="script" dir="auto" value={text} onChange={(e) => setText(e.target.value)} />
        <span className={over ? "error-light" : "muted"}>
          {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters · about{" "}
          {formatMinutes(estimateSeconds(text.length, speed) / 60)} of audio · {lines.length} lines
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
        {state.status === "off" && (
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>Free: {FREE_DAILY_MINUTES} minutes a day</strong>
            {freeLeft !== null && <span className="muted">{formatMinutes(freeLeft)} left today</span>}
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
        <MusicPicker value={music} onChange={setMusic} volume={musicVolume} onVolume={setMusicVolume} />
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
            <p style={{ margin: 0 }}>Create a free account to generate voiceovers: 60 minutes every month, no card needed.</p>
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
        {busy && progress && (
          <div className="stack" style={{ gap: 6 }} aria-live="polite">
            <div className="meter"><span style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} /></div>
            <span className="muted">
              {progress.status === "queued"
                ? "Waiting for a free slot… you're in the queue."
                : `Making line ${Math.min(progress.done + 1, progress.total)} of ${progress.total}…`}
            </span>
          </div>
        )}
        <span role="status" className={error ? "error-light" : "muted"}>{error}</span>
        {result && (
          <div className="stack" style={{ gap: 10 }}>
            <audio controls src={result.audioUrl} style={{ width: "100%" }} />
            <a className="btn btn-orange" href={result.audioUrl} download={`voicedost-${result.voice}.${result.fmt}`}>
              Download {result.fmt.toUpperCase()}
            </a>
            <a className="btn btn-outline" href={result.srtUrl} download={`voicedost-${result.voice}.srt`}>
              Download subtitles (SRT)
            </a>
            <span className="muted">
              {formatMinutes(result.job.seconds / 60)} of audio · {result.job.total} lines
            </span>
            <ShareActions
              key={result.job.id}
              jobId={result.job.id}
              onShared={async (id) => { await updateHistory(result.historyId, { shareId: id }); setHistoryVersion((n) => n + 1); }}
            />
          </div>
        )}
        <InstallApp />
      </aside>
      <RecentVoiceovers version={historyVersion} />
    </div>
  );
}
