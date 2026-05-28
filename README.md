# Soma & Surya — AI-Powered Vedic Astrology SaaS

<div align="center">
  <h3>✨ Ancient Vedic Wisdom Meets Modern AI ✨</h3>
  <p>A full-stack production-grade astrology SaaS platform with AI-powered readings, authentication, subscriptions, and dashboards.</p>
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [AI Providers](#ai-providers)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Payment System](#payment-system)
- [Deployment](#deployment)
- [Security](#security)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Soma & Surya** transforms traditional Vedic astrology into a modern SaaS experience. Users can:

- Generate detailed **birth charts (Kundli)** with planetary positions and Nakshatra analysis
- Read **daily horoscopes** for all 12 Moon signs (Rashis)
- Perform **relationship compatibility** analysis (Ashta Koota Gun Milan)
- Track **Moon phases and Tithis** with spiritual significance
- Chat with an **AI astrologer** for personalized guidance
- Manage subscriptions and access premium features

---

## Features

### 🔐 Security & Auth
- JWT authentication with refresh token rotation
- HTTP-only cookies for secure token storage
- Role-based access control (User, Premium, Admin, Super Admin)
- Rate limiting, Helmet security headers, CORS protection
- Input validation via Zod schemas
- All API keys server-side only — NEVER exposed to frontend

### 🤖 AI Engine
- Multi-provider AI abstraction layer (Gemini, OpenAI, Claude, DeepSeek, Groq, OpenRouter)
- Structured JSON outputs for astrology data
- Fallback to mathematically calculated readings when AI is unavailable
- Retry logic and error handling
- Cost and token usage tracking

### 🔮 Astrology Services
- **Vedic Profile**: Moon sign (Rashi), Nakshatra, Lagna, Dosha, planetary placements
- **Daily Horoscope**: Career, finance, love, health predictions with energy levels
- **Compatibility**: 36-point Ashta Koota Gun Milan analysis
- **Moon Phase**: Live Tithi tracking, illumination, spiritual significance

### 💳 Payments
- Stripe subscription integration
- Multiple plans: Free, Pro ($9.99), Premium ($19.99), Enterprise ($49.99)
- 14-day free trial on signup
- Webhook handling for subscription lifecycle
- Customer portal for managing payments

### 🎨 Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS v4 with dark/light/system theme
- Framer Motion animations
- Responsive mobile-first design
- React Query for server state management
- Zustand for client state
- React Router v7 for routing
- Recharts for data visualization

### 📊 Dashboards
- **User Dashboard**: Overview, horoscope, birth chart, compatibility, moon phase, AI chat, settings
- **Admin Dashboard**: User management, platform analytics, AI usage monitoring, revenue tracking

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Frontend   │────▶│   Backend    │────▶│ PostgreSQL │
│  React + Vite│     │ Express + TS │     │  + Prisma  │
│  :5173      │     │  :4000       │     │            │
└─────────────┘     └──────┬───────┘     └────────────┘
                           │
                    ┌──────▼───────┐     ┌────────────┐
                    │  AI Provider │────▶│   Gemini   │
                    │  Abstraction │     │   OpenAI   │
                    │    Layer     │     │   Claude   │
                    └──────────────┘     │    etc.    │
                                         └────────────┘
```

**Key Architectural Decisions:**

- **Monorepo** with `frontend/`, `backend/`, and `shared/` packages
- **API proxy** in Vite dev server forwards `/api/*` to backend
- **Prisma ORM** for type-safe database access with migrations
- **Provider pattern** for AI services — swap providers via env variable
- **Fallback system** — mathematically calculated astrology data when AI is unavailable
- **Feature-based** frontend organization for scalability

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 | UI library |
| | TypeScript | Type safety |
| | Vite 6 | Build tool & dev server |
| | Tailwind CSS v4 | Utility-first styling |
| | Framer Motion | Animations |
| | React Query (TanStack) | Server state & caching |
| | Zustand | Client state management |
| | React Router v7 | Routing |
| | React Hook Form | Form management |
| | Recharts | Charts & visualization |
| | Lucide React | Icons |
| | React Hot Toast | Notifications |
| **Backend** | Node.js 20 | Runtime |
| | Express 4 | HTTP framework |
| | TypeScript | Type safety |
| | Prisma 6 | ORM & migrations |
| | PostgreSQL 16 | Database |
| | Redis 7 (optional) | Caching |
| | Zod | Input validation |
| | JWT (jsonwebtoken) | Authentication |
| | bcryptjs | Password hashing |
| | Stripe | Payment processing |
| | Pino | Logging |
| | Helmet | Security headers |
| | express-rate-limit | Rate limiting |
| **AI** | Google GenAI SDK | Gemini provider |
| | OpenAI SDK | OpenAI provider |
| | Custom adapters | Claude, DeepSeek, Groq, OpenRouter |
| **DevOps** | Docker | Containerization |
| | Docker Compose | Multi-container orchestration |
| | Nginx | Reverse proxy |
| | GitHub Actions | CI/CD |

---

## Project Structure

```
soma-surya/
├── frontend/                          # React SPA
│   ├── public/                        # Static assets
│   ├── src/
│   │   ├── app/                       # App root, routes
│   │   │   └── App.tsx                # Route definitions
│   │   ├── components/                # Shared components
│   │   │   ├── ui/                    # Design system primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── Input.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── features/                  # Feature modules
│   │   │   ├── auth/                  # Login, Register
│   │   │   ├── dashboard/             # Dashboard layout & home
│   │   │   ├── horoscope/             # Daily horoscope
│   │   │   ├── kundli/               # Birth chart
│   │   │   ├── compatibility/         # Gun Milan
│   │   │   ├── moon/                  # Moon phase tracker
│   │   │   ├── chat/                  # AI astrologer chat
│   │   │   ├── settings/              # User settings
│   │   │   ├── admin/                 # Admin panel
│   │   │   └── landing/               # Marketing pages
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── lib/                       # Utilities
│   │   │   ├── api.ts                 # HTTP client
│   │   │   ├── store.ts               # Zustand stores
│   │   │   └── utils.ts               # Helpers
│   │   └── styles/
│   │       └── globals.css            # Global styles + Tailwind
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                           # Express API server
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema
│   │   └── seed.ts                    # Admin seed
│   ├── src/
│   │   ├── index.ts                   # Server entry
│   │   ├── lib/
│   │   │   ├── prisma.ts              # Prisma client
│   │   │   ├── ai.ts                  # AI provider abstraction
│   │   │   ├── logger.ts              # Pino logging
│   │   │   └── errors.ts              # Error classes
│   │   ├── middleware/
│   │   │   ├── auth.ts                # JWT authentication
│   │   │   ├── errorHandler.ts        # Global error handler
│   │   │   ├── requestLogger.ts       # HTTP request logging
│   │   │   └── validate.ts            # Zod validation
│   │   ├── routes/
│   │   │   ├── health.ts              # Health check
│   │   │   ├── auth.ts                # Auth endpoints
│   │   │   ├── astrology.ts           # Astrology API
│   │   │   ├── chat.ts                # AI chat
│   │   │   ├── payment.ts             # Stripe payments
│   │   │   ├── user.ts               # User profile & data
│   │   │   └── admin.ts              # Admin operations
│   │   └── services/
│   │       └── astrology/
│   │           ├── constants.ts       # Rashi, Nakshatra data
│   │           └── calculator.ts      # Math-based astrology
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                            # Shared code
│   └── types/
│       ├── api.ts                     # API response types
│       ├── auth.ts                    # Auth types
│       ├── user.ts                    # User types
│       └── payment.ts                 # Payment types
│
├── docker/
│   └── nginx.conf                     # Nginx reverse proxy config
├── scripts/
│   └── setup.ps1                      # Windows setup script
├── docs/
│   └── deployment.md                  # Deployment guide
├── .github/
│   └── workflows/
│       └── ci.yml                     # CI/CD pipeline
├── docker-compose.yml                 # Full stack orchestration
├── .env.example                       # Environment template
├── .gitignore
├── README.md                          # This file
└── package.json                       # Workspace root
```

---

## Getting Started

### Prerequisites

| Tool | Version | Installation |
|------|---------|-------------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| npm | 10+ | Ships with Node.js |
| PostgreSQL | 16+ | [postgresql.org](https://postgresql.org) — or use Docker |
| Git | Latest | [git-scm.com](https://git-scm.com) |

### Quick Start (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/rai8053/Astrology.git
cd Astrology

# 2. Install all dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Configure environment variables
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your API keys:

```env
# Required: At least one AI provider key
GEMINI_API_KEY="your-gemini-api-key-here"

# Required: Database connection
DATABASE_URL="postgresql://user:password@localhost:5432/soma_surya"

# Required: JWT secrets (change these in production)
JWT_SECRET="your-random-secret-at-least-32-chars"
JWT_REFRESH_SECRET="another-random-secret-at-least-32-chars"
```

```bash
# 4. Set up the database
cd backend
npx prisma migrate dev --name init

# 5. Seed admin user
npx prisma db seed

# 6. Start development servers
# Terminal 1 — Backend API
cd backend && npm run dev
# Terminal 2 — Frontend UI
cd frontend && npm run dev
```

Open **http://localhost:5173** in your browser.

**Admin login:** `admin@somasurya.com` / `admin123`

---

## Configuration

### Environment Variables

All configuration is in `backend/.env`. See `.env.example` for a complete template.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `4000` | Backend server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `GEMINI_API_KEY` | Yes* | — | Google Gemini API key |
| `OPENAI_API_KEY` | No | — | OpenAI API key |
| `CLAUDE_API_KEY` | No | — | Anthropic Claude API key |
| `DEEPSEEK_API_KEY` | No | — | DeepSeek API key |
| `GROQ_API_KEY` | No | — | Groq API key |
| `OPENROUTER_API_KEY` | No | — | OpenRouter API key |
| `AI_PROVIDER` | No | `gemini` | Default AI provider |
| `JWT_SECRET` | **Yes** | — | JWT signing secret |
| `JWT_REFRESH_SECRET` | **Yes** | — | Refresh token secret |
| `JWT_EXPIRES_IN` | No | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token TTL |
| `STRIPE_SECRET_KEY` | No | — | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | — | Stripe webhook secret |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Allowed CORS origins |
| `APP_URL` | No | `http://localhost:4000` | Public app URL |

*\*At least one AI provider key is required.*

---

## API Reference

### Authentication

All auth endpoints return `{ success: true, data: { ... } }` on success.

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "USER" },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Cookie: refreshToken=eyJhbGci...
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <accessToken>
```

### Astrology

#### Birth Chart (Vedic Profile)
```bash
POST /api/astrology/vedic-profile
Content-Type: application/json

{
  "name": "John Doe",
  "birthDate": "1990-06-15",
  "birthTime": "14:30",
  "birthPlace": "Mumbai, India"
}
```

#### Daily Horoscope
```bash
POST /api/astrology/daily-horoscope
Content-Type: application/json

{
  "rashi": "Mesh"
}
```

#### Compatibility (Gun Milan)
```bash
POST /api/astrology/compatibility
Content-Type: application/json

{
  "partnerA": { "name": "Alice", "birthDate": "1995-03-20", "birthTime": "08:00", "birthPlace": "Delhi" },
  "partnerB": { "name": "Bob", "birthDate": "1993-11-12", "birthTime": "16:30", "birthPlace": "Mumbai" }
}
```

#### Moon Phase
```bash
POST /api/astrology/moon-phase
Content-Type: application/json

{
  "date": "2026-05-28"
}
```

### AI Chat

```bash
POST /api/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What is my ruling planet?",
  "sessionId": "optional-existing-session-id"
}
```

### Payments

```bash
# Get subscription plans
GET /api/payments/plans

# Get user's subscription
GET /api/payments/subscription
Authorization: Bearer <token>

# Create Stripe checkout session
POST /api/payments/create-checkout
Authorization: Bearer <token>
Content-Type: application/json
{ "plan": "PRO" }
```

### Admin

```bash
# List users (requires ADMIN role)
GET /api/admin/users
Authorization: Bearer <admin-token>

# Platform analytics
GET /api/admin/analytics
Authorization: Bearer <admin-token>

# AI usage stats
GET /api/admin/usage
Authorization: Bearer <admin-token>
```

---

## AI Providers

The platform supports multiple AI providers through a clean abstraction layer. Configure via environment variables.

### Supported Providers

| Provider | Env Key | Default Model | Status |
|----------|---------|---------------|--------|
| **Gemini** | `GEMINI_API_KEY` | `gemini-2.0-flash` | ✅ Default |
| **OpenAI** | `OPENAI_API_KEY` | `gpt-4o-mini` | ✅ |
| **Claude** | `CLAUDE_API_KEY` | `claude-3-haiku-20240307` | ✅ |
| **DeepSeek** | `DEEPSEEK_API_KEY` | `deepseek-chat` | ✅ |
| **Groq** | `GROQ_API_KEY` | `mixtral-8x7b-32768` | ✅ |
| **OpenRouter** | `OPENROUTER_API_KEY` | `google/gemini-2.0-flash-lite` | ✅ |

### How It Works

```env
# In backend/.env — choose your default provider
AI_PROVIDER=gemini

# Always set your primary key
GEMINI_API_KEY="your-key"

# Optionally set others for fallback
OPENAI_API_KEY="your-key"
```

The system automatically:
1. Uses the configured `AI_PROVIDER`
2. Falls back to Gemini if the primary provider's key is missing
3. Falls back to mathematically calculated data if no AI provider works

### Provider Architecture

```
backend/src/lib/ai.ts
├── GeminiProvider       (Google GenAI SDK)
├── OpenAIProvider       (OpenAI SDK)
├── ClaudeAdapter       (OpenAI-compatible SDK)
├── DeepSeekAdapter     (OpenAI-compatible SDK)
├── GroqAdapter         (OpenAI-compatible SDK)
└── OpenRouterAdapter   (OpenAI-compatible SDK)
```

All providers implement the same `AIProviderClient` interface, making them interchangeable.

---

## Database Schema

### Entity Relationship

```
User (1)───(1) Subscription
  │
  ├──(many) AstrologyReport
  ├──(many) ChatSession
  ├──(many) UsageRecord
  ├──(many) PaymentMethod
  └──(many) Invoice
```

### Models

**User** — Core user account with role-based access control
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| email | String | Unique, used for login |
| name | String | Display name |
| passwordHash | String | bcrypt hashed |
| role | Enum | USER / PREMIUM / ADMIN / SUPER_ADMIN |
| timezone | String | Default: UTC |
| language | String | Default: en |
| emailVerified | Boolean | Default: false |
| birthDate, birthTime, birthPlace | String? | Astrology details |

**Subscription** — User subscription with Stripe integration
| Field | Type | Notes |
|-------|------|-------|
| plan | Enum | FREE / PRO / PREMIUM / ENTERPRISE |
| status | Enum | ACTIVE / CANCELED / PAST_DUE / TRIALING / EXPIRED |
| stripeSubscriptionId | String? | Stripe reference |
| currentPeriodStart/End | DateTime | Billing period |
| trialEnd | DateTime? | Trial expiration |

**AstrologyReport** — Generated astrology reports
| Field | Type | Notes |
|-------|------|-------|
| type | String | vedic_profile / daily_horoscope / compatibility / moon_phase |
| input | JSON | Request payload |
| result | JSON | Generated report |
| aiProvider | String? | Which AI generated it |
| tokensUsed | Int? | AI token count |
| costInCents | Float? | AI cost tracking |

**ChatSession** — AI chat conversations
| Field | Type | Notes |
|-------|------|-------|
| messages | JSON | Array of {role, content} |
| context | JSON? | Session context for AI |

**UsageRecord** — AI usage tracking for billing
| Field | Type | Notes |
|-------|------|-------|
| feature | String | chat / vedic_profile / horoscope / etc. |
| tokensIn/Out | Int | Token counts |
| cost | Float | Cost in dollars |

### Migrations

```bash
# Create a migration
cd backend
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy

# View database in browser
npx prisma studio
```

---

## Authentication

### Flow

```
1. User registers or logs in
2. Server validates credentials
3. Server generates:
   - accessToken (15 min, short-lived)
   - refreshToken (7 days, long-lived)
4. accessToken sent in response body
5. refreshToken set as HTTP-only cookie
6. Client stores accessToken in localStorage
7. Client sends accessToken with every request via Authorization header
8. When accessToken expires, client calls /api/auth/refresh
9. Server verifies refreshToken cookie, issues new token pair
```

### Token Rotation

- Each refresh creates a new refresh token
- Old refresh tokens are invalidated
- If a refresh token is reused after rotation, all sessions are invalidated (theft detection)

### Security

- Passwords hashed with bcrypt (12 rounds)
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- HTTP-only cookies prevent XSS token theft
- Role-based middleware guards admin routes

---

## Payment System

### Plans

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | Daily horoscope, basic birth chart, moon phase tracker |
| **Pro** | $9.99/mo | Everything in Free + AI chat, compatibility, detailed chart, predictions |
| **Premium** | $19.99/mo | Everything in Pro + unlimited chat, numerology, tarot, priority support |
| **Enterprise** | $49.99/mo | Everything in Premium + API access, white-label, dedicated astrologer |

### Stripe Integration

```env
# backend/.env
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

**Webhook endpoints handled:**
- `checkout.session.completed` — Activate subscription, upgrade user role
- `customer.subscription.deleted` — Cancel subscription, downgrade user role

### Testing Payments

Use Stripe test card: `4242 4242 4242 4242` with any future date and CVC.

```bash
# Test checkout flow
curl -X POST http://localhost:4000/api/payments/create-checkout \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"plan": "PRO"}'
```

---

## Deployment

### Option 1: Docker Compose (Recommended for Production)

```bash
# 1. Clone on server
git clone https://github.com/rai8053/Astrology.git
cd Astrology

# 2. Configure production environment
cp backend/.env.example backend/.env
# Edit with production values

# 3. Launch full stack
docker-compose up -d

# 4. Run database migrations
docker-compose exec backend npx prisma migrate deploy

# 5. Seed admin user
docker-compose exec backend npx prisma db seed
```

This starts:
- **PostgreSQL 16** on port 5432
- **Redis 7** on port 6379
- **Backend API** on port 4000
- **Frontend** served via Nginx on port 80

### Option 2: Manual VPS Deployment

```bash
# Server setup
apt update && apt install -y nginx postgresql redis-server nodejs npm

# Clone and build
git clone https://github.com/rai8053/Astrology.git
cd Astrology/backend
npm install && npx prisma generate && npm run build
cd ../frontend
npm install && npm run build

# Configure Nginx (see docker/nginx.conf)
# Set up SSL with Certbot
# Configure PM2 for process management
```

### Option 3: Platform Deployments

**Frontend → Vercel**
1. Connect repo to Vercel
2. Set root to `frontend`
3. Build: `npm run build`
4. Output: `dist`

**Backend → Railway / Render**
1. Connect repo
2. Set root to `backend`
3. Build: `npm install && npx prisma generate && npm run build`
4. Start: `node dist/index.cjs`
5. Add environment variables

### Production Checklist

- [ ] Change JWT secrets to strong random values
- [ ] Set `NODE_ENV=production`
- [ ] Configure PostgreSQL with strong credentials
- [ ] Set up Redis for caching
- [ ] Configure Stripe webhook endpoints
- [ ] Enable rate limiting
- [ ] Set up Sentry for error monitoring
- [ ] Configure CDN for static assets
- [ ] Set up automated database backups
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure monitoring (UptimeRobot, Datadog, etc.)

---

## Security

### Implemented Measures

| Measure | Implementation |
|---------|---------------|
| **API Key Protection** | All AI keys server-side only |
| **JWT Authentication** | Short-lived access tokens + refresh rotation |
| **Password Hashing** | bcrypt with 12 salt rounds |
| **HTTP-only Cookies** | Refresh token not accessible via JS |
| **Helmet** | Security headers (CSP, XSS, etc.) |
| **CORS** | Restricted to configured origins |
| **Rate Limiting** | 100 requests per minute per IP |
| **Input Validation** | Zod schemas on all endpoints |
| **SQL Injection** | Prevented by Prisma ORM |
| **XSS Prevention** | React's built-in escaping + CSP headers |
| **Request Logging** | All API requests logged |
| **Error Handling** | Structured errors, no stack leaks |

### Environment Isolation

```env
# Development - .env
NODE_ENV=development
DATABASE_URL="postgresql://dev:dev@localhost:5432/soma_surya"

# Production - set via platform env vars
NODE_ENV=production
DATABASE_URL="postgresql://prod:secret@db-prod:5432/soma_surya"
```

---

## Testing

### Backend Tests

```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
```

Test files co-located with source: `*.test.ts`

### Frontend Tests

```bash
cd frontend
npm test              # Run all tests
npm run test:watch    # Watch mode
```

### CI/CD Pipeline (GitHub Actions)

The `.github/workflows/ci.yml` automatically runs on push/PR:

1. **Lint** — TypeScript type checking on backend and frontend
2. **Test** — Run all tests with PostgreSQL service container
3. **Build** — Production build verification

---

## Scripts

### Root `package.json`

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both frontend and backend in dev mode |
| `npm run build` | Build both frontend and backend |
| `npm run start` | Start production backend |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database |
| `npm run lint` | Type-check both projects |

### Setup Script (Windows)

```powershell
powershell -File scripts/setup.ps1
```

Installs all dependencies and creates `.env` from template.

---

## Troubleshooting

### "AI provider returned empty response"
- Check your API key in `backend/.env`
- Verify the provider's service status
- The system falls back to calculated data automatically

### "Cannot connect to database"
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `backend/.env`
- Run `npx prisma migrate dev` to initialize

### "Port already in use"
- Backend default: 4000
- Frontend default: 5173
- Change via `PORT` env or `vite.config.ts`

### "CORS error in browser"
- Ensure `CORS_ORIGINS` in `backend/.env` includes your frontend URL
- Default dev config: `http://localhost:5173`

---

## FAQ

**Q: How accurate is the AI astrology reading?**
A: Our AI is trained on authentic Vedic astrology texts. When AI is unavailable, mathematically calculated fallback data provides consistent results.

**Q: Is my birth data secure?**
A: Yes. All data is encrypted in transit (HTTPS) and at rest (database). We never share personal data.

**Q: What is Ashta Koota Gun Milan?**
A: A traditional Vedic compatibility system scoring relationships out of 36 points across 8 categories.

**Q: Can I use my own AI provider?**
A: Yes. Set `AI_PROVIDER` to any supported provider and add the corresponding API key.

**Q: How do I switch between providers?**
A: Change `AI_PROVIDER` in `.env` to: `gemini`, `openai`, `claude`, `deepseek`, `groq`, or `openrouter`.

---

## License

Private — All rights reserved.

Soma & Surya © 2026 VedicPath Systems

---

<div align="center">
  <p>Built with ❤️ for the Vedic astrology community</p>
  <p>
    <a href="https://github.com/rai8053/Astrology">GitHub</a> •
    <a href="#soma--surya--ai-powered-vedic-astrology-saas">Back to Top</a>
  </p>
</div>
