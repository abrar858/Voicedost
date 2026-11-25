# VoiceDost architecture

VoiceDost is two things on one site:

1. **A marketing site** that sells the voiceover platform and done-for-you services (voices, pricing, use cases, services, free SEO tools, blog).
2. **A product** (studio, projects, account, billing) that we also use ourselves for our own channels.

## Parts

| Part | Tech | Hosting (planned) | Folder |
|---|---|---|---|
| Website | Next.js 16 (App Router) | Vercel | `frontend/` |
| Voice API | Python, FastAPI, Kokoro (Apache-2.0) | 4-core VPS (e.g. Hetzner) | `backend/` |
| Accounts + database | Supabase (Postgres + Auth) | Supabase | not built yet |
| Payments | Stripe (cards, Apple/Google Pay), later JazzCash, Easypaisa, crypto | Stripe | not built yet |
| Audio files | Cloudflare R2 | Cloudflare | not built yet |

## Website structure (`frontend/src`)

```
app/
  (marketing)/          public pages, shared header + footer
    page.tsx            /            landing page + try box
    voices/             /voices
    pricing/            /pricing
    use-cases/          /use-cases, /use-cases/[slug]
    services/           /services    done-for-you work (quotes by email)
    tools/              /tools, /tools/[slug]   free SEO tool pages
    blog/               /blog, /blog/[slug]
    about/ contact/
    legal/[slug]/       /legal/terms, privacy, refunds, acceptable-use (outlines)
  (product)/            signed-in area, product header, not indexed
    studio/             /studio      works now (open for testing)
    dashboard/          /dashboard   placeholder: saved projects
    account/            /account     placeholder
    account/billing/    /account/billing  placeholder: plans, packs, top-ups
  (auth)/               /login, /signup   placeholders until accounts are on
  admin/                /admin       placeholder owner dashboard
config/
  site.ts               name, email, navigation, footer links
  features.ts           feature switches (accounts, payments, admin, open studio)
content/
  voices.ts plans.ts pages.ts legal.ts   all words and lists, kept out of components
components/
  marketing/  product/  ui/
lib/
  api.ts                calls the voice API
  auth/                 getCurrentUser, signIn, signOut   (interface, not built)
  billing/              createCheckout, createBillingPortal (interface, not built)
```

Rules: page text and lists live in `content/`, navigation in `config/site.ts`. Pages never call Supabase or Stripe directly; they call `lib/auth` and `lib/billing`, so providers can change later.

## Voice API structure (`backend/app`)

```
core/       config.py (env settings), voices.py (catalogue), plans.py (limits)
services/   tts.py (Kokoro engine)
            auth.py (current user: placeholder)
            usage.py (minute balances: placeholder, unlimited now)
            billing.py (grant minutes from payments: placeholder)
routers/    health.py, voices.py, tts.py (/tts and /try)
```

## How a voiceover is made

1. The browser sends `{text, voice, speed, pause_ms, format}` to `POST /tts` (or `/try`, 200 characters, no account).
2. The API checks length and voice, then `usage.check_minutes` (no limit while accounts are off).
3. Kokoro speaks each line; lines are joined with the chosen pause and encoded to MP3 or WAV.
4. The response carries `X-Minutes-Used`; `usage.record_usage` will store it once accounts exist.

## Switching on accounts (next phase)

1. Create a Supabase project; add its keys to both apps' environment.
2. Create the tables in `docs/DATA-MODEL.md`.
3. Implement `frontend/src/lib/auth` and `backend/app/services/auth.py` (verify the Supabase token).
4. Implement `services/usage.py` against `usage_events` and `minute_grants`.
5. Fill in `/login`, `/signup`, `/dashboard`, `/account` (each has an `[ACCOUNTS]` note).
6. Set `NEXT_PUBLIC_FEATURE_ACCOUNTS=1`, then `NEXT_PUBLIC_FEATURE_OPEN_STUDIO=0` when ready.

## Switching on payments

1. Create Stripe products for Starter, Creator, Top-up; put the price ids in env.
2. Implement `lib/billing` (Checkout session, customer portal) and `services/billing.py` (webhooks granting minutes).
3. Point the pricing buttons at `/account/billing?plan=…` (marked `[PAYMENTS]`).
4. Set `NEXT_PUBLIC_FEATURE_PAYMENTS=1`.

Search the code for `[ACCOUNTS]`, `[PAYMENTS]`, `[ADMIN]` to find every slot. Placeholders for decisions not made yet are written `[YOUR PRICE]`, `[YOUR POLICY]`, `[CONFIRM IN TERMS]`, `[TO BE WRITTEN]`.
