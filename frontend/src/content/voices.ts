export type Voice = { id: string; name: string; language: string; gender: string; use: string };

/** Must match the ids in backend/app/core/voices.py */
export const VOICES: Voice[] = [
  { id: "george", name: "George", language: "British English", gender: "male", use: "Calm and clear. Great for history and explainers." },
  { id: "emma", name: "Emma", language: "British English", gender: "female", use: "Warm and friendly. Great for tutorials and vlogs." },
  { id: "michael", name: "Michael", language: "American English", gender: "male", use: "Confident. Great for tech, reviews and ads." },
  { id: "hindi-female", name: "Priya", language: "Hindi", gender: "female", use: "Natural Hindi narration for Reels and Shorts." },
  { id: "hindi-male", name: "Arjun", language: "Hindi", gender: "male", use: "Clear Hindi narration for stories and news." },
];
