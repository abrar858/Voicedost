# VoiceDost

Low-cost AI voiceovers in English and Hindi for YouTube, Reels and TikTok creators.

## What is here (milestone 1)

| Part | Folder | Status |
|---|---|---|
| Voice API (FastAPI + Kokoro) | `backend/` | Working: voices, text-to-speech to MP3/WAV, limits |
| Test studio page | `web/index.html` | Working: simple page served by the API |
| Website (Next.js 16) | `frontend/` | Working: marketing site (voices, pricing, use cases, services, free tools, blog, about, contact, legal outlines) and studio |
| Accounts, billing, admin | `frontend/src/lib/auth`, `lib/billing`, `backend/app/services` | Structure and placeholders ready, switched off |

Voices at launch: George (British), Emma (British), Michael (American), Hindi female, Hindi male.
The engine is [Kokoro](https://github.com/thewh1teagle/kokoro-onnx) (Apache-2.0), which allows use in a paid product.

## How it is organised

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the folder structure, request flow and the steps to switch on accounts and payments, and [docs/DATA-MODEL.md](docs/DATA-MODEL.md) for the planned database.

## Run it locally

```bash
cd backend
pip install -r requirements.txt        # also needs ffmpeg and espeak-ng installed
bash scripts/download_models.sh        # about 350 MB, once
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000 for the studio, or http://localhost:8000/docs for the API.

## Run the website

```bash
cd frontend
cp .env.example .env.local     # set NEXT_PUBLIC_API_URL if the API is elsewhere
npm install
npm run dev                    # http://localhost:3000
```

Main pages: `/`, `/voices`, `/pricing`, `/use-cases`, `/services`, `/tools`, `/blog`, `/about`, `/contact`, `/legal/*`, `/studio`. Placeholders: `/login`, `/signup`, `/dashboard`, `/account`, `/account/billing`, `/admin`.
Voice samples in `frontend/public/samples/` were generated with the API.

## Run with Docker

```bash
docker build -f backend/Dockerfile -t voicedost-api .
docker run -p 8000:8000 voicedost-api
```

## API

| Method | Path | What it does |
|---|---|---|
| GET | `/health` | Status and whether the voice model is loaded |
| GET | `/voices` | Voice list for the website |
| POST | `/tts` | `{text, voice, speed, pause_ms, format}` → MP3 or WAV (up to 5,000 characters) |
| POST | `/try` | Same, for the landing page "try it" box (up to 200 characters) |

Every audio response carries `X-Audio-Seconds`, `X-Minutes-Used` and `X-Lines` headers, so the website can charge minutes.

Settings (environment variables): `VOICEDOST_MAX_CHARS`, `VOICEDOST_TRY_MAX_CHARS`, `VOICEDOST_MAX_CONCURRENT_JOBS`, `VOICEDOST_ALLOWED_ORIGINS`, `VOICEDOST_MODELS_DIR`.

## Tests

```bash
cd backend && pytest -q
```

## Roadmap

1. ✅ Voice API and test studio
2. ✅ Website (Next.js): landing page, SEO tool pages, studio
3. ✅ Site structure for marketing, product, accounts, billing and admin
4. Accounts and minute balances (Supabase)
5. Plans, one-off packs and top-ups (Stripe)
6. Admin panel, terms and privacy pages
7. Deploy: API on a 4-core server, website on Vercel
