# Soma & Surya — AI Vedic Astrology SaaS

## Sell as White-Label or One-Time License

Full-stack, production-ready astrology platform with AI-powered readings, Stripe billing, and premium cosmic UI.

## Marketplaces

- **CodeCanyon / AppSumo** — $49–$99 (standard license)
- **Direct white-label** — $1,000–$2,500 (full source + setup support)

---

## Features Summary

### For End Users
- Birth chart (Rashi, Nakshatra, Lagna) with AI interpretation
- Daily/Monthly horoscope with AI readings
- Compatibility analysis between two charts
- Moon phase calendar with Tithi calculation
- AI chat assistant for astrology Q&A
- Subscription tiers: Free / Pro ($9.99) / Premium ($19.99) / Enterprise ($49.99)

### For You (the Owner)
- Admin panel: manage users, reports, usage analytics
- Role-based access: USER / PREMIUM / ADMIN / SUPER_ADMIN
- Stripe subscriptions with webhook verification
- 5 AI providers (Gemini, OpenAI, Claude, DeepSeek, Groq) + mock mode
- Mathematical fallback — works even with no AI provider
- Full CI/CD: GitHub Actions, Docker, auto-deploy

### Tech Stack
| Layer | Stack |
|---|---|
| Frontend | React 19, Vite, Tailwind v4, Framer Motion, React Query, Zustand |
| Backend | Express, TypeScript, Prisma, Zod |
| Database | PostgreSQL + Redis |
| Auth | JWT with refresh token rotation |
| Payments | Stripe |
| AI | Multi-provider abstraction (6 providers) |
| Deploy | Docker Compose, GitHub Actions, GHCR |

### What Buyers Get
- Full source code (frontend + backend + shared types)
- One-command deploy: `docker compose up -d`
- Setup scripts for Windows and Linux
- 30+ backend unit tests
- White-label config file (rename brand in 1 file)
- Installation guide
- 1 year of updates

### Requirements
- Node.js 22+
- Docker + Docker Compose
- PostgreSQL (included in Docker) or external
- Stripe account (free)
- At least one AI API key (Gemini free tier available)
