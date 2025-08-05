# PowerShell build script for TaskFlow
Write-Host "Starting TaskFlow build with memory optimization..." -ForegroundColor Green

# Set Node.js memory limit
$env:NODE_OPTIONS = "--max-old-space-size=4096"

# Clear previous build
if (Test-Path ".next") {
    Write-Host "Clearing previous build..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".next"
}

# Run build
Write-Host "Building application..." -ForegroundColor Blue
try {
    npx next build
    Write-Host "Build completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Build failed with 4GB, trying with 8GB..." -ForegroundColor Yellow
    $env:NODE_OPTIONS = "--max-old-space-size=8192"
    npx next build
}

Read-Host "Press Enter to continue..."
