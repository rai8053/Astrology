# Soma & Surya Setup Script
Write-Host "🚀 Setting up Soma & Surya Astrology Platform..." -ForegroundColor Cyan

# Check Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js is required. Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js $nodeVersion detected" -ForegroundColor Green

# Install dependencies
Write-Host "`n📦 Installing root dependencies..." -ForegroundColor Cyan
npm install

Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install

Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location ../frontend
npm install

# Setup environment
Set-Location ..
if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "⚙️ Created backend\.env from .env.example - edit with your keys" -ForegroundColor Yellow
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend\.env with your API keys"
Write-Host "2. Run: cd backend; npx prisma migrate dev --name init"
Write-Host "3. Run: npm run dev"
