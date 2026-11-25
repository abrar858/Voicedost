import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/ComingSoon";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with VoiceDost." };

export default function ContactPage() {
  return (
    <PageIntro title="Contact us" lead="Questions, partnerships or done-for-you work: we usually reply within one working day.">
      <div className="row">
        <a className="btn btn-dark" href={`mailto:${SITE.email}`}>Email {SITE.email}</a>
      </div>
      <p className="muted">[ADD] Business address once the company is registered.</p>
    </PageIntro>
  );
}
