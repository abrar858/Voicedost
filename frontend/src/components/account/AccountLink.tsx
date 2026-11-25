"use client";

import Link from "next/link";
import { useAccount } from "@/lib/auth/useAccount";

/** "Log in" in the header, or "Dashboard" once signed in. */
export function AccountLink() {
  const { state } = useAccount();
  if (state.status === "signed-in") return <Link href="/dashboard">Dashboard</Link>;
  return <Link href="/login">Log in</Link>;
}
