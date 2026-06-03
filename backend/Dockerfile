FROM node:22-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci
COPY . .
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/soma_surya?schema=public"`nRUN cd backend && npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup --system app && adduser --system app

# Install Playwright system dependencies for Chromium
RUN apk add --no-cache \
  libstdc++ \
  libgcc \
  libx11 \
  libxcb \
  libxcomposite \
  libxdamage \
  libxext \
  libxfixes \
  libxi \
  libxrandr \
  libxrender \
  libxshmfence \
  libxtst \
  glib \
  nss \
  nspr \
  dbus \
  at-spi2-core \
  cups-libs \
  alsa-lib \
  freetype \
  ttf-freefont \
  wget \
  ca-certificates

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/prisma ./prisma

# Install Playwright Chromium browser
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.cache/ms-playwright
RUN npx playwright install chromium

USER app
EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "dist/index.cjs"]
