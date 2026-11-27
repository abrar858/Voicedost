"use client";

import { useEffect, useRef, useState } from "react";
import { MUSIC } from "@/content/music";

/** Background music: none or one of our tracks, with a play preview and volume. */
export function MusicPicker({ value, onChange, volume, onVolume }: {
  value: string | null;
  onChange: (id: string | null) => void;
  volume: number;
  onVolume: (v: number) => void;
}) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => () => audio.current?.pause(), []);

  function preview(id: string) {
    if (playing === id) {
      audio.current?.pause();
      setPlaying(null);
      return;
    }
    audio.current?.pause();
    const a = new Audio(`/music/${id}.mp3`);
    a.volume = 0.6;
    a.onended = () => setPlaying(null);
    a.play().catch(() => setPlaying(null));
    audio.current = a;
    setPlaying(id);
  }

  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="field" id="music-label">Background music</div>
      <div className="music-list" role="radiogroup" aria-labelledby="music-label">
        <button type="button" role="radio" aria-checked={value === null} className="music-item"
          onClick={() => onChange(null)}>
          <span><strong>No music</strong><br /><span className="muted">Voice only</span></span>
        </button>
        {MUSIC.map((m) => (
          <div key={m.id} className="music-item" aria-checked={value === m.id} role="radio"
            tabIndex={0} onClick={() => onChange(m.id)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(m.id); } }}>
            <span><strong>{m.name}</strong><br /><span className="muted">{m.mood}</span></span>
            <button type="button" className="play" aria-label={playing === m.id ? `Stop ${m.name}` : `Play ${m.name}`}
              onClick={(e) => { e.stopPropagation(); preview(m.id); }}>
              {playing === m.id ? "■" : "▶"}
            </button>
          </div>
        ))}
      </div>
      {value && (
        <label className="field">
          Music volume: {Math.round(volume * 100)}%
          <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => onVolume(Number(e.target.value))} />
        </label>
      )}
    </div>
  );
}
