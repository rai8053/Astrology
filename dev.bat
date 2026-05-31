@echo off
title "Soma & Surya Dev"
echo Starting Soma ^& Surya dev servers...
echo.

echo === Stopping old backend if running ===
for /f "tokens=5" %%a in ('netstat -aon ^| find ":4000" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
timeout /t 1 /nobreak >nul

echo === Generating Prisma Client ===
cd /d "%~dp0backend"
npx prisma generate
if %errorlevel% neq 0 (
  echo Retrying prisma generate after 2s...
  timeout /t 2 /nobreak >nul
  npx prisma generate
)

echo.
echo === Backend (http://localhost:4000) ===
start /b "" cmd /c "cd /d %~dp0backend && npx tsx src/index.ts"

timeout /t 4 /nobreak >nul

echo === Frontend (http://localhost:5173) ===
start /b "" cmd /c "cd /d %~dp0frontend && npx vite --host"

echo.
echo Backend: http://localhost:4000/api/health
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers.
echo.
:wait
timeout /t 10 /nobreak >nul
goto wait
