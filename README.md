# Soma & Surya — AI-Powered Vedic Astrology SaaS

<div align="center">
  <p><strong>Ancient Vedic Wisdom + Modern AI + Premium SaaS</strong></p>
  <p>Full-stack, production-ready astrology platform with AI readings, Stripe billing, admin panel, and Docker deployment.</p>

  [![CI](https://github.com/rai8053/Astrology/actions/workflows/ci.yml/badge.svg)](https://github.com/rai8053/Astrology/actions/workflows/ci.yml)
  [![Deploy](https://github.com/rai8053/Astrology/actions/workflows/deploy.yml/badge.svg)](https://github.com/rai8053/Astrology/actions/workflows/deploy.yml)
  [![TypeScript](https://img.shields.io/badge/TS-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
</div>

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript | UI library with strict types |
| | Vite 6 | Lightning-fast dev server & bundler |
| | Tailwind CSS v4 | Utility-first CSS with dark mode |
| | Framer Motion 12 | Production-grade animations |
| | TanStack Query 5 | Server state, caching, background refetch |
| | Zustand 5 | Minimal client state (auth, theme) |
| | React Router 7 | SPA routing with animated transitions |
| | React Hook Form 7 | Performant form validation |
| | Recharts 2 | Data visualization / charts |
| | Lucide React | Premium icon set |
| **Backend** | Node.js 22 + TypeScript | Runtime with full type safety |
| | Express 4 | HTTP framework with middleware chain |
| | Prisma 6 | Type-safe ORM with migrations |
| | PostgreSQL 16 | Primary database |
| | Redis 7 | Caching / session store |
| | Zod 3 | Runtime input validation |
| | JWT + bcrypt | Auth with refresh rotation + theft detection |
| | Stripe SDK | Subscription billing + webhooks |
| | Pino | Structured JSON logging |
| | Helmet + CORS + Rate Limiting | Security hardening |
| **AI** | OpenRouter | OpenAI SDK → openrouter.ai/api/v1 |
| | Fallback chain | deepseek-chat-v3-0324 → qwen3-235b-a22b → claude-sonnet-4 |
| | Retry + timeout | 3 retries per model, 30s timeout, auto fallthrough |
| | No mock/demo mode | Real AI responses always |
| **Infra** | Docker + Compose | 5-container orchestration |
| | Nginx | Reverse proxy + static serving |
| | GitHub Actions | CI/CD (lint → test → build → deploy) |

---

## Quick Start (5 minutes)

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 22 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 10 | Ships with Node |
| PostgreSQL | ≥ 16 | `apt install postgresql` or use Docker |
| Git | latest | [git-scm.com](https://git-scm.com) |

### Setup

```bash
# 1. Clone
git clone https://github.com/rai8053/Astrology.git
cd Astrology

# 2. Install dependencies
npm install
cd backend && npm install && cd ../frontend && npm install && cd ..

# 3. Configure environment
cp backend/.env.example backend/.env
```

Edit `backend/.env` — at minimum set:

```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/soma_surya"
OPENROUTER_API_KEY="sk-or-v1-..."        # Get at https://openrouter.ai
JWT_SECRET="some-random-string-32-chars-min"
JWT_REFRESH_SECRET="another-random-string-32-chars-min"
```

```bash
# 4. Create database & run migrations
cd backend
npx prisma migrate dev --name init
npx prisma db seed

# 5. Start (two terminals)
# Terminal 1 — Backend API
cd backend && npm run dev

# Terminal 2 — Frontend UI
cd frontend && npm run dev
```

Open **http://localhost:5173** and register a new account, or login with `admin@somasurya.com` / `admin123` (admin account, seeded by `prisma db seed`).

---

## Project Structure

```
Astrology/
├── frontend/                          # React SPA (Vite)
│   ├── src/
│   │   ├── app/App.tsx                # Route definitions + auth guards
│   │   ├── features/
│   │   │   ├── landing/               # Marketing pages (Hero, Pricing, FAQ)
│   │   │   ├── auth/                  # Login, Register
│   │   │   ├── dashboard/             # User dashboard layout + home
│   │   │   ├── horoscope/             # Daily horoscope
│   │   │   ├── kundli/               # Birth chart
│   │   │   ├── compatibility/         # Gun Milan
│   │   │   ├── moon/                  # Moon phase tracker
│   │   │   ├── chat/                  # AI astrologer chat
│   │   │   ├── settings/              # Profile settings
│   │   │   └── admin/                 # Admin panel (users, analytics)
│   │   ├── components/                # Shared: Navbar, Footer, PremiumButton, etc.
│   │   │   └── ui/                    # Design primitives: Card, Button, Input
│   │   ├── lib/                       # api.ts (axios), store.ts (zustand), utils.ts
│   │   └── styles/globals.css         # Tailwind theme + design tokens
│   ├── index.html
│   └── vite.config.ts
│
├── backend/                           # Express API
│   ├── prisma/
│   │   ├── schema.prisma              # 10 models (User → AuditLog)
│   │   └── seed.ts                    # Admin + demo user
│   ├── src/
│   │   ├── index.ts                   # Server entry, middleware stack, routes
│   │   ├── lib/
│   │   │   ├── ai.ts                  # OpenRouter service (fallback chain, retry, streaming)
│   │   │   ├── prisma.ts              # Singleton Prisma client
│   │   │   ├── logger.ts              # Pino structured logger
│   │   │   └── errors.ts              # AppError class hierarchy
│   │   ├── middleware/
│   │   │   ├── auth.ts                # JWT verify + role guard
│   │   │   ├── errorHandler.ts        # Global error handler
│   │   │   ├── requestLogger.ts       # Per-request logging
│   │   │   └── validate.ts            # Zod schema validation
│   │   ├── routes/
│   │   │   ├── health.ts              # GET /api/health
│   │   │   ├── auth.ts                # register, login, refresh, logout, me
│   │   │   ├── astrology.ts           # vedic-profile, horoscope, compatibility, moon-phase
│   │   │   ├── chat.ts                # AI chat sessions & messages
│   │   │   ├── payment.ts             # Stripe checkout, portal, webhook
│   │   │   ├── user.ts               # Profile CRUD + analytics
│   │   │   └── admin.ts              # Users list, usage stats
│   │   └── services/astrology/
│   │       ├── constants.ts           # Rashi, Nakshatra, Tithi data
│   │       └── calculator.ts          # Math-based calculation fallback
│   └── Dockerfile                     # Multi-stage build
│
├── shared/types/                      # TypeScript interfaces shared across stack
├── frontend/nginx.conf                # Nginx reverse proxy config
├── docker-compose.yml                 # 5 services: db, redis, backend, frontend
├── scripts/                           # deploy.sh, setup.sh, setup.ps1
├── .github/workflows/                 # CI + Deploy + Security workflows
├── .env.example
└── package.json                       # Workspace orchestrator
```

---

## Architecture

```
                         ┌──────────────────┐
                         │   Browser (SPA)   │
                         │  React + Vite    │
                         │  :5173 (dev)     │
                         │  :80 (prod/Nginx)│
                         └────────┬─────────┘
                                  │  /api/* proxy
                         ┌────────▼─────────┐
                         │    Nginx (prod)   │
                         │  Reverse proxy    │
                         └────────┬─────────┘
                                  │
                         ┌────────▼─────────┐
                         │   Express API     │
                         │   Node 22 + TS   │
                         │   :4000           │
                         └───┬────┬────┬────┘
                             │    │    │
                     ┌────────▼┐ ┌─▼──┐ ┌▼───────────┐
                     │PostgreSQL│ │Redis│ │ AI Layer    │
                     │   16     │ │  7  │ │ OpenRouter  │
                     └──────────┘ └─────┘ │ 3-model fallback│
                                          └─────────────────┘
```

### Key Design Decisions

- **Monorepo** with `shared/types/` — frontend and backend share the same TypeScript interfaces for API contracts
- **OpenRouter AI** (`backend/src/lib/ai.ts`) — single provider via OpenAI SDK, 3-model fallback chain, retry + timeout + streaming
- **Mathematical fallback** — if every AI provider fails, the astrology calculator produces results from raw data
- **Feature-based frontend** — each feature gets its own directory with self-contained components
- **JWT rotation** — refresh tokens rotate on every use; reuse detection invalidates all sessions
- **Server-side secrets** — zero API keys or secrets in the frontend bundle

---

## Configuration Reference

All environment variables go in `backend/.env`:

### Required (no defaults)

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/soma_surya` | PostgreSQL connection |
| `JWT_SECRET` | `openssl rand -base64 64` | Access token signing |
| `JWT_REFRESH_SECRET` | `openssl rand -base64 64` | Refresh token signing |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | Required for AI readings (get at [openrouter.ai](https://openrouter.ai)) |

### Optional

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `4000` | Backend port |
| `NODE_ENV` | `development` | Toggles debug mode, error verbosity |

| `OPENROUTER_MODEL` | `deepseek/deepseek-chat-v3-0324` | Preferred model for AI readings |
| `OPENROUTER_FALLBACK_MODELS` | `qwen/qwen3-235b-a22b,anthropic/claude-sonnet-4` | Comma-separated fallback chain |
| `OPENROUTER_MAX_RETRIES` | `3` | Retry attempts per model before fallthrough |
| `STRIPE_SECRET_KEY` | `""` | Required for payments |
| `STRIPE_WEBHOOK_SECRET` | `""` | Required for payment webhooks |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |
| `APP_URL` | `http://localhost:4000` | Public-facing URL |
| `SENTRY_DSN` | `""` | Error monitoring (SDK not yet wired) |
| `POSTHOG_KEY` | `""` | Analytics (SDK not yet wired) |

---

## API Overview

### Health
```
GET /api/health                         → { status: "ok", database: "healthy", uptime }
```

### Auth
```
POST /api/auth/register                 { name, email, password }
POST /api/auth/login                    { email, password }
POST /api/auth/google                   { credential }      ← Google credential JWT
GET  /api/auth/google/client-id                              ← Public Google Client ID
POST /api/auth/refresh                  ← Cookie: refreshToken
POST /api/auth/logout
GET  /api/auth/me                       ← Bearer token
```

### Astrology
```
GET  /api/astrology/personal-dashboard  ?period=today|tomorrow|week|month  ← Bearer token
POST /api/astrology/vedic-profile       { name, birthDate, birthTime, birthPlace }
POST /api/astrology/daily-horoscope     { rashi }
POST /api/astrology/compatibility       { partnerA, partnerB }
POST /api/astrology/moon-phase          { date }
```

### Chat
```
POST /api/chat                          { message, sessionId? } ← Bearer token
GET  /api/chat/sessions                 ← Bearer token
GET  /api/chat/sessions/:id             ← Bearer token
```

### User
```
GET  /api/user/profile                  ← Bearer token
PUT  /api/user/profile                  { name?, birthDate?, birthTime?, birthPlace? } ← Bearer token
GET  /api/user/reports                  ← Bearer token
```

### Payments
```
POST /api/payments/create-checkout      { plan } ← Bearer token
POST /api/payments/create-portal        ← Bearer token
POST /api/payments/webhook              ← Stripe signature
GET  /api/payments/subscription         ← Bearer token
```

### Admin (requires ADMIN role)
```
GET  /api/admin/users                   ← Bearer token
GET  /api/admin/analytics               ← Bearer token
GET  /api/admin/usage                   ← Bearer token
```

All responses follow `{ success: boolean, data?: T, error?: string, code?: string }`.

---

## Docker Deployment (Production)

```bash
# 1. Clone on server
git clone https://github.com/rai8053/Astrology.git
cd Astrology

# 2. Create production env
cp backend/.env.example backend/.env
# Edit with production values (see Configuration Reference)

# 3. Launch everything
docker compose up -d

# 4. Run database migrations
docker compose exec backend npx prisma migrate deploy

# 5. Seed admin user (first deploy only)
docker compose exec backend npx prisma db seed

# 6. Verify
curl http://localhost/api/health
```

This starts 5 containers:
| Service | Port | Purpose |
|---------|------|---------|
| `frontend` | `80` | Nginx serving the React SPA + proxying `/api` |
| `backend` | `4000` | Express API server |
| `db` | `5432` | PostgreSQL 17 |
| `redis` | `6379` | Redis 7 |

### Required for public deployment

- **SSL certificate** — add to Nginx or use Cloudflare Tunnel (free)
- **OpenRouter API key** — set `OPENROUTER_API_KEY` in `.env` (get one at [openrouter.ai](https://openrouter.ai))
- **Strong JWT secrets** — `openssl rand -base64 64`
- **Change default passwords** — seed creates `admin@somasurya.com / admin123`

### Testing with Cloudflare Tunnel

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Start tunnel (separate terminal)
cloudflared tunnel --url http://localhost:5173

# Add the tunnel URL (e.g., https://abc.trycloudflare.com) to:
# Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs → Authorized JavaScript origins
```

---

## Common Commands

```bash
# Development
npm run dev                  # Start both frontend + backend
cd backend && npm run dev    # Backend only
cd frontend && npm run dev   # Frontend only

# Database
npx prisma migrate dev       # Create + apply migration
npx prisma migrate deploy    # Apply in production
npx prisma db seed           # Seed admin user
npx prisma studio            # Browse data in browser

# Testing
npm test                     # All tests (frontend + backend)
cd backend && npm test       # Backend tests (32 tests)
cd frontend && npm test      # Frontend tests

# Production
npm run build                # Build both
cd backend && npm start      # Start production backend
docker compose up -d         # Full Docker deployment
```

---

## Testing Payments

Use Stripe test mode. Once you set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`:

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0025 0000 3155` | Requires 3D Secure |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Cannot connect to database` | Check `DATABASE_URL` in `backend/.env`. Ensure PostgreSQL is running. |
| `AI provider returned empty response` | Check `OPENROUTER_API_KEY` validity at [openrouter.ai](https://openrouter.ai) |
| `Port already in use` | Backend: change `PORT` in `.env`. Frontend: change in `vite.config.ts`. |
| `CORS error` | Ensure `CORS_ORIGINS` includes your frontend URL (default: `http://localhost:5173`). |
| `Build fails` | Run `npx prisma generate` in `backend/` first. |
| `Blocked request. This host is not allowed` | Cloudflare Tunnel URL is not in Vite's allowed hosts. Ensure `vite.config.ts` has `allowedHosts: true` and restart Vite. |
| `Google Login is temporarily unavailable` | Backend not running, tunnel not forwarding, or `GOOGLE_CLIENT_ID` missing in `backend/.env`. Check browser Network tab for the `/api/auth/google/client-id` request. |
| Theme not switching | Clear `localStorage` theme key and reload. Check `prefers-color-scheme` in dev tools. |

---

## Notes

- **Sentry and PostHog** env vars exist but the SDKs are not yet wired. They're placeholder-ready for when you add monitoring.
- **Redis** is deployed but not yet used for API caching — currently only for dependency health checks.
- **Google OAuth** — fully implemented. Login/Register pages show Google Sign-In button. Backend verifies via google-auth-library. Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `backend/.env` and the site's URL added to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) authorized JavaScript origins.
- **GitHub OAuth** — schema placeholders exist but not implemented.
- The frontend build uses manual chunking (`vendor`, `ui`) for optimal caching.

---

<div align="center">
  <p><a href="https://github.com/rai8053/Astrology">GitHub</a> &middot; Built with TypeScript from frontend to database</p>
</div>
