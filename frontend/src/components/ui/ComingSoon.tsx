import Link from "next/link";

/** Placeholder for areas that are planned but not built yet. */
export function ComingSoon({ title, description, items }: { title: string; description: string; items?: string[] }) {
  return (
    <div className="stack" style={{ maxWidth: 720 }}>
      <span className="pill">Coming soon</span>
      <h1 style={{ fontSize: "clamp(36px, 5vw, 52px)" }}>{title}</h1>
      <p className="lead">{description}</p>
      {items && items.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 6 }}>
          {items.map((i) => <li key={i}>{i}</li>)}
        </ul>
      )}
      <div className="row">
        <Link href="/studio" className="btn btn-dark">Open the studio</Link>
        <Link href="/" className="btn btn-outline">Back to home</Link>
      </div>
    </div>
  );
}

/** Simple page heading block for marketing pages. */
export function PageIntro({ pill, title, lead, children }: { pill?: string; title: string; lead: string; children?: React.ReactNode }) {
  return (
    <section className="wrap" style={{ padding: "48px 24px 24px" }}>
      <div className="stack">
        {pill && <span className="pill">{pill}</span>}
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
        {children}
      </div>
    </section>
  );
}
