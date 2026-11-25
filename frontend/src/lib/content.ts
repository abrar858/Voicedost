export type Voice = { id: string; name: string; language: string; gender: string; use: string };

export const VOICES: Voice[] = [
  { id: "george", name: "George", language: "British English", gender: "male", use: "Calm and clear. Great for history and explainers." },
  { id: "emma", name: "Emma", language: "British English", gender: "female", use: "Warm and friendly. Great for tutorials and vlogs." },
  { id: "michael", name: "Michael", language: "American English", gender: "male", use: "Confident. Great for tech, reviews and ads." },
  { id: "hindi-female", name: "Hindi · Female", language: "Hindi", gender: "female", use: "Natural Hindi narration for Reels and Shorts." },
  { id: "hindi-male", name: "Hindi · Male", language: "Hindi", gender: "male", use: "Clear Hindi narration for stories and news." },
];

export type Plan = { name: string; price: string; per: string; minutes: string; note: string; cta: string; featured?: boolean };

export const PLANS: Plan[] = [
  { name: "Free", price: "£0", per: "", minutes: "10 minutes a month", note: "All voices, MP3 downloads.", cta: "Start free" },
  { name: "Starter", price: "£3", per: "/month", minutes: "60 minutes a month", note: "MP3 and WAV, saved projects.", cta: "Choose Starter" },
  { name: "Creator", price: "£5", per: "/month", minutes: "180 minutes a month", note: "Best value for weekly uploads.", cta: "Choose Creator", featured: true },
  { name: "Top-up", price: "£1", per: " one-off", minutes: "+30 minutes", note: "Add to any plan when you run low.", cta: "Buy top-up" },
];

export const FAQS = [
  { q: "Can I use the voiceovers in monetised videos?", a: "[CONFIRM IN TERMS] Paid plans are intended to include commercial use for YouTube, TikTok and Reels." },
  { q: "Which languages are available?", a: "British English, American English and Hindi at launch." },
  { q: "My card does not allow subscriptions. Can I still pay?", a: "Yes. Every plan can be bought as a one-off 30-day pack, with no automatic renewal." },
  { q: "Do unused minutes roll over?", a: "[YOUR POLICY] Decide before launch." },
];

export type ToolPage = {
  slug: string;
  title: string;
  h1: string;
  intro: string;
  defaultVoice: string;
  sample: string;
  tips: string[];
};

export const TOOL_PAGES: ToolPage[] = [
  {
    slug: "hindi-text-to-speech",
    title: "Free Hindi Text to Speech – Natural AI Voice | VoiceDost",
    h1: "Free Hindi text to speech",
    intro: "Type Hindi text and hear it in a natural male or female voice. Download the MP3 for Reels, Shorts and YouTube.",
    defaultVoice: "hindi-female",
    sample: "नमस्ते दोस्तों! आज के वीडियो में हम सीखेंगे कुछ आसान टिप्स।",
    tips: ["Write in Devanagari script for the best pronunciation.", "Use full stops (।) to add natural pauses.", "Keep sentences short for clear narration."],
  },
  {
    slug: "ai-voiceover-for-youtube",
    title: "AI Voiceover for YouTube Videos – Free to Try | VoiceDost",
    h1: "AI voiceover for YouTube",
    intro: "Turn your video script into a clear, natural voiceover in seconds. Perfect for faceless channels, explainers and Shorts.",
    defaultVoice: "george",
    sample: "Welcome back to the channel! Today we're looking at three facts you probably didn't know.",
    tips: ["Split your script into short lines so you can redo any line.", "Use a slightly slower speed for explainers.", "Add a pause between sections to give viewers time."],
  },
  {
    slug: "british-accent-text-to-speech",
    title: "British Accent Text to Speech – Free AI Voices | VoiceDost",
    h1: "British accent text to speech",
    intro: "Natural British English voices, male and female, for narration, training videos and podcasts.",
    defaultVoice: "emma",
    sample: "Good morning, and welcome to today's lesson. Let's get started.",
    tips: ["George suits calm narration; Emma suits friendly tutorials.", "British spellings like 'colour' read naturally.", "Write numbers as words if you want them read a certain way."],
  },
];

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://voicedost.com";
