@echo off
cd /d "%~dp0"
echo Starting Soma & Surya...
start "Backend" cmd /c "cd backend && npm run dev"
start "Frontend" cmd /c "cd frontend && npm run dev"
echo Both servers starting...
echo Backend: http://localhost:4000
echo Frontend: http://localhost:5173
