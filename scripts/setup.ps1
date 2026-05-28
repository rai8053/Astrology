param(
  [switch]$Deploy
)

$ErrorActionPreference = "Stop"
$cyan = "Cyan"; $green = "Green"; $yellow = "Yellow"; $red = "Red"

Write-Host "🚀 Setting up astrology platform..." -ForegroundColor $cyan

# Check Node.js
$nodeVer = node --version 2>$null
if (-not $nodeVer) {
  Write-Host "❌ Node.js >=18 required. Install from https://nodejs.org" -ForegroundColor $red
  exit 1
}
Write-Host "✓ Node.js $nodeVer detected" -ForegroundColor $green

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor $cyan
npm install
Push-Location backend
npm install
Pop-Location
Push-Location frontend
npm install
Pop-Location

# Setup .env
if (-not (Test-Path "backend\.env")) {
  Copy-Item "backend\.env.example" "backend\.env"
  Write-Host "⚙️ Created backend\.env — edit with your API keys" -ForegroundColor $yellow
}

# Generate Prisma client
Push-Location backend
npx prisma generate
Pop-Location

if ($Deploy) {
  Write-Host "`n🐳 Deploying with Docker..." -ForegroundColor $cyan
  docker compose down --remove-orphans 2>$null
  docker compose up -d --build
  docker compose exec backend npx prisma migrate deploy
  docker compose exec backend npx prisma db seed
  Write-Host "✅ Deployed! Frontend: http://localhost" -ForegroundColor $green
} else {
  Write-Host "`n✅ Setup complete!" -ForegroundColor $green
  Write-Host "`nNext steps:" -ForegroundColor $cyan
  Write-Host "1. Edit backend\.env with your API keys"
  Write-Host "2. cd backend; npx prisma migrate dev --name init"
  Write-Host "3. npm run dev"
  Write-Host "`nOr deploy now:  .\scripts\setup.ps1 -Deploy"
}
