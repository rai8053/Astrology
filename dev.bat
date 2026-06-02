@echo off
title "Soma & Surya Dev"
cd /d "%~dp0"

echo ============================================
echo   Soma ^& Surya — Dev Environment
echo ============================================
echo.

REM ---- STEP 1: Dependencies ----
echo [1/4] Checking dependencies...
if not exist "%~dp0node_modules" (
    echo   node_modules not found. Running npm install...
    call npm install
    if errorlevel 1 (
        echo   ERROR: npm install failed.
        pause
        exit /b 1
    )
) else (
    echo   node_modules found
)
echo   OK
echo.

REM ---- STEP 2: Kill old servers ----
echo [2/4] Stopping old servers on ports 4000 and 5173...
powershell -NoProfile -Command "netstat -aon | Select-String ':4000' | Select-String 'LISTENING' | ForEach-Object { $i = ($_ -split '\s+')[-1]; Stop-Process -Id $i -Force -ErrorAction SilentlyContinue }" >nul 2>&1
powershell -NoProfile -Command "netstat -aon | Select-String ':5173' | Select-String 'LISTENING' | ForEach-Object { $i = ($_ -split '\s+')[-1]; Stop-Process -Id $i -Force -ErrorAction SilentlyContinue }" >nul 2>&1
ping -n 2 127.0.0.1 >nul
echo   OK
echo.

REM ---- STEP 3: Prisma Client ----
echo [3/4] Generating Prisma Client...
cd /d "%~dp0backend"
call npx prisma generate
if errorlevel 1 (
    echo   Retrying prisma generate in 2s...
    ping -n 3 127.0.0.1 >nul
    call npx prisma generate
)
echo   OK
echo.

REM ---- STEP 4: Start servers ----
echo [4/4] Starting servers...
cd /d "%~dp0"
echo.

echo === Backend (port 4000) ===
start "Soma-Surya-Backend" /D "%~dp0backend" cmd /k "npx tsx src/index.ts || pause"

ping -n 4 127.0.0.1 >nul

echo === Frontend (port 5173) ===
start "Soma-Surya-Frontend" /D "%~dp0frontend" cmd /k "npx vite --host || pause"

echo.
echo Backend: http://localhost:4000/api/health
echo Frontend: http://localhost:5173
echo.
echo Close this window to stop both servers, or press any key...
pause >nul
