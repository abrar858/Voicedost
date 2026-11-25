import Link from "next/link";
import { Logo } from "./Logo";
import { TOOL_PAGES } from "@/lib/content";

export function Header() {
  return (
    <header className="header">
      <Logo />
      <nav className="nav" aria-label="Main">
        <Link href="/#voices">Voices</Link>
        <Link href="/#how">How it works</Link>
        <Link href="/#pricing">Pricing</Link>
        <Link href="/#faq">FAQ</Link>
        <Link href="/studio" className="btn btn-dark">Open studio</Link>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <span>© 2026 VoiceDost</span>
        <nav aria-label="Free tools">
          {TOOL_PAGES.map((t) => (
            <Link key={t.slug} href={`/tools/${t.slug}`}>{t.h1}</Link>
          ))}
        </nav>
        <nav aria-label="Legal">
          <a href="#terms">Terms of use</a>
          <a href="#privacy">Privacy</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
