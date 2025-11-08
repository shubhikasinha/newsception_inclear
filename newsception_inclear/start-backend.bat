@echo off
echo ================================================
echo   Newsception Backend - Quick Start Script
echo ================================================
echo.

REM Check Node.js
echo [1/5] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found

REM Navigate to backend
cd backend 2>nul
if errorlevel 1 (
    echo ERROR: backend directory not found!
    echo Please run this script from the project root
    pause
    exit /b 1
)

REM Check if dependencies installed
echo.
echo [2/5] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependencies already installed
)

REM Check .env file
echo.
echo [3/5] Checking environment configuration...
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env >nul
    echo.
    echo ⚠️  IMPORTANT: Please edit backend/.env with your configuration:
    echo    - MongoDB connection string
    echo    - API keys (optional)
    echo    - Other settings
    echo.
    pause
)
echo ✓ .env file exists

REM Start ML Service
echo.
echo [4/5] Starting ML Service...
cd ml-service
start "Newsception ML Service" cmd /k "echo Starting ML Service... && python main.py"
cd ..
timeout /t 3 /nobreak >nul

REM Start Backend
echo.
echo [5/5] Starting Backend API...
echo.
echo ================================================
echo   Backend API starting on http://localhost:5000
echo   ML Service running on http://localhost:8000
echo   Press Ctrl+C to stop
echo ================================================
echo.

call npm run dev
