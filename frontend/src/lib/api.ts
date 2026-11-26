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

// ------------------------------------------------------------ studio jobs

export type JobStatus = {
  id: string;
  status: "queued" | "running" | "done" | "error";
  done: number;
  total: number;
  error: string | null;
  seconds: number;
  minutes: number;
  minutes_left: number | null;
  format: "mp3" | "wav";
};

export type JobResult = { audioUrl: string; srtUrl: string; job: JobStatus };

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === "string") return body.detail;
  } catch {
    /* keep default */
  }
  return `Something went wrong (error ${res.status}).`;
}

/**
 * Makes a studio voiceover as a background job, reporting progress, then
 * downloads the audio and subtitles. Handles scripts up to 10,000 characters.
 */
export async function generateWithProgress(
  opts: GenerateOptions,
  onProgress: (job: JobStatus) => void,
): Promise<JobResult> {
  if (!API_URL) throw new Error(OFFLINE_MESSAGE);
  const auth: Record<string, string> = opts.token ? { Authorization: `Bearer ${opts.token}` } : {};
  let res: Response;
  try {
    res = await fetch(`${API_URL}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth },
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
  if (!res.ok) throw new Error(await errorMessage(res));
  let job: JobStatus = await res.json();
  onProgress(job);

  let failures = 0;
  while (job.status === "queued" || job.status === "running") {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const r = await fetch(`${API_URL}/jobs/${job.id}`);
      if (!r.ok) throw new Error(await errorMessage(r));
      job = await r.json();
      failures = 0;
      onProgress(job);
    } catch (e) {
      if (++failures >= 10) throw e instanceof Error ? e : new Error("Lost contact with the voice server.");
    }
  }
  if (job.status === "error") throw new Error(job.error || "Could not make the voice.");

  const [audio, srt] = await Promise.all([
    fetch(`${API_URL}/jobs/${job.id}/audio`),
    fetch(`${API_URL}/jobs/${job.id}/srt`),
  ]);
  if (!audio.ok) throw new Error(await errorMessage(audio));
  const srtText = srt.ok ? await srt.text() : "";
  return {
    audioUrl: URL.createObjectURL(await audio.blob()),
    srtUrl: URL.createObjectURL(new Blob([srtText], { type: "application/x-subrip" })),
    job,
  };
}
