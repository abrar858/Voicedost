import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/ComingSoon";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: "Contact VoiceDost" },
  description: "Contact VoiceDost about AI voiceovers, plans, partnerships or done-for-you voiceover and video services. We usually reply within one working day.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageIntro title="Contact us" lead="Questions, partnerships or done-for-you work: we usually reply within one working day.">
      <div className="row">
        <a className="btn btn-dark" href={`mailto:${SITE.email}`}>Email {SITE.email}</a>
      </div>
      {/* [ADD] Business address once the company is registered. */}
    </PageIntro>
  );
}
