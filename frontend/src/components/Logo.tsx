import Link from "next/link";

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M8 4h24a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H18l-8 7v-7H8a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6z" fill="#F97316" />
      <rect x="11" y="14" width="3" height="8" rx="1.5" fill="#fff" />
      <rect x="16.5" y="10" width="3" height="16" rx="1.5" fill="#fff" />
      <rect x="22" y="12" width="3" height="12" rx="1.5" fill="#fff" />
      <rect x="27.5" y="15" width="3" height="6" rx="1.5" fill="#fff" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="VoiceDost home">
      <LogoMark />
      <span>
        Voice<span className="accent">Dost</span>
      </span>
    </Link>
  );
}
