/**
 * Legal page OUTLINES only. Each must be written properly (ideally checked by a
 * solicitor) before taking payments. Nothing here is legal text.
 */
export type LegalPage = { slug: string; title: string; sections: string[] };

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: "terms",
    title: "Terms of use",
    sections: ["Who we are (company name and address)", "Your account", "Plans, minutes and renewals", "Commercial use of generated audio", "What you must not do", "Ending your account", "Liability", "Changes to these terms", "Governing law (England and Wales)"],
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    sections: ["What we collect (email, scripts, usage)", "Why we collect it", "Who we share it with (hosting, payments)", "How long we keep it", "Your rights under UK GDPR", "Cookies", "Contact"],
  },
  {
    slug: "refunds",
    title: "Refund policy",
    sections: ["Subscriptions", "One-off packs and top-ups", "Unused minutes", "How to ask for a refund"],
  },
  {
    slug: "acceptable-use",
    title: "Acceptable use",
    sections: ["No impersonation of real people", "No scams, fraud or misleading announcements", "No hate, harassment or illegal content", "Reporting misuse", "What happens if rules are broken"],
  },
];
