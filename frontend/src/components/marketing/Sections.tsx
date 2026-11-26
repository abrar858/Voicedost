import Link from "next/link";
import { FAQS, PLANS } from "@/content/plans";
import { VOICES } from "@/content/voices";

const FEATURED = ["grace", "george", "emma", "ryan", "hindi-female", "hindi-male"];

export function VoiceCards({ heading = true, featured = false }: { heading?: boolean; featured?: boolean }) {
  const list = featured ? VOICES.filter((v) => FEATURED.includes(v.id)) : VOICES;
  return (
    <section id="voices" className="band section">
      <div className="wrap stack">
        {heading && (
          <>
            <h2>Voices that sound like people, not robots</h2>
            <p className="lead">{VOICES.length} voices in British and American English plus Hindi, all ready for narration.</p>
          </>
        )}
        <div className="grid">
          {list.map((v) => (
            <div className="card" key={v.id}>
              <span className="name">{v.name}</span>
              <span className="muted">{v.language} · {v.gender}</span>
              <span>{v.use}</span>
              <audio controls preload="none" src={`/samples/${v.id}.mp3`} aria-label={`${v.name} sample`} />
            </div>
          ))}
        </div>
        {featured && (
          <Link href="/voices" className="btn btn-outline" style={{ alignSelf: "center" }}>Hear all {VOICES.length} voices</Link>
        )}
      </div>
    </section>
  );
}

export function Steps() {
  const steps = [
    ["Paste your script", "Long scripts are split into lines you can check one by one."],
    ["Pick a voice and speed", "Choose English or Hindi, then set the speed and the pause between lines."],
    ["Download and post", "Get an MP3 or WAV ready for your video editor."],
  ];
  return (
    <section id="how" className="section">
      <div className="wrap stack">
        <h2>Three steps, under a minute</h2>
        <ol className="steps">
          {steps.map(([title, body], i) => (
            <li key={title}>
              <span className="num">{i + 1}</span>
              <strong style={{ fontSize: 20 }}>{title}</strong>
              <span style={{ color: "var(--ink-2)" }}>{body}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Pricing({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section id="pricing" className="dark section">
      <div className="wrap stack">
        <Heading>Simple prices. Cancel any time.</Heading>
        <p className="lead">Card blocks subscriptions? Buy any plan as a one-off 30-day pack instead.</p>
        <div className="grid">
          {PLANS.map((p) => (
            <div key={p.name} className={`plan${p.featured ? " featured" : ""}`}>
              <strong style={{ fontSize: 18 }}>{p.name}</strong>
              <span className="price">{p.price}<span>{p.per}</span></span>
              <strong>{p.minutes}</strong>
              <span style={{ opacity: 0.85 }}>{p.note}</span>
              {/* [PAYMENTS] point to /account/billing?plan=… once Stripe is on */}
              <Link href="/studio" className={`btn ${p.featured ? "btn-orange" : "btn-light"}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
        <p className="muted">Pay by card, Apple Pay or Google Pay. More local payment options coming soon.</p>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="section">
      <div className="wrap stack faq" style={{ maxWidth: 840 }}>
        <h2>Questions</h2>
        <div>
          {FAQS.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SignupBand() {
  return (
    <section className="wrap" style={{ paddingBottom: 72 }}>
      <div className="cta">
        <h2>Your next video deserves a voice. Start free today.</h2>
        <Link href="/studio" className="btn btn-dark">Open the studio</Link>
      </div>
    </section>
  );
}
