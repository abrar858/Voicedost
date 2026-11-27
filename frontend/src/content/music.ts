/** Background tracks. Ids match backend/app/core/music.py. Previews live in /public/music. */
export const MUSIC = [
  { id: "calm", name: "Soft Morning", mood: "Calm" },
  { id: "uplifting", name: "Rise Up", mood: "Motivational" },
  { id: "cinematic", name: "Epic Story", mood: "Cinematic" },
  { id: "lofi", name: "Chill Study", mood: "Lo-fi" },
  { id: "kids", name: "Happy Play", mood: "Kids" },
  { id: "tech", name: "Bright Tech", mood: "Tech & business" },
] as const;

export type MusicId = (typeof MUSIC)[number]["id"];
