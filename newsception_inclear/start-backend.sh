#!/bin/bash

echo "================================================"
echo "   Newsception Backend - Quick Start Script"
echo "================================================"
echo ""

# Check Node.js
echo "[1/5] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js found: $(node --version)"

# Navigate to backend
cd backend 2>/dev/null || {
    echo "ERROR: backend directory not found!"
    echo "Please run this script from the project root"
    exit 1
}

# Check if dependencies installed
echo ""
echo "[2/5] Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install || {
        echo "ERROR: Failed to install dependencies"
        exit 1
    }
else
    echo "✓ Dependencies already installed"
fi

# Check .env file
echo ""
echo "[3/5] Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit backend/.env with your configuration:"
    echo "   - MongoDB connection string"
    echo "   - API keys (optional)"
    echo "   - Other settings"
    echo ""
    read -p "Press Enter to continue after editing .env..."
fi
echo "✓ .env file exists"

# Check Python
echo ""
echo "[4/5] Starting ML Service..."
if command -v python3 &> /dev/null; then
    cd ml-service
    # Start ML service in background
    python3 main.py > ../logs/ml-service.log 2>&1 &
    ML_PID=$!
    echo "✓ ML Service started (PID: $ML_PID)"
    cd ..
    sleep 3
else
    echo "⚠️  Python not found, ML service will use mock data"
fi

# Start Backend
echo ""
echo "[5/5] Starting Backend API..."
echo ""
echo "================================================"
echo "   Backend API starting on http://localhost:5000"
echo "   ML Service running on http://localhost:8000"
echo "   Press Ctrl+C to stop"
echo "================================================"
echo ""

# Trap Ctrl+C to cleanup
trap "echo 'Stopping services...'; kill $ML_PID 2>/dev/null; exit" INT TERM

npm run dev
