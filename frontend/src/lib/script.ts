/** Mirrors the voice server's script reader (backend/app/services/tts.py). */
import { VOICES } from "@/content/voices";

export type Piece = { kind: "speech"; text: string; voice: string } | { kind: "pause"; seconds: number };

const PAUSE = /\[\s*pause(?:\s+(\d+(?:\.\d+)?)\s*(ms|s)?)?\s*\]/gi;
const SPEAKER = /^\s*([A-Za-z][A-Za-z\- ]{1,20})\s*[:：]\s*(.*)$/;
const SENTENCE = /(?<=[۔؟])\s*(?=\S)|(?<=[.!?।])\s+/;

function voiceFor(name: string): string | null {
  const n = name.trim().toLowerCase();
  const v = VOICES.find((x) => x.name.toLowerCase() === n || x.id === n);
  return v ? v.id : null;
}

export function readScript(script: string, defaultVoice: string): Piece[] {
  let current = defaultVoice;
  const out: Piece[] = [];
  for (let block of script.replace(/\r\n/g, "\n").split("\n")) {
    const m = block.match(SPEAKER);
    if (m) {
      const v = voiceFor(m[1]);
      if (v) { current = v; block = m[2]; }
    }
    let pos = 0;
    const parts: Array<[string, number]> = [];
    for (const pm of block.matchAll(PAUSE)) {
      parts.push([block.slice(pos, pm.index), 0]);
      const value = pm[1] ? Number(pm[1]) : 1;
      parts.push(["", Math.min((pm[2] ?? "s").toLowerCase() === "ms" ? value / 1000 : value, 10)]);
      pos = (pm.index ?? 0) + pm[0].length;
    }
    parts.push([block.slice(pos), 0]);
    for (const [text, pause] of parts) {
      if (pause) { out.push({ kind: "pause", seconds: pause }); continue; }
      for (const s of text.trim().split(SENTENCE)) {
        const t = s.trim();
        if (t && /[\p{L}\p{N}]/u.test(t)) out.push({ kind: "speech", text: t, voice: current });
      }
    }
  }
  return out;
}

export function voiceName(id: string): string {
  return VOICES.find((v) => v.id === id)?.name ?? id;
}
