# start.ps1 - Helper script to run the VoTI Sentiment Microservice on Windows

$ErrorActionPreference = "Stop"

Write-Host "Starting VoTI Sentiment Microservice Setup..." -ForegroundColor Cyan

# 1. Check if virtual environment exists
if (-not (Test-Path ".venv")) {
    Write-Host "Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv .venv
}

# 2. Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
$activatePath = ".\.venv\Scripts\Activate.ps1"
if (Test-Path $activatePath) {
    . $activatePath
} else {
    Write-Host "Failed to find activate script at $activatePath" -ForegroundColor Red
    exit 1
}

# 3. Upgrade pip and install requirements
Write-Host "Installing/Updating dependencies..." -ForegroundColor Yellow
python -m pip install --upgrade pip | Out-Null
pip install -r requirements.txt

# 4. Start the server
Write-Host "Starting FastAPI Server on http://127.0.0.1:8000 ..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Cyan
python main.py
