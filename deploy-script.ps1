# PCRU CS Connect - Deploy Script
# Run this script to clean, commit, and push to GitHub

Write-Host "🧹 Cleaning unnecessary files..." -ForegroundColor Yellow

# Remove development SQL files
$filesToRemove = @(
    "create-users.sql",
    "debug-users.sql", 
    "fix-likes-rls.sql",
    "increment-view-count.sql",
    "increment-view.sql",
    "insert-mock-users.sql",
    "test-password.js",
    "update-password.sql"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Removed: $file" -ForegroundColor Red
    }
}

# Remove build files
if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force
    Write-Host "Removed: .next directory" -ForegroundColor Red
}

if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force  
    Write-Host "Removed: node_modules directory" -ForegroundColor Red
}

if (Test-Path "tsconfig.tsbuildinfo") {
    Remove-Item "tsconfig.tsbuildinfo" -Force
    Write-Host "Removed: tsconfig.tsbuildinfo" -ForegroundColor Red
}

Write-Host "✅ Cleanup completed!" -ForegroundColor Green

# Git operations
Write-Host "📦 Adding files to git..." -ForegroundColor Yellow
git add .

$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m $commitMessage

Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Deploy completed! Check Vercel for automatic deployment." -ForegroundColor Green