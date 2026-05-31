@echo off
title Soma & Surya Dev
echo Starting Soma & Surya dev servers...
echo.

echo === Backend (http://localhost:4000) ===
start "Soma-Surya-Backend" cmd /c "cd /d "%~dp0backend" && npx tsx src/index.ts"

timeout /t 3 /nobreak >nul

echo === Frontend (http://localhost:5173) ===
start "Soma-Surya-Frontend" cmd /c "cd /d "%~dp0frontend" && npx vite --host"

echo.
echo Backend: http://localhost:4000/api/health
echo Frontend: http://localhost:5173
echo Close this window to stop both servers.
