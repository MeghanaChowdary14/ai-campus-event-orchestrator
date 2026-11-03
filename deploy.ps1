# ============================================================
# AI Campus Event Orchestrator — One-Click Deploy Script
# Run this script AFTER installing Git from https://git-scm.com
# ============================================================
# Usage: Right-click > Run with PowerShell  (or in terminal:)
#        powershell -ExecutionPolicy Bypass -File deploy.ps1
# ============================================================

$projectRoot = "c:\Users\vu241\OneDrive\Desktop\416 mfef"
Set-Location $projectRoot

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " AI Campus Event Orchestrator Deploy " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# ---- Step 1: Check Git ----
try {
    $gitVersion = git --version 2>&1
    Write-Host "[OK] Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Git is not installed!" -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "After installing Git, run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# ---- Step 2: Ask for GitHub repo URL ----
Write-Host ""
Write-Host "Enter your GitHub repository URL" -ForegroundColor Yellow
Write-Host "(Create a new empty repo at https://github.com/new first)" -ForegroundColor Gray
$repoUrl = Read-Host "GitHub URL (e.g. https://github.com/YourName/ai-campus-orchestrator.git)"

if (-not $repoUrl) {
    Write-Host "[ERROR] No URL provided. Exiting." -ForegroundColor Red
    exit 1
}

# ---- Step 3: Git init & commit ----
Write-Host ""
Write-Host "[1/4] Initializing Git repository..." -ForegroundColor Cyan
git init
git config user.email "coordinator@campus.edu"
git config user.name "AI Campus Orchestrator"

Write-Host "[2/4] Staging all files..." -ForegroundColor Cyan
git add .
git status

Write-Host "[3/4] Creating initial commit..." -ForegroundColor Cyan
git commit -m "feat: AI Campus Event Orchestrator - 7-Agent AI Architecture

- Multi-Agent AI: Planning, Venue, Schedule, Resource, Conflict, TaskAssignment, Notification agents
- 5-role RBAC: Coordinator, Venue Team, Technical Team, Volunteer Team, Security Team
- JWT authentication with bcrypt password hashing
- Dynamic replanning with plan version history
- Heuristic AI mode (works without OpenAI API key)
- React + Vite + Tailwind CSS frontend
- Node.js + Express + MongoDB backend
- Pre-seeded demo accounts for all roles"

Write-Host "[4/4] Pushing to GitHub..." -ForegroundColor Cyan
git branch -M main
git remote add origin $repoUrl
git push -u origin main

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host " SUCCESS! Code pushed to GitHub!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Deploy BACKEND to Railway:" -ForegroundColor White
Write-Host "   -> Go to https://railway.app" -ForegroundColor Gray
Write-Host "   -> New Project > Deploy from GitHub Repo" -ForegroundColor Gray
Write-Host "   -> Select your repo, set root directory: backend" -ForegroundColor Gray
Write-Host "   -> Add env vars: MONGO_URI, JWT_SECRET, NODE_ENV=production" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy FRONTEND to Vercel:" -ForegroundColor White
Write-Host "   -> Go to https://vercel.com" -ForegroundColor Gray
Write-Host "   -> Add New > Import Git Repository" -ForegroundColor Gray
Write-Host "   -> Select your repo, set root directory: frontend" -ForegroundColor Gray
Write-Host "   -> Add env var: VITE_API_URL=https://your-backend.railway.app/api" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Setup MongoDB Atlas (free):" -ForegroundColor White
Write-Host "   -> Go to https://mongodb.com/atlas" -ForegroundColor Gray
Write-Host "   -> Create free cluster > Get connection string" -ForegroundColor Gray
Write-Host "   -> Use it as MONGO_URI in Railway" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to exit"
