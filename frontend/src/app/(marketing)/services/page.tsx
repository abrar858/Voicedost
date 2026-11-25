import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/ComingSoon";
import { SERVICES } from "@/content/pages";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Done-for-you voiceovers and videos",
  description: "Too busy? We write, voice and animate your videos for you, in English or Hindi.",
};

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        pill="Done for you"
        title="Let us make it for you"
        lead="Send us your idea or script. We handle the voice, and the whole video if you want it."
      />
      <section className="wrap section" style={{ paddingTop: 24 }}>
        <div className="grid">
          {SERVICES.map((s) => (
            <div key={s.name} className="card" style={{ border: "1px solid var(--line)" }}>
              <span className="name">{s.name}</span>
              <span>{s.description}</span>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {s.includes.map((i) => <li key={i}>{i}</li>)}
              </ul>
              <strong style={{ fontSize: 20 }}>{s.price}</strong>
              <a className="btn btn-dark" href={`mailto:${SITE.email}?subject=${encodeURIComponent(s.name)}`}>Ask for a quote</a>
            </div>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 16 }}>Email us at {SITE.email} with your script or idea.</p>
      </section>
    </>
  );
}
