/**
 * Legal page OUTLINES only. Each must be written properly (ideally checked by a
 * solicitor) before taking payments. Nothing here is legal text.
 */
export type LegalSection = { heading: string; text?: string };
export type LegalPage = { slug: string; title: string; sections: (string | LegalSection)[] };

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: "terms",
    title: "Terms of use",
    sections: ["Who we are (company name and address)", "Your account", { heading: "Plans, minutes and renewals", text: "Each plan gives a set number of minutes per month. Plan minutes reset at the start of each month and do not roll over. Top-up minutes never expire and are used after plan minutes. Plans can also be bought as one-off 30-day packs that do not renew." },
      { heading: "Commercial use of generated audio", text: "You may use voiceovers made with VoiceDost in monetised videos, including on YouTube, TikTok, Instagram and Facebook, on every plan, including Free." }, "What you must not do", "Ending your account", "Liability", "Changes to these terms", "Governing law (England and Wales)"],
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    sections: ["What we collect (email, scripts, usage)", "Why we collect it", "Who we share it with (hosting, payments)", "How long we keep it", "Your rights under UK GDPR", "Cookies", "Contact"],
  },
  {
    slug: "refunds",
    title: "Refund policy",
    sections: ["Subscriptions", "One-off packs and top-ups", { heading: "Unused minutes", text: "Plan minutes reset monthly and are not refunded. Top-up minutes never expire." }, "How to ask for a refund"],
  },
  {
    slug: "acceptable-use",
    title: "Acceptable use",
    sections: ["No impersonation of real people", "No scams, fraud or misleading announcements", "No hate, harassment or illegal content", "Reporting misuse", "What happens if rules are broken"],
  },
];
