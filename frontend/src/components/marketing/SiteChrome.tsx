import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { AccountLink } from "@/components/account/AccountLink";
import { FOOTER_GROUPS, MAIN_NAV, PRODUCT_NAV, SITE } from "@/config/site";

/** Header for public marketing pages. */
export function Header() {
  return (
    <header className="header">
      <Logo />
      <nav className="nav" aria-label="Main">
        {MAIN_NAV.map((l) => (
          <Link key={l.href} href={l.href}>{l.label}</Link>
        ))}
        <AccountLink />
        <Link href="/studio" className="btn btn-dark">Open studio</Link>
      </nav>
    </header>
  );
}

/** Header for the product area (studio, projects, account). */
export function ProductHeader() {
  return (
    <header className="header">
      <Logo />
      <nav className="nav" aria-label="Product">
        {PRODUCT_NAV.map((l) => (
          <Link key={l.href} href={l.href}>{l.label}</Link>
        ))}
        <Link href="/pricing" className="btn btn-orange">Upgrade</Link>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="stack" style={{ gap: 8 }}>
          <Logo />
          <span>{SITE.tagline}</span>
          <span>© 2026 {SITE.name}</span>
        </div>
        {FOOTER_GROUPS.map((g) => (
          <nav key={g.title} aria-label={g.title} className="footer-col">
            <strong>{g.title}</strong>
            {g.links.map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
          </nav>
        ))}
      </div>
    </footer>
  );
}
