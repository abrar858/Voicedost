# Data model (Supabase Postgres)

Live now: `profiles`, `minute_grants`, `usage_events` and the functions `account_summary()` and `record_usage()` (see `supabase/migrations/`). The rest is planned.

| Table | Key columns | Purpose |
|---|---|---|
| `profiles` | `id` (= auth user id), `email`, `name`, `is_admin`, `created_at` | One row per user |
| `subscriptions` | `user_id`, `plan` (starter, creator), `kind` (subscription, pack30), `status`, `period_start`, `period_end`, `provider` (stripe, jazzcash, easypaisa, crypto), `provider_ref` | Current plan and when it ends |
| `minute_grants` | `user_id`, `minutes`, `source` (free, plan, pack30, topup, manual), `expires_at`, `provider_ref` | Minutes added to a balance |
| `usage_events` | `user_id`, `minutes`, `characters`, `voice`, `created_at` | Minutes spent, one row per generation |
| `projects` | `user_id`, `title`, `script`, `voice`, `speed`, `pause_ms`, `audio_key`, `seconds`, `created_at` | Saved voiceovers (audio in R2) |
| `payments` | `user_id`, `amount_pence`, `currency`, `provider`, `provider_ref`, `status`, `created_at` | Every payment, for the admin panel and accounts |
| `service_enquiries` | `email`, `service`, `message`, `status`, `created_at` | Done-for-you quote requests |
| `abuse_reports` | `reporter_email`, `project_id`, `reason`, `status` | Misuse reports |

**Minutes left** = plan minutes for this month (reset monthly, no rollover) + top-up minutes (never expire) − minutes used. Spend plan minutes first, then top-ups. Top-up grants have `expires_at` = null.

Row-level security: users read and write only their own rows; admin reads all.
