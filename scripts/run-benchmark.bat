@echo off
REM Stasis PDF Generator Benchmark Runner
REM Run this script to benchmark the PDF generation service

echo 🚀 Stasis PDF Generator Benchmark Runner
echo ==========================================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

REM Install dependencies if needed
echo 📦 Installing dependencies...
pip install -r scripts\requirements.txt >nul 2>&1

REM Check if service is running
echo 🔍 Checking if Stasis service is running...
curl -s http://localhost:7070/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Stasis service is not running on localhost:7070
    echo Please start the service first with: docker compose up -d
    pause
    exit /b 1
)

REM Run benchmark with default settings
echo 🎯 Running benchmark...
python benchmark.py --users 5 --requests 10

echo.
echo ✅ Benchmark completed!
pause
