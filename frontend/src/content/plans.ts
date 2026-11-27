export type PlanId = "free" | "starter" | "creator" | "topup";

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  per: string;
  minutesPerMonth: number;
  minutes: string;
  note: string;
  cta: string;
  featured?: boolean;
  /** Billed once (no renewal). Subscriptions can also be bought as one-off 30-day packs. */
  oneOff?: boolean;
};

/** Single source of truth for plan limits shown on the site. Keep in step with backend/app/core/plans.py */
export const PLANS: Plan[] = [
  { id: "free", name: "Free", price: "£0", per: "", minutesPerMonth: 60, minutes: "60 minutes a month", note: "All voices, MP3 downloads.", cta: "Start free" },
  { id: "starter", name: "Starter", price: "£3", per: "/month", minutesPerMonth: 300, minutes: "300 minutes a month", note: "MP3 and WAV, saved projects.", cta: "Choose Starter" },
  { id: "creator", name: "Creator", price: "£5", per: "/month", minutesPerMonth: 1000, minutes: "1,000 minutes a month", note: "Best value for weekly uploads.", cta: "Choose Creator", featured: true },
  { id: "topup", name: "Top-up", price: "£1", per: " one-off", minutesPerMonth: 120, minutes: "+120 minutes", note: "Never expires. Add to any plan when you run low.", cta: "Buy top-up", oneOff: true },
];

export const FAQS = [
  { q: "Can I use the voiceovers in monetised videos?", a: "Yes. You can use your voiceovers in monetised YouTube, TikTok, Reels and Facebook videos on every plan." },
  { q: "Which languages are available?", a: "British English, American English and Hindi, and the Hindi voices also read Urdu script. 13 voices in total." },
  { q: "Do I get subtitles?", a: "Yes. Every studio voiceover comes with a matching SRT subtitle file for YouTube, CapCut and Premiere." },
  { q: "Can I use more than one voice in a script?", a: "Yes. Start a line with a voice name, like Grace: or Ryan:, and the voice switches. Great for podcasts, stories and adverts." },
  { q: "Is the background music copyright-free?", a: "Yes. Our tracks are made by us and free to use in your videos, including monetised ones." },
  { q: "My card does not allow subscriptions. Can I still pay?", a: "Yes. Every plan can be bought as a one-off 30-day pack, with no automatic renewal." },
  { q: "Do unused minutes roll over?", a: "Plan minutes reset at the start of each month. Top-up minutes never expire and are used after your plan minutes." },
  { q: "Can you make the whole video for me?", a: "Yes. See our done-for-you services for voiceovers, scripts and animated videos." },
];
