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
  { id: "free", name: "Free", price: "£0", per: "", minutesPerMonth: 10, minutes: "10 minutes a month", note: "All voices, MP3 downloads.", cta: "Start free" },
  { id: "starter", name: "Starter", price: "£3", per: "/month", minutesPerMonth: 60, minutes: "60 minutes a month", note: "MP3 and WAV, saved projects.", cta: "Choose Starter" },
  { id: "creator", name: "Creator", price: "£5", per: "/month", minutesPerMonth: 180, minutes: "180 minutes a month", note: "Best value for weekly uploads.", cta: "Choose Creator", featured: true },
  { id: "topup", name: "Top-up", price: "£1", per: " one-off", minutesPerMonth: 30, minutes: "+30 minutes", note: "Add to any plan when you run low.", cta: "Buy top-up", oneOff: true },
];

export const FAQS = [
  { q: "Can I use the voiceovers in monetised videos?", a: "[CONFIRM IN TERMS] Paid plans are intended to include commercial use for YouTube, TikTok and Reels." },
  { q: "Which languages are available?", a: "British English, American English and Hindi at launch." },
  { q: "My card does not allow subscriptions. Can I still pay?", a: "Yes. Every plan can be bought as a one-off 30-day pack, with no automatic renewal." },
  { q: "Do unused minutes roll over?", a: "[YOUR POLICY] Decide before launch." },
  { q: "Can you make the whole video for me?", a: "Yes. See our done-for-you services for voiceovers, scripts and animated videos." },
];
