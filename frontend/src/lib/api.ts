// Empty in production until the voice server is online (set NEXT_PUBLIC_API_URL in Vercel).
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "")).replace(/\/$/, "");

export const OFFLINE_MESSAGE = "Voice generation goes live very soon. Listen to the voice samples in the meantime.";

export type GenerateOptions = {
  text: string;
  voice: string;
  speed?: number;
  pauseMs?: number;
  format?: "mp3" | "wav";
  mode?: "try" | "tts";
  /** Login token; required for the studio once accounts are on. */
  token?: string | null;
};

export type GenerateResult = {
  url: string;
  seconds: number;
  minutes: number;
  lines: number;
  /** Minutes left after this generation (signed-in users only). */
  minutesLeft: number | null;
};

export async function generateVoice(opts: GenerateOptions): Promise<GenerateResult> {
  if (!API_URL) throw new Error(OFFLINE_MESSAGE);
  let res: Response;
  try {
    res = await fetch(`${API_URL}/${opts.mode ?? "tts"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      },
      body: JSON.stringify({
        text: opts.text,
        voice: opts.voice,
        speed: opts.speed ?? 1,
        pause_ms: opts.pauseMs ?? 350,
        format: opts.format ?? "mp3",
      }),
    });
  } catch {
    throw new Error("Could not reach the voice server. Please try again in a minute.");
  }
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
    minutesLeft: res.headers.get("X-Minutes-Left") === null ? null : Number(res.headers.get("X-Minutes-Left")),
  };
}

export function estimateSeconds(chars: number, speed = 1): number {
  return Math.max(1, Math.round((chars / 1070) * 60 / speed));
}

/** Plan and minute balance for the signed-in user. */
export async function fetchAccount(token: string): Promise<import("@/lib/auth").Account> {
  if (!API_URL) throw new Error(OFFLINE_MESSAGE);
  let res: Response;
  try {
    res = await fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    throw new Error("Could not reach the voice server to load your minutes.");
  }
  if (!res.ok) {
    let message = `Could not load your account (error ${res.status}).`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") message = body.detail;
    } catch {
      /* keep default */
    }
    throw new Error(message);
  }
  return res.json();
}
