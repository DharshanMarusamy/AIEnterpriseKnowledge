---
title: AI Enterprise Knowledge Backend
emoji: 🧠
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
app_port: 7860
---

# AI Enterprise Knowledge — FastAPI Backend

This is the backend API for the AI Enterprise Knowledge Assistant platform.

## Tech Stack
- **FastAPI** — REST API framework
- **PostgreSQL** — Main database (via `DATABASE_URL`)
- **Redis** — Caching & sessions (via `REDIS_URL`)
- **Qdrant** — Vector database for RAG (via `QDRANT_URL`)
- **Google Gemini** — LLM for AI responses (via `GEMINI_API_KEY`)

## API Docs
Once deployed, visit `/docs` for the interactive Swagger UI.

## Environment Variables Required
Set these in the HF Space → Settings → Variables and secrets:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `QDRANT_URL` | Qdrant server URL |
| `GEMINI_API_KEY` | Google Gemini API key |
| `JWT_SECRET` | Secret key for JWT tokens |
