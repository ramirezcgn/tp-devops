# Complete shutdown script for TP DevOps Kubernetes cluster
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TP DevOps - Kubernetes Shutdown" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Confirm shutdown
$confirm = Read-Host "This will stop all services and port forwards. Continue? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Shutdown cancelled." -ForegroundColor Yellow
    exit 0
}

# Step 1: Stop port forwarding
Write-Host "`n[1/3] Stopping port forwards..." -ForegroundColor Yellow
& "$PSScriptRoot\stop-port-forwards.ps1"

# Step 2: Ask if user wants to delete Kubernetes resources
Write-Host "`n[2/3] Kubernetes resources..." -ForegroundColor Yellow
$deleteResources = Read-Host "Do you want to delete all Kubernetes resources? (y/N)"

if ($deleteResources -eq "y" -or $deleteResources -eq "Y") {
    Write-Host "  Deleting all resources..." -ForegroundColor Cyan
    kubectl delete -f kubernetes/deploy-all.yaml --ignore-not-found=true
    Write-Host "  ✓ Resources deleted" -ForegroundColor Green
} else {
    Write-Host "  Keeping resources (they will persist after reboot)" -ForegroundColor Yellow
}

# Step 3: Summary
Write-Host "`n[3/3] Shutdown complete!" -ForegroundColor Green
Write-Host ""

if ($deleteResources -eq "y" -or $deleteResources -eq "Y") {
    Write-Host "All resources have been removed from Kubernetes." -ForegroundColor White
    Write-Host "To start again, run: .\start.ps1" -ForegroundColor Cyan
} else {
    Write-Host "Kubernetes resources are still running." -ForegroundColor White
    Write-Host "To restart port forwards only: .\start-port-forwards.ps1" -ForegroundColor Cyan
    Write-Host "To fully restart: .\start.ps1" -ForegroundColor Cyan
}

Write-Host "`nPress any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
