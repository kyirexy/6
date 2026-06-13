# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project identity

VideoCapsule — turn long Douyin videos into structured knowledge cards. Paste a video URL, the app extracts the transcript (ASR), AI generates a formatted card (sections + conclusion + pitfall rating), and the result is saved as a shareable note. The UI is Chinese-first, mobile-first, dark-glassmorphism.

## Commands

```bash
# Backend (Python 3.12, pip)
cd backend
pip install -r requirements.txt
python run.py                    # starts uvicorn on :8000 with reload

# Frontend (Next.js 16, npm)
cd frontend
npm install
npm run dev                      # Next.js dev server on :3000
npm run build                    # production build
npm run cap:build                # static export + Capacitor Android sync (sets NEXT_PUBLIC_API_URL for emulator)

# All-in-one startup
./start.sh                       # macOS/Linux — installs deps, starts backend then frontend
start.bat                        # Windows equivalent
```

No test runner or linter is configured yet. There are no `test` or `lint` scripts in either package.json/requirements.

## Monorepo layout

```
backend/          FastAPI app (port 8000) — video extraction, AI juicer, SQLite persistence
frontend/         Next.js 16 App Router (port 3000) — all client components, TailwindCSS v4
douyin-mcp-server/  Cloned dependency; backend imports DouyinProcessor from it
openspec/         OpenSpec change tracking (specs/ + changes/)
.env.example      Required env vars template (copy to .env)
```

## Core data flow (the "pipeline")

`POST /api/extract` runs a sequential pipeline:
1. **Parse** — `video_extractor.parse_video_info(url)` resolves the Douyin share link to metadata
2. **Transcribe** — primary: SiliconFlow ASR API (via douyin-mcp-server); fallback: local FunASR paraformer-large → faster-whisper
3. **AI generate** — `ai_juicer.detect_content_type()` (keyword heuristic) → `ai_juicer.generate_card()` (LiteLLM call to DeepSeek-V3, returning structured JSON: `{sections, conclusion, pitfall_rating}`)
4. **Persist** — `note_service.create_note()` writes to SQLite `notes` table; response includes the full `to_dict()` serialization

## Backend architecture

```
backend/app/
  main.py              FastAPI app factory — CORS (*), router, auto-creates tables on startup
  core/config.py       Pydantic-settings: DATABASE_URL, LLM_MODEL/API_BASE/API_KEY, ASR config
  core/database.py     SQLAlchemy engine + session factory + get_db() dependency
  models/note.py       Note ORM — single `notes` table, ai_summary is JSON-encoded text, to_dict() deserializes it
  api/routes.py        All endpoints (see below), standard response envelope {success, data, error}
  services/
    video_extractor.py   Wraps douyin-mcp-server + local ASR fallbacks
    ai_juicer.py         Content-type detection + LiteLLM prompt + completion
    local_asr.py         FunASR/faster-whisper unified transcribe() interface
    note_service.py      CRUD + SEO slug/title generation
```

**API endpoints:**
- `GET /api/health` — liveness
- `POST /api/video/info` — parse URL, return metadata (no download)
- `POST /api/extract` — full pipeline (parse → transcribe → AI → save)
- `GET /api/notes?page=&per_page=` — paginated list
- `GET /api/notes/{id}` — single note

**Response envelope:** `{success: bool, data: T | null, error: string | null}`

**LLM config:** Uses LiteLLM as a proxy layer. Default model is `mimo-v2.5-pro` via `https://token-plan-cn.xiaomimimo.com/anthropic` (Anthropic-compatible endpoint). Configurable via `LLM_MODEL`, `LLM_API_BASE`, `LLM_API_KEY` in `.env`.

**Database:** SQLite (`videocapsule.db` in backend root), SQLAlchemy ORM. Designed for future PostgreSQL migration — use SQLAlchemy's dialect abstraction.

## Frontend architecture

```
frontend/src/
  app/
    layout.tsx          Root layout — inter font, glass nav, theme toggle, QR modal, footer
    page.tsx            Home — 'use client', InputBar → CardRenderer, loading skeleton
    notes/page.tsx      Notes list + detail (via ?id= query param), pagination
    globals.css         ALL styles — CSS custom properties for dark/light themes, glassmorphism, animations
  components/
    InputBar.tsx        URL input with paste detection
    CardRenderer.tsx    Full card — header, sections, conclusion, export; double-bezel glass borders
    CardSection.tsx     Single section with emoji, title, formatted content
    Conclusion.tsx      "3-line ultimate takeaway" box
    PitfallRating.tsx   5-star rating display
    ThemeToggle.tsx     Dark/light with localStorage persistence
    ExportButton.tsx    → PNG via html2canvas
    QRModal.tsx / QRCodeDownload.tsx / MobileDownloadButton.tsx / AndroidBanner.tsx
  lib/
    api.ts              fetch wrappers: extractVideo(), getVideoInfo(), listNotes(), getNote()
    types.ts            CardData, CardSection, Note, NoteDetail, ApiResponse, PaginatedResponse, CARD_TYPE_CONFIG
```

**Important frontend facts:**
- **Next.js 16 / React 19** — the `frontend/AGENTS.md` warns: APIs and conventions may differ from your training data. Check `node_modules/next/dist/docs/` before writing Next.js code.
- **All pages are `'use client'`** — no server components, no server actions, no SSR. This is intentional for the SPA-like UX.
- **Dev API proxy** — `next.config.ts` rewrites `/api/*` → `http://localhost:8000/api/*` in dev mode. In production/static-export mode, set `NEXT_PUBLIC_API_URL` and the API client uses that.
- **Capacitor Android builds** use `output: 'export'` (static export) with `NEXT_PUBLIC_API_URL=http://10.0.2.2:8000` for Android emulator access to host localhost.
- **Styling** is TailwindCSS v4 (not v3 — `@import "tailwindcss"` in CSS, no `tailwind.config.ts` needed). The design system uses glassmorphism with double-bezel borders, emerald green accent (`#10b981`), and dark base (`#0a0a0f`). Full spec in `DESIGN.md`.

## Card types

Five content types detected by keyword matching in `ai_juicer.detect_content_type()`:

| Type | Label | Color accent |
|------|-------|-------------|
| `recipe` | 美食菜谱 | Orange |
| `insight` | 认知金句 | Emerald |
| `history` | 历史科普 | Amber |
| `product` | 好物推荐 | Rose |
| `general` | 通用知识 | Slate |

## Key constraints

- **Primary language is Chinese** — all UI text, code comments, API descriptions, and LLM prompts are in Chinese.
- **Douyin-only** — the video extractor targets Douyin (抖音) share links. YouTube/Bilibili are aspirational targets, not yet implemented.
- **SQLite for MVP** — no concurrent-write safety. The plan is to migrate to PostgreSQL.
- **No authentication** — the app is single-user/local. CORS is wide open.
- **No tests configured** — the DEVELOPMENT_SPEC.md references 80% coverage goals and ESLint/Ruff, but these are not yet set up.
- **`.modelcache/`** in the backend contains FunASR model files (~1-2 GB when downloaded). Do not commit it.

## Environment setup

Copy `.env.example` → `.env` and fill in:
- `API_KEY` — SiliconFlow API key for primary ASR
- `LLM_API_KEY` — API key for the LLM endpoint (DeepSeek or Anthropic-compatible)
- `LLM_MODEL` — model identifier (default `mimo-v2.5-pro`; use `deepseek/deepseek-chat` for DeepSeek)
- `LLM_API_BASE` — LiteLLM-compatible base URL

See `.env.example` for all variables. FFmpeg must be installed on the host system (or bundled via `imageio-ffmpeg` on Windows).
