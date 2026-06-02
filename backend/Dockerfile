FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm ci
COPY . .
RUN cd backend && npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system app && adduser --system app
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/prisma ./prisma
USER app
EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "dist/index.cjs"]
