# VoiceDost

Low-cost AI voiceovers in English and Hindi for YouTube, Reels and TikTok creators.

## What is here (milestone 1)

| Part | Folder | Status |
|---|---|---|
| Voice API (FastAPI + Kokoro) | `backend/` | Working: voices, text-to-speech to MP3/WAV, limits |
| Test studio page | `web/index.html` | Working: paste script, pick voice, generate, download |
| Website (Next.js), accounts, plans, Stripe | — | Next milestones |

Voices at launch: George (British), Emma (British), Michael (American), Hindi female, Hindi male.
The engine is [Kokoro](https://github.com/thewh1teagle/kokoro-onnx) (Apache-2.0), which allows use in a paid product.

## Run it locally

```bash
cd backend
pip install -r requirements.txt        # also needs ffmpeg and espeak-ng installed
bash scripts/download_models.sh        # about 350 MB, once
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000 for the studio, or http://localhost:8000/docs for the API.

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
2. Website (Next.js): landing page, SEO tool pages, studio
3. Accounts and minute balances (Supabase)
4. Plans, one-off packs and top-ups (Stripe)
5. Admin panel, terms and privacy pages
6. Deploy: API on a 4-core server, website on Vercel
