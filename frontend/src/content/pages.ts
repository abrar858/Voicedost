/** Content for SEO tool pages, use-case pages, services and the blog. */

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

export type UseCase = { slug: string; title: string; h1: string; intro: string; points: string[]; voice: string; sample: string };

export const USE_CASES: UseCase[] = [
  {
    slug: "faceless-youtube",
    title: "Voiceovers for Faceless YouTube Channels | VoiceDost",
    h1: "Faceless YouTube channels",
    intro: "Publish more videos without recording your own voice. Keep the same narrator across every upload.",
    points: ["One consistent narrator for your whole channel", "Redo a single line instead of re-recording", "180 minutes a month on Creator covers about twenty 8-minute videos"],
    voice: "george",
    sample: "Welcome back! In today's video we uncover the story behind one of history's strangest mysteries.",
  },
  {
    slug: "reels-and-shorts",
    title: "Voiceovers for Reels, Shorts and TikTok | VoiceDost",
    h1: "Reels, Shorts and TikTok",
    intro: "Quick, punchy narration in English or Hindi for short videos. Generate in seconds, drop it into your editor.",
    points: ["Hindi and English voices", "Speed control for fast-paced edits", "MP3 ready for CapCut, InShot or Premiere"],
    voice: "hindi-male",
    sample: "रुकिए! यह वीडियो आपका बहुत समय बचाएगा।",
  },
  {
    slug: "training-and-education",
    title: "Voiceovers for Training and Education Videos | VoiceDost",
    h1: "Training and education",
    intro: "Clear British and American voices for lessons, onboarding and course videos, at a fraction of studio cost.",
    points: ["Calm, clear delivery for learning", "Update a lesson by changing one line", "WAV downloads for course platforms"],
    voice: "emma",
    sample: "In this lesson, we'll cover the three steps to get started safely.",
  },
  {
    slug: "small-business",
    title: "Voiceovers for Small Business Videos and Ads | VoiceDost",
    h1: "Small business videos and ads",
    intro: "Product demos, social ads and shop announcements with a professional voice, no studio needed.",
    points: ["Confident voices for ads", "Make variations to test which ad works", "Low monthly cost"],
    voice: "michael",
    sample: "Big savings this weekend only. Visit us in store or order online today.",
  },
];

export type Service = { name: string; description: string; includes: string[]; price: string };

/** Done-for-you services sold through the site. Prices are placeholders until decided. */
export const SERVICES: Service[] = [
  {
    name: "Voiceover for your video",
    description: "Send your script; we deliver a polished voiceover, checked line by line.",
    includes: ["English or Hindi voice", "Pronunciation checked", "MP3 and WAV files"],
    price: "[YOUR PRICE]",
  },
  {
    name: "Script + voiceover",
    description: "Tell us the topic; we write the script and record it with an AI voice.",
    includes: ["Research and script", "One round of changes", "Ready-to-edit audio"],
    price: "[YOUR PRICE]",
  },
  {
    name: "Animated explainer video",
    description: "A complete animated video with maps, charts or characters, narrated and scored.",
    includes: ["Script, voice and animation", "Vertical or landscape", "Music included"],
    price: "[YOUR PRICE]",
  },
];

export type BlogPost = { slug: string; title: string; summary: string; date: string; body: string[] };

/** Add posts here. Empty until real articles are written. */
export const BLOG_POSTS: BlogPost[] = [];
