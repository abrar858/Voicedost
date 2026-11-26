export type Voice = { id: string; name: string; language: string; gender: string; use: string };

/** Must match the ids in backend/app/core/voices.py */
export const VOICES: Voice[] = [
  { id: "george", name: "George", language: "British English", gender: "male", use: "Calm and clear. Great for history and explainers." },
  { id: "emma", name: "Emma", language: "British English", gender: "female", use: "Warm and friendly. Great for tutorials and vlogs." },
  { id: "michael", name: "Michael", language: "American English", gender: "male", use: "Confident. Great for tech, reviews and ads." },
  { id: "grace", name: "Grace", language: "American English", gender: "female", use: "Our most natural voice. Warm and expressive for any video." },
  { id: "bella", name: "Bella", language: "American English", gender: "female", use: "Bright and lively. Great for Shorts, lifestyle and ads." },
  { id: "ryan", name: "Ryan", language: "American English", gender: "male", use: "Deep and steady. Great for documentaries and motivation." },
  { id: "jake", name: "Jake", language: "American English", gender: "male", use: "Upbeat and casual. Great for gaming, reviews and vlogs." },
  { id: "isabella", name: "Isabella", language: "British English", gender: "female", use: "Polished British voice for courses and corporate videos." },
  { id: "oliver", name: "Oliver", language: "British English", gender: "male", use: "Storyteller voice. Great for kids' stories and audiobooks." },
  { id: "hindi-female", name: "Priya", language: "Hindi", gender: "female", use: "Natural Hindi narration for Reels and Shorts." },
  { id: "hindi-male", name: "Arjun", language: "Hindi", gender: "male", use: "Clear Hindi narration for stories and news." },
  { id: "anaya", name: "Anaya", language: "Hindi", gender: "female", use: "Soft Hindi voice for motivation, poetry and devotional videos." },
  { id: "rohan", name: "Rohan", language: "Hindi", gender: "male", use: "Friendly Hindi voice for explainers and tutorials." },
];
