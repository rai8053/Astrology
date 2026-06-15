# Soma & Surya — AI-Powered Vedic Astrology Platform

<div align="center">

[![CI](https://github.com/rai8053/Astrology/actions/workflows/ci.yml/badge.svg)](https://github.com/rai8053/Astrology/actions/workflows/ci.yml)
[![Deploy](https://github.com/rai8053/Astrology/actions/workflows/deploy.yml/badge.svg)](https://github.com/rai8053/Astrology/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![LangChain](https://img.shields.io/badge/LangChain-Ready-1C3C3C?logo=langchain&logoColor=white)](https://www.langchain.com/)
[![Redis](https://img.shields.io/badge/Redis-7-FF4438?logo=redis&logoColor=white)](https://redis.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Billing-008CDD?logo=stripe&logoColor=white)](https://stripe.com/)
[![Tests](https://img.shields.io/badge/Tests-63_passing-22c55e)](https://github.com/rai8053/Astrology/actions)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Ancient Vedic Wisdom · Modern AI · Production SaaS**

</div>

---

## Overview

Soma & Surya combines **Retrieval-Augmented Generation (RAG)** with a **production-grade SaaS backend** to deliver personalized Vedic astrology readings. The system ingests 48+ authoritative astrology knowledge articles, semantically retrieves the most relevant context for each user query, and feeds it to a large language model via OpenRouter — resulting in responses that are grounded, accurate, and personalized to the user's birth chart.

The platform features **streaming AI chat**, **conversation memory**, **birth chart calculation**, **Kundli (D1/D9) visualization**, **Stripe subscription billing**, **admin analytics**, and **full audit logging**.

| Metric | Value |
|--------|-------|
| Backend Tests | 63 passing |
| AI Models | 3-model fallback chain |
| Knowledge Articles | 48 Vedic astrology documents |
| Database Tables | 14 |
| Docker Services | 5 |
| Migration History | 6 applied migrations |

---

## AI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User / Client (React)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express API Layer                          │
│  auth · validate · rate-limit · request-logging              │
└────────────────────────┬────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
┌─────────────────────────┐  ┌─────────────────────────────┐
│    Memory Service        │  │    Retrieval Service         │
│  · Conversation history   │  │  · Generate query embedding  │
│  · Token-aware windowing  │  │  · Cosine similarity search  │
│  · Working memory extract │  │  · Category/tag filtering   │
│  · Context compression    │  │  · Score threshold filtering│
└──────────┬──────────────┘  └──────────────┬──────────────┘
           │                                │
           └──────────┬────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Context Builder                           │
│  history + working memory + retrieved documents → prompt     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   OpenRouter / LLM                           │
│  deepseek-chat → qwen3-235b → claude-sonnet (fallback chain)│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Response                                  │
│  streamed · markdown-formatted · source-attributed          │
└─────────────────────────────────────────────────────────────┘
```

### RAG Pipeline

The system follows a 5-stage pipeline for every AI request:

| Stage | Service | What Happens |
|-------|---------|--------------|
| **1. Memory Retrieval** | `MemoryService` | Fetches conversation history with token-aware windowing (max 3000 tokens). Extracts working memory (birth info, zodiac signs, planet mentions). |
| **2. Knowledge Retrieval** | `RetrievalService` | Generates a 1536-dimensional embedding of the user's query via OpenRouter. Computes cosine similarity against 48+ knowledge articles. Returns top-5 results above 0.3 similarity threshold. |
| **3. Context Assembly** | `Context Builder` | Combines conversation history + working memory + retrieved documents into a structured prompt. |
| **4. LLM Inference** | `OpenRouter` | Sends prompt through a fallback chain (preferred → fallback → free models) with retry logic and timeout. |
| **5. Attribution** | `Chat Route` | Stores retrieval source IDs in message metadata for auditability. Logs retrieval latency, result count, and token usage. |

### Conversation Memory

The `MemoryService` manages a sliding window of the last 20 messages, capped at 3000 tokens. It scans conversation history for key astrological signals:

- **Birth information** (dates, times, places, ascendant, nakshatra)
- **Zodiac mentions** (any of 24 Vedic/Western sign names)
- **Planet references** (all 9 Vedic grahas)

These are extracted as working memory and injected into every subsequent prompt, enabling the AI to maintain context across a multi-turn conversation without exceeding token limits.

### Knowledge Retrieval

The `KnowledgeArticle` table stores 48 Vedic astrology articles across 9 categories:

| Category | Articles | Coverage |
|----------|----------|----------|
| `ZODIAC` | 12 | All 12 Rashis with Sanskrit names, elements, lords, strengths/weaknesses |
| `PLANET` | 9 | All 9 Grahas with exaltation, debilitation, gemstones, significations |
| `HOUSE` | 15 | 12 Bhavas + Kendra/Trikona/Dusthana deep-dives |
| `NAKSHATRA` | 8 | Key lunar mansions (Ashwini, Rohini, Magha, Mula, etc.) |
| `YOGA` | 5 | Raja, Dhana, Gaja Kesari, Viparita, Kemadruma |
| `COMPATIBILITY` | 1 | Ashta Kuta matching system |
| `DOSHA` | 2 | Manglik Dosha analysis, Pitta Dosha |
| `GEMSTONE` | 1 | 9 planetary gemstones with wearing guidelines |
| `GENERAL` | 5 | Vedic intro, sidereal vs tropical, dasha, transits, karakas |

Each article is embedded as a 1536-dimensional vector using `openai/text-embedding-3-small` via OpenRouter. Retrieval is performed client-side with JS cosine similarity (designed for easy migration to pgvector).

### Source Attribution

Every user message stored in the `ChatMessage` table includes:
- `embeddingId` — the ID of the highest-scoring knowledge article used
- `metadata.retrievalSources` — array of all article IDs retrieved
- `metadata.retrievalCount` — number of documents used

The `RetrievalMetric` table logs each retrieval event with:
- Query text, k value, result count
- Latency in milliseconds
- Token consumption

---

## System Design

### Database Schema (14 models)

```
User (1) ──→ Subscription (1)
  │
  ├──→ ChatSession (N) ──→ ChatMessage (N)
  │
  ├──→ AstrologyReport (N)
  ├──→ UsageRecord (N)
  ├──→ PaymentMethod (N)
  ├──→ Invoice (N)
  ├──→ AstrologyProfile (1)
  └──→ AnalyticsEvent (N)

KnowledgeArticle (1)      ─ standalone, embedding via double precision[]
RetrievalMetric (N)       ─ per-query latency & result logging
ContactMessage (N)        ─ standalone
Coupon (N)                ─ standalone
AuditLog (N)              ─ standalone
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **RAG over fine-tuning** | Knowledge base can be updated without retraining. Each response cites authoritative sources. |
| **double precision[] over pgvector** | JS cosine similarity works without PostgreSQL extensions. pgvector migration requires one SQL change. |
| **Token-aware memory windowing** | Prevents context overflow while preserving conversation continuity. Working memory extracts key facts across the full session. |
| **Cascading soft-delete** | Chat session deletion cascades to all messages, preserving data integrity while enabling recovery. |
| **3-model OpenRouter fallback** | Preferred model (deepseek-chat) → fallback (qwen, claude) → 14 free models. No single point of failure. |
| **Zod + TypeScript throughout** | Runtime validation (Zod) + compile-time checking (TS) from HTTP boundary to database query. |
| **JWT refresh rotation** | Refresh tokens rotate on every use. Theft detection invalidates all sessions. |

---

## Screenshots

> Screenshots are stored in `docs/screenshots/` for documentation and portfolio use.

```
docs/screenshots/
├── home.png              # Landing page with ZodiacWheel
├── chat.png              # AI astrology chat with streaming
├── transit-calendar.png  # Planetary transit calendar
└── admin-dashboard.png   # Admin usage analytics
```

---

## Project Structure

```
Astrology/
│
├── frontend/                              # React 19 SPA (Vite 6)
│   ├── src/
│   │   ├── app/App.tsx                    # Route definitions + auth guards
│   │   ├── features/
│   │   │   ├── landing/                   # Hero, pricing, FAQ
│   │   │   ├── auth/                      # Login, register, OAuth
│   │   │   ├── dashboard/                 # User dashboard + cosmic snapshot
│   │   │   ├── horoscope/                 # Daily/weekly horoscope with ZodiacGrid
│   │   │   ├── kundli/                    # D1 + D9 chart with Navamsa
│   │   │   ├── chat/                      # AI chat with streaming + RAG
│   │   │   ├── compatibility/             # Guna Milan scoring
│   │   │   ├── moon/                      # Moon phase tracker
│   │   │   ├── settings/                  # Profile + subscription
│   │   │   └── admin/                     # Users, analytics, usage
│   │   ├── components/ui/                 # Design primitives
│   │   ├── lib/                           # API client, zustand store, utils
│   │   └── styles/globals.css             # Tailwind v4 theme
│   └── nginx.conf                         # Production nginx config
│
├── backend/                               # Express API (Node 22 + TS)
│   ├── prisma/
│   │   ├── schema.prisma                  # 14 models
│   │   └── migrations/                    # 6 applied migrations
│   ├── src/
│   │   ├── index.ts                       # Server entry, middleware stack
│   │   ├── lib/
│   │   │   ├── ai.ts                      # OpenRouter service (3-model fallback)
│   │   │   ├── prisma.ts                  # Singleton client
│   │   │   ├── logger.ts                  # Pino structured logger
│   │   │   └── errors.ts                  # AppError hierarchy
│   │   ├── middleware/
│   │   │   ├── auth.ts                    # JWT verify + role guard
│   │   │   ├── errorHandler.ts            # Global handler
│   │   │   ├── requestLogger.ts           # Per-request logging
│   │   │   └── validate.ts                # Zod schema validation
│   │   ├── routes/
│   │   │   ├── health.ts                  # GET /api/health
│   │   │   ├── auth.ts                    # Register, login, refresh, OAuth
│   │   │   ├── astrology.ts               # Birth chart, horoscope, moon phase
│   │   │   ├── chat.ts                    # AI chat with RAG integration
│   │   │   ├── payment.ts                 # Stripe checkout, portal, webhook
│   │   │   ├── user.ts                    # Profile CRUD
│   │   │   └── admin.ts                   # Users, analytics, usage stats
│   │   └── services/
│   │       ├── chat.ts                    # Session & message management
│   │       ├── astrology/
│   │       │   ├── constants.ts           # Rashi, Nakshatra, Tithi data
│   │       │   └── calculator.ts          # Sidereal calculation engine
│   │       └── rag/
│   │           ├── index.ts               # Re-exports
│   │           ├── embedding.ts           # EmbeddingService (OpenRouter)
│   │           ├── retrieval.ts           # RetrievalService (cosine similarity)
│   │           ├── memory.ts              # MemoryService (windowing + extraction)
│   │           └── seed.ts                # 48 knowledge articles
│   └── Dockerfile
│
├── shared/types/                          # TypeScript interfaces (stack-wide)
│   ├── api.ts                             # ApiResponse<T> envelope
│   ├── chat.ts                            # ChatMessageDTO, PaginatedMessages
│   ├── rag.ts                             # KnowledgeArticleDTO, RetrievalResult
│   ├── user.ts                            # UserDTO
│   ├── auth.ts                            # AuthRequest, LoginResponse
│   └── payment.ts                         # SubscriptionDTO, InvoiceDTO
│
├── docker-compose.yml                     # 5 services (db, redis, backend, frontend)
├── scripts/                               # deploy.sh, setup.ps1
├── .github/workflows/                     # CI + Deploy + Security
├── .env.example
└── package.json                           # npm workspaces orchestrator
```

---

## API Examples

### Health Check
```bash
curl http://localhost:4000/api/health
# → { "success": true, "data": { "status": "ok", "database": "healthy", "uptime": 3600 } }
```

### AI Chat with RAG (Non-Streaming)
```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the effects of Saturn in the 7th house for a Leo ascendant?",
    "sessionId": null
  }'

# → {
#   "success": true,
#   "data": {
#     "reply": "### Direct Answer\n...",
#     "sessionId": "cm8abc123...",
#     "retrievalCount": 3,
#     "dailyUsed": 2,
#     "dailyLimit": 10
#   }
# }
```

### AI Chat (Streaming)
```bash
curl -X POST http://localhost:4000/api/chat/stream \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{ "message": "Tell me about my Jupiter placement", "sessionId": "cm8abc..." }'

# → data: { "text": "### Direct Answer\nYour Jupiter..." }
# → data: { "text": "### Direct Answer\nYour Jupiter is in..." }
# → data: { "done": true, "sessionId": "cm8...", "dailyUsed": 3 }
```

### List Sessions (Paginated)
```bash
curl http://localhost:4000/api/chat/sessions?page=1&limit=10 \
  -H "Authorization: Bearer <jwt>"

# → {
#   "success": true,
#   "data": { "sessions": [...] },
#   "meta": { "page": 1, "limit": 10, "total": 27, "totalPages": 3, "hasMore": true }
# }
```

### Get Messages with Pagination
```bash
curl "http://localhost:4000/api/chat/sessions/cm8abc.../messages?page=1&limit=50&order=oldest" \
  -H "Authorization: Bearer <jwt>"
```

### Auth
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "name": "User", "email": "user@example.com", "password": "...", "timezone": "Asia/Kolkata" }'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com", "password": "..." }'
# → { "success": true, "data": { "accessToken": "eyJ...", "user": {...} } }
```

### All responses follow: `{ success: boolean, data?: T, error?: string }`

---

## Testing

### Test Suite

| Suite | Count | Scope |
|-------|-------|-------|
| Calculator | 26 | Birth chart, nakshatra, dasha, moon phase, navamsa (D9) |
| Constants | 6 | RASHI_DATA (12 entries), NAKSHATRAS (27), grid validity |
| EmbeddingService | 7 | Cosine similarity, batch scoring, cache tracking |
| RetrievalService | 5 | Method existence, cosine similarity validation |
| MemoryService | 5 | Birth/zodiac/planet detection, prompt formatting |
| AI Service | 2 | Live OpenRouter calls (generate + structured JSON) |
| Auth / Errors | 12 | AppError hierarchy, asyncHandler, validation |
| **Total** | **63** | **All passing, 0 skipped** |

```bash
# Run all tests
cd backend && npm test

# Watch mode
cd backend && npm run test:watch

# Single file
cd backend && npx vitest run src/__tests__/rag/embedding.test.ts
```

### CI Pipeline

```
GitHub Actions:
  Lint  →  TypeScript --noEmit (frontend + backend)
  Test  →  vitest run (63 tests)
  Build →  esbuild backend + vite build frontend
  Deploy→  docker compose up -d
```

---

## Deployment

### Docker Compose (Production)

```bash
# 1. Clone & configure
git clone https://github.com/rai8053/Astrology.git
cd Astrology
cp backend/.env.example backend/.env

# 2. Launch stack (5 containers)
docker compose up -d

# 3. Run migrations
docker compose exec backend npx prisma migrate deploy

# 4. Seed knowledge base
docker compose exec backend npm run seed:rag
```

| Service | Port | Notes |
|---------|------|-------|
| `frontend` (Nginx) | 80 | Serves SPA, proxies /api to backend |
| `backend` (Express) | 4000 | API server |
| `db` (PostgreSQL 16) | 5432 | Persistent volume |
| `redis` (Redis 7) | 6379 | Cache / session store |

### Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | Access token signing (≥32 chars) |
| `JWT_REFRESH_SECRET` | Yes | — | Refresh token signing (≥32 chars) |
| `OPENROUTER_API_KEY` | Yes | — | AI provider key (openrouter.ai) |
| `EMBEDDING_MODEL` | No | `openai/text-embedding-3-small` | Embedding model |
| `EMBEDDING_DIMENSIONS` | No | `1536` | Vector dimensions |
| `OPENROUTER_MODEL` | No | `deepseek/deepseek-chat-v3-0324` | Preferred LLM |
| `OPENROUTER_FALLBACK_MODELS` | No | `qwen/qwen3-235b-a22b,claude-sonnet-4` | Fallback chain |
| `OPENROUTER_MAX_RETRIES` | No | `3` | Retries per model |
| `STRIPE_SECRET_KEY` | For payments | — | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | For payments | — | Stripe webhook secret |
| `STRIPE_PRO_PRICE_ID` | For payments | — | Pro plan price ID |
| `STRIPE_PREMIUM_PRICE_ID` | For payments | — | Premium plan price ID |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Allowed origins |
| `APP_URL` | No | `http://localhost:4000` | Public-facing URL |
| `SENTRY_DSN` | No | `""` | Error tracking |
| `PORT` | No | `4000` | Backend port |
| `NODE_ENV` | No | `development` | Environment mode |

---

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| RAG retrieval latency (p50) | <200ms | ~50ms (no API call if cached) |
| RAG retrieval latency (p95) | <500ms | ~400ms (first call, embedding generation) |
| AI response time (preferred model) | <5s | ~2-3s (deepseek-chat-v3-0324) |
| AI response time (with fallback) | <15s | ~6s (through fallback chain) |
| Embedding cache hit rate | >60% | ~40% (grows with usage) |
| Chat endpoint (p50) | <200ms | ~150ms (excluding AI) |
| Database query time (p50) | <50ms | ~5ms (indexed queries) |
| Bundled frontend size | <3MB | ~2.56MB (31 chunks) |

---

## Why This Project Is Different

Most astrology apps fall into one of two categories: a generic API wrapper around an AI model, or a static content site with no personalization. This project is neither.

**AI + Vedic Astrology** — The system isn't just an LLM prompt. It has a curated knowledge base of 48 Vedic astrology articles that ground every response. The AI context includes the user's actual sidereal birth chart — planetary positions, houses, nakshatras, dashas. Responses reference specific houses, planets, and yogas from the user's chart.

**Production RAG** — Not a proof-of-concept with three hardcoded documents. A proper 3-service RAG architecture with embedding generation, cosine similarity retrieval, category/tag filtering, token-aware memory windowing, and source attribution logged to the database.

**Conversation Memory** — The memory service doesn't just replay the last N messages. It scans history for birth information, zodiac mentions, and planet references, extracting a working memory that persists across the entire session regardless of token limits.

**SaaS Architecture** — Rate limiting per tier (10 free queries/day, unlimited for premium), Stripe subscription billing with webhooks, JWT refresh rotation with theft detection, soft-delete for data recovery, structured logging with Pino, admin analytics dashboard, audit logs, and a 3-model AI fallback chain with retry and timeout.

**Production-Grade Backend** — TypeScript end-to-end, Zod runtime validation on every input, Prisma with 6 managed migrations, Helmet + CORS + rate limiting security, 63 automated tests in CI, Docker Compose deployment, and shared TypeScript types between frontend and backend.

---

## Roadmap

- [x] RAG pipeline with EmbeddingService, RetrievalService, MemoryService
- [x] 48-article Vedic astrology knowledge base
- [x] Streaming AI responses with fallback chain
- [x] SaaS billing (Stripe, 3 subscription tiers)
- [x] Admin dashboard with usage analytics
- [x] Birth chart calculation engine (sidereal)
- [x] D1 (Rasi) and D9 (Navamsa) chart visualization
- [x] Token tracking per request
- [x] 6 database migrations
- [ ] pgvector migration for GPU-accelerated similarity search
- [ ] LangChain integration for structured tool-calling
- [ ] Embedding cache persistence (Redis)
- [ ] Vector index on ChatMessage for cross-session RAG
- [ ] WebSocket streaming (replace SSE)
- [ ] CI/CD with staging / canary deploys
- [ ] OpenTelemetry tracing
- [ ] A/B testing framework for system prompts
- [ ] Multi-language RAG (Sanskrit / Hindi article embeddings)

---

<div align="center">
  <p>
    Built with TypeScript from the database to the browser.
  </p>
  <p>
    <a href="https://github.com/rai8053/Astrology">GitHub</a> ·
    <a href="https://openrouter.ai">OpenRouter</a> ·
    <a href="https://www.prisma.io">Prisma</a>
  </p>
</div>
