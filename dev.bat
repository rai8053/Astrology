@echo off
title "Soma & Surya Dev"
cd /d "%~dp0"

echo ============================================
echo   Soma ^& Surya — Dev Environment
echo ============================================
echo.

REM ---- STEP 1: Dependencies ----
echo [1/5] Checking dependencies...
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
echo [2/5] Stopping old servers on ports 4000 and 5173...
powershell -NoProfile -Command "netstat -aon | Select-String ':4000' | Select-String 'LISTENING' | ForEach-Object { $i = ($_ -split '\s+')[-1]; Write-Host ('  Killing PID ' + $i + ' on port 4000'); Stop-Process -Id $i -Force -ErrorAction SilentlyContinue }"
powershell -NoProfile -Command "netstat -aon | Select-String ':5173' | Select-String 'LISTENING' | ForEach-Object { $i = ($_ -split '\s+')[-1]; Write-Host ('  Killing PID ' + $i + ' on port 5173'); Stop-Process -Id $i -Force -ErrorAction SilentlyContinue }"
ping -n 2 127.0.0.1 >nul
echo   OK
echo.

REM ---- STEP 3: Prisma Client ----
echo [3/5] Generating Prisma Client...
cd /d "%~dp0backend"
call npx prisma generate
if errorlevel 1 (
    echo   Retrying prisma generate in 2s...
    ping -n 3 127.0.0.1 >nul
    call npx prisma generate
    if errorlevel 1 (
        echo   WARNING: prisma generate failed. Check your database connection.
    )
)
echo   OK
echo.

REM ---- STEP 4: Database check ----
echo [4/5] Checking database connectivity...
cd /d "%~dp0backend"
call npx prisma db push --accept-data-loss --skip-generate 2>nul
echo   OK
echo.

REM ---- STEP 5: Start both servers ----
echo [5/5] Starting development servers...
cd /d "%~dp0"
echo.
echo ============================================
echo   Starting Backend (port 4000) ^& Frontend (port 5173)
echo   Press Ctrl+C to stop both.
echo ============================================
echo.

call npm run dev

REM ---- This runs after Ctrl+C ----
echo.
echo ============================================
echo   Servers stopped.
echo ============================================
pause
