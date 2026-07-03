# CV Doktoru

> "CV'ni hazırla. İlanla eşleştir. Daha güçlü başvur."

Türkiye'deki iş arayanlar için AI destekli CV oluşturma, iş ilanı eşleştirme ve
başvuru hazırlığı platformu.

## Proje Yapısı

Bu bir monorepo'dur:

- [`frontend/`](frontend) — React + Vite + TypeScript + TailwindCSS + shadcn/ui
- [`backend/`](backend) — FastAPI + SQLAlchemy + PostgreSQL + Alembic

Detaylı mimari ve fazlı yol haritası için proje planına bakınız.

## Geliştirme Ortamını Kurma

### Ön Koşullar

- Node.js 20+
- Python 3.12+ ve [uv](https://docs.astral.sh/uv/)
- Docker Desktop (local PostgreSQL için)

### Backend

```bash
cd backend
cp .env.example .env
docker compose up -d        # PostgreSQL'i başlatır
uv run uvicorn app.main:app --reload
```

API dokümantasyonu: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Uygulama: http://localhost:5173

## Teknoloji Yığını

| Katman     | Teknolojiler                                                        |
| ---------- | -------------------------------------------------------------------- |
| Frontend   | React, Vite, TypeScript, TailwindCSS, shadcn/ui, React Router, TanStack Query, React Hook Form, Zod |
| Backend    | FastAPI, SQLAlchemy, PostgreSQL, Alembic, JWT, Pydantic, OpenAI API   |
| PDF        | Playwright (headless Chromium)                                       |
| Deployment | Vercel (frontend) · Railway (backend + PostgreSQL)                   |
