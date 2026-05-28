#!/usr/bin/env bash
set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}🚀 Deploying to production...${NC}"

# Prerequisites
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker required${NC}"; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo -e "${RED}❌ Docker Compose required${NC}"; exit 1; }

# Check env
if [ ! -f backend/.env ]; then
  echo -e "${RED}❌ backend/.env not found. Run setup.sh first.${NC}"
  exit 1
fi

# Stop previous
echo -e "\n${CYAN}🛑 Stopping previous containers...${NC}"
docker compose down --remove-orphans 2>/dev/null || true

# Build & start
echo -e "\n${CYAN}🏗️  Building and starting services...${NC}"
docker compose up -d --build

# Migrate database
echo -e "\n${CYAN}🗄️  Running database migrations...${NC}"
docker compose exec -T backend npx prisma migrate deploy

# Seed admin
echo -e "\n${CYAN}🌱 Seeding admin user...${NC}"
docker compose exec -T backend npx prisma db seed

echo -e "\n${GREEN}✅ Deployed!${NC}"
echo -e "   Frontend: http://localhost"
echo -e "   Backend:  http://localhost:4000"
echo -e "\n${YELLOW}📝 Don't forget to:${NC}"
echo "   - Set up SSL (Caddy, Nginx Proxy Manager, or Cloudflare Tunnel)"
echo "   - Update frontend/.env.production with your domain"
echo "   - Set STRIPE_WEBHOOK_SECRET for payment notifications"
