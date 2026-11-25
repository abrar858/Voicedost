import type { Account } from "@/lib/auth";

export function formatMinutes(m: number): string {
  if (m >= 10) return `${Math.floor(m)} min`;
  const mins = Math.floor(m);
  const secs = Math.round((m - mins) * 60);
  return mins > 0 ? `${mins} min ${secs} s` : `${secs} s`;
}

/** Plan minutes left this month, plus top-up minutes. */
export function MinutesMeter({ account }: { account: Account }) {
  const pct = account.plan_minutes > 0 ? Math.min(100, (account.plan_left / account.plan_minutes) * 100) : 0;
  const resets = new Date(account.period_end).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <strong>{formatMinutes(account.minutes_left)} left</strong>
        <span className="muted">{formatMinutes(account.plan_left)} of {account.plan_minutes} plan minutes</span>
      </div>
      <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={account.plan_minutes} aria-valuenow={account.plan_left}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <span className="muted">
        Plan minutes reset on {resets}.
        {account.topup_left > 0 && <> Plus {formatMinutes(account.topup_left)} of top-up minutes that never expire.</>}
      </span>
    </div>
  );
}
