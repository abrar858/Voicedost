"use client";

import { useEffect, useState } from "react";
import { generateVoice } from "@/lib/api";
import { VOICES } from "@/content/voices";

const TRY_LIMIT = 200;

export function TryBox({ defaultText, defaultVoice = "george" }: { defaultText: string; defaultVoice?: string }) {
  const [text, setText] = useState(defaultText);
  const [voice, setVoice] = useState(defaultVoice);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  async function onGenerate() {
    setBusy(true);
    setError("");
    try {
      const result = await generateVoice({ text, voice, mode: "try" });
      setAudioUrl(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate the voice.");
    } finally {
      setBusy(false);
    }
  }

  const left = TRY_LIMIT - text.length;

  return (
    <div className="trybox">
      <label htmlFor="try-script">Try it: type up to {TRY_LIMIT} characters</label>
      <textarea
        id="try-script"
        rows={4}
        maxLength={TRY_LIMIT}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <span className="muted">{left} characters left · no sign-up needed</span>
      <div className="label" id="try-voice-label">Voice</div>
      <div className="chips" role="group" aria-labelledby="try-voice-label">
        {VOICES.map((v) => (
          <button
            key={v.id}
            type="button"
            className="chip"
            aria-pressed={voice === v.id}
            onClick={() => setVoice(v.id)}
          >
            {v.name} · {v.language.replace(" English", "")}
          </button>
        ))}
      </div>
      <div className="row">
        <button type="button" className="btn btn-light" onClick={onGenerate} disabled={busy || !text.trim()}>
          {busy ? "Generating…" : "Generate voice"}
        </button>
        <span role="status" className={error ? "error" : "muted"}>{error}</span>
      </div>
      {audioUrl && (
        <div className="player">
          <audio controls autoPlay src={audioUrl} />
          <a href={audioUrl} download={`voicedost-${voice}.mp3`}>Download MP3</a>
        </div>
      )}
    </div>
  );
}
