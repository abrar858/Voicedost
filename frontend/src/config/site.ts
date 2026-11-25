/** Site-wide settings: name, address, navigation. Edit here, not in components. */

export const SITE = {
  name: "VoiceDost",
  tagline: "Your voiceover dost.",
  description:
    "Natural AI voiceovers in English and Hindi. Paste your script, pick a voice and download an MP3 in seconds.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://voicedost.com",
  // [SET UP] create this mailbox (e.g. forward to Gmail) before launch
  email: "hello@voicedost.com",
};

export type NavLink = { href: string; label: string };

export const MAIN_NAV: NavLink[] = [
  { href: "/voices", label: "Voices" },
  { href: "/use-cases", label: "Use cases" },
  { href: "/pricing", label: "Pricing" },
  { href: "/services", label: "Services" },
  { href: "/tools", label: "Free tools" },
];

export const PRODUCT_NAV: NavLink[] = [
  { href: "/studio", label: "Studio" },
  { href: "/dashboard", label: "Projects" },
  { href: "/account/billing", label: "Billing" },
  { href: "/account", label: "Account" },
];

export const FOOTER_GROUPS: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/studio", label: "Studio" },
      { href: "/voices", label: "Voices" },
      { href: "/pricing", label: "Pricing" },
      { href: "/services", label: "Done-for-you services" },
    ],
  },
  {
    title: "Free tools",
    links: [
      { href: "/tools/hindi-text-to-speech", label: "Hindi text to speech" },
      { href: "/tools/ai-voiceover-for-youtube", label: "AI voiceover for YouTube" },
      { href: "/tools/british-accent-text-to-speech", label: "British accent text to speech" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of use" },
      { href: "/legal/privacy", label: "Privacy policy" },
      { href: "/legal/refunds", label: "Refund policy" },
      { href: "/legal/acceptable-use", label: "Acceptable use" },
    ],
  },
];
