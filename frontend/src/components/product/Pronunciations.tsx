"use client";

import { useState } from "react";

export type Pron = { word: string; say: string };
const KEY = "voicedost:pronunciations";

export function loadPronunciations(): Pron[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Pron[]) : [];
    return Array.isArray(list) ? list.filter((p) => p.word && p.say).slice(0, 50) : [];
  } catch {
    return [];
  }
}

function save(list: Pron[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage blocked */ }
}

/** "Say this word like that": brand names, people's names, tricky words. */
export function Pronunciations({ value, onChange }: { value: Pron[]; onChange: (v: Pron[]) => void }) {
  const [word, setWord] = useState("");
  const [say, setSay] = useState("");
  const update = (list: Pron[]) => { onChange(list); save(list); };
  return (
    <details className="pron">
      <summary className="muted" style={{ cursor: "pointer" }}>
        Pronunciation fixes{value.length ? ` (${value.length})` : ""}
      </summary>
      <div className="stack" style={{ gap: 8, marginTop: 10 }}>
        <span className="muted">Tell the voice how to say names and brand words. Subtitles keep your spelling.</span>
        {value.map((p, i) => (
          <div key={i} className="pron-row">
            <span dir="auto"><strong>{p.word}</strong> → {p.say}</span>
            <button type="button" className="linkish" onClick={() => update(value.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <form
          className="pron-add"
          onSubmit={(e) => {
            e.preventDefault();
            if (!word.trim() || !say.trim() || value.length >= 50) return;
            update([...value.filter((p) => p.word.toLowerCase() !== word.trim().toLowerCase()), { word: word.trim(), say: say.trim() }]);
            setWord(""); setSay("");
          }}
        >
          <input aria-label="Word as written" placeholder="Written (e.g. VoiceDost)" value={word} maxLength={60} onChange={(e) => setWord(e.target.value)} dir="auto" />
          <input aria-label="Say it as" placeholder="Say as (e.g. Voice Dost)" value={say} maxLength={60} onChange={(e) => setSay(e.target.value)} dir="auto" />
          <button type="submit" className="btn btn-outline btn-small">Add</button>
        </form>
      </div>
    </details>
  );
}
