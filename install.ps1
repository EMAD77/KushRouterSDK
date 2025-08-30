# KushRouter SDK Installation Script for Windows PowerShell
# This script helps you install the KushRouter SDK in your project

Write-Host "🚀 KushRouter SDK Installation" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ No package.json found. Please run this script in your project root." -ForegroundColor Red
    Write-Host "💡 If this is a new project, run: npm init -y" -ForegroundColor Yellow
    exit 1
}

# Detect package manager
$packageManager = "npm"
$installCmd = "npm install"

if (Test-Path "yarn.lock") {
    $packageManager = "yarn"
    $installCmd = "yarn add"
} elseif (Test-Path "pnpm-lock.yaml") {
    $packageManager = "pnpm"
    $installCmd = "pnpm add"
} elseif (Test-Path "bun.lockb") {
    $packageManager = "bun"
    $installCmd = "bun add"
}

Write-Host "📦 Detected package manager: $packageManager" -ForegroundColor Green
Write-Host ""

# Install the SDK
Write-Host "⬇️  Installing KushRouter SDK..." -ForegroundColor Blue
$process = Start-Process -FilePath "cmd" -ArgumentList "/c", "$installCmd kushrouter-sdk" -Wait -PassThru -NoNewWindow

if ($process.ExitCode -eq 0) {
    Write-Host "✅ KushRouter SDK installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Installation failed. Please check your internet connection and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎁 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Get your FREE `$50 credits at: https://kushrouter.com" -ForegroundColor White
Write-Host "2. Generate your API key" -ForegroundColor White
Write-Host "3. Add to your .env file: KUSHROUTER_API_KEY=your_api_key_here" -ForegroundColor White
Write-Host ""
Write-Host "📖 Quick Start:" -ForegroundColor Cyan
Write-Host "import { createKushRouterSDK } from 'kushrouter-sdk';" -ForegroundColor Gray
Write-Host "const sdk = createKushRouterSDK({ apiKey: process.env.KUSHROUTER_API_KEY });" -ForegroundColor Gray
Write-Host "const response = await sdk.complete('Hello, AI!');" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentation: https://kushrouter.com/docs" -ForegroundColor Blue
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Green