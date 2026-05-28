#!/usr/bin/env bash
set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}🚀 Setting up astrology platform...${NC}"

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js >=18 required${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm required${NC}"; exit 1; }
echo -e "${GREEN}✓ Node.js $(node --version) detected${NC}"

# Install dependencies
echo -e "\n${CYAN}📦 Installing dependencies...${NC}"
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Setup environment
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo -e "${YELLOW}⚙️ Created backend/.env — edit with your API keys${NC}"
fi

# Generate Prisma client
cd backend && npx prisma generate && cd ..

echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\n${CYAN}Next steps:${NC}"
echo "1. Edit backend/.env with your API keys (Stripe, AI providers, JWT)"
echo "2. cd backend && npx prisma migrate dev --name init"
echo "3. npm run dev"
