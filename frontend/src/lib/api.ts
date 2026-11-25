export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export type GenerateOptions = {
  text: string;
  voice: string;
  speed?: number;
  pauseMs?: number;
  format?: "mp3" | "wav";
  mode?: "try" | "tts";
};

export type GenerateResult = {
  url: string;
  seconds: number;
  minutes: number;
  lines: number;
};

export async function generateVoice(opts: GenerateOptions): Promise<GenerateResult> {
  const res = await fetch(`${API_URL}/${opts.mode ?? "tts"}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: opts.text,
      voice: opts.voice,
      speed: opts.speed ?? 1,
      pause_ms: opts.pauseMs ?? 350,
      format: opts.format ?? "mp3",
    }),
  });
  if (!res.ok) {
    let message = `Something went wrong (error ${res.status}).`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") message = body.detail;
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }
  const blob = await res.blob();
  return {
    url: URL.createObjectURL(blob),
    seconds: Number(res.headers.get("X-Audio-Seconds") ?? 0),
    minutes: Number(res.headers.get("X-Minutes-Used") ?? 0),
    lines: Number(res.headers.get("X-Lines") ?? 0),
  };
}

export function estimateSeconds(chars: number, speed = 1): number {
  return Math.max(1, Math.round((chars / 1070) * 60 / speed));
}
