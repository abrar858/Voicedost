import Link from "next/link";
import { FAQS, PLANS } from "@/content/plans";
import { VOICES } from "@/content/voices";

const FEATURED = ["grace", "george", "emma", "ryan", "bella", "oliver", "hindi-female", "hindi-male"];

export function VoiceCards({ heading = true, featured = false }: { heading?: boolean; featured?: boolean }) {
  const list = featured ? VOICES.filter((v) => FEATURED.includes(v.id)) : VOICES;
  return (
    <section id="voices" className="band section">
      <div className="wrap stack">
        {heading && (
          <>
            <h2>Voices that sound like people, not robots</h2>
            <p className="lead">{VOICES.length} voices in British and American English plus Hindi. Type in English, Hindi or Urdu script.</p>
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
    ["Download and post", "Get an MP3 or WAV plus a matching subtitles file (SRT) for your video editor."],
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

const FEATURE_LIST = [
  { icon: "🎙️", title: "13 natural voices", text: "British and American English plus Hindi, male and female, for every kind of video." },
  { icon: "🇵🇰", title: "Urdu and Hindi script", text: "Type in Urdu or Hindi and it is read the way it should sound." },
  { icon: "💬", title: "Subtitles included", text: "Every voiceover comes with a timed SRT file for YouTube, CapCut and Premiere." },
  { icon: "🎵", title: "Background music", text: "Six copyright-free tracks that dip automatically while the voice speaks." },
  { icon: "👥", title: "Several voices in one script", text: "Write Grace: and Ryan: before lines to make podcasts, stories and ads." },
  { icon: "⏸️", title: "Pauses and pronunciation", text: "Add [pause 2s] anywhere and teach the voice how to say names." },
  { icon: "📲", title: "Share on WhatsApp", text: "Send a link to your voiceover so friends and clients can listen instantly." },
  { icon: "💾", title: "Saved on your phone", text: "Your last 10 voiceovers stay on your device, ready to download again." },
];

export function Features() {
  return (
    <section className="section" id="features">
      <div className="wrap stack">
        <h2>Everything a creator needs</h2>
        <p className="lead">More than a voice: the extras that usually cost money elsewhere are built in.</p>
        <div className="feature-grid">
          {FEATURE_LIST.map((f) => (
            <div key={f.title} className="feature">
              <span className="feature-icon" aria-hidden>{f.icon}</span>
              <strong>{f.title}</strong>
              <span className="muted">{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
