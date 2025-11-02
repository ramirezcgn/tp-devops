# Complete startup script for TP DevOps Kubernetes cluster
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TP DevOps - Kubernetes Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Docker Desktop is running
Write-Host "[1/5] Checking Docker Desktop..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "  ✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Docker Desktop is not running!" -ForegroundColor Red
    Write-Host "  Please start Docker Desktop and run this script again." -ForegroundColor Yellow
    exit 1
}

# Step 2: Check if Kubernetes is enabled
Write-Host "`n[2/5] Checking Kubernetes..." -ForegroundColor Yellow
try {
    kubectl cluster-info | Out-Null
    Write-Host "  ✓ Kubernetes is running" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Kubernetes is not enabled!" -ForegroundColor Red
    Write-Host "  Please enable Kubernetes in Docker Desktop settings." -ForegroundColor Yellow
    exit 1
}

# Step 3: Check if resources are already deployed
Write-Host "`n[3/5] Checking existing deployments..." -ForegroundColor Yellow
$existingPods = kubectl get pods --no-headers 2>&1
if ($existingPods -match "devops-") {
    Write-Host "  ✓ Resources already deployed" -ForegroundColor Green
    $deploy = Read-Host "  Do you want to redeploy? (y/N)"
    if ($deploy -eq "y" -or $deploy -eq "Y") {
        Write-Host "  Deleting existing resources..." -ForegroundColor Cyan
        kubectl delete -f kubernetes/deploy-all.yaml --ignore-not-found=true
        Start-Sleep -Seconds 5
        Write-Host "  Deploying resources..." -ForegroundColor Cyan
        kubectl apply -f kubernetes/deploy-all.yaml
    }
} else {
    Write-Host "  No existing deployments found" -ForegroundColor Yellow
    Write-Host "  Deploying all resources..." -ForegroundColor Cyan
    kubectl apply -f kubernetes/deploy-all.yaml
}

# Step 4: Wait for pods to be ready
Write-Host "`n[4/5] Waiting for pods to be ready..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray

$maxWaitTime = 180 # 3 minutes
$startTime = Get-Date
$allReady = $false

while (-not $allReady -and ((Get-Date) - $startTime).TotalSeconds -lt $maxWaitTime) {
    $pods = kubectl get pods --no-headers 2>&1
    $totalPods = ($pods | Measure-Object).Count
    $readyPods = ($pods | Where-Object { $_ -match "1/1.*Running" } | Measure-Object).Count
    
    if ($totalPods -eq 0) {
        Write-Host "  Waiting for pods to start..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
        continue
    }
    
    Write-Host "  Ready: $readyPods/$totalPods pods" -ForegroundColor Cyan
    
    if ($readyPods -eq $totalPods) {
        $allReady = $true
    } else {
        Start-Sleep -Seconds 5
    }
}

if ($allReady) {
    Write-Host "  ✓ All pods are ready!" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Some pods are still starting..." -ForegroundColor Yellow
    Write-Host "  Check status with: kubectl get pods" -ForegroundColor Gray
}

# Step 5: Start port forwarding
Write-Host "`n[5/5] Setting up port forwarding..." -ForegroundColor Yellow
& "$PSScriptRoot\start-port-forwards.ps1"

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Startup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nYour services are available at:" -ForegroundColor White
Write-Host "  🌐 Application:  http://localhost" -ForegroundColor Cyan
Write-Host "  📊 Grafana:      http://localhost:8080 (admin/admin)" -ForegroundColor Cyan
Write-Host "  🔧 Backend API:  http://localhost:3001/api/todos" -ForegroundColor Cyan

Write-Host "`nUseful commands:" -ForegroundColor White
Write-Host "  kubectl get pods              - View all pods" -ForegroundColor Gray
Write-Host "  kubectl logs -f <pod-name>    - View pod logs" -ForegroundColor Gray
Write-Host "  .\stop-port-forwards.ps1      - Stop port forwards" -ForegroundColor Gray
Write-Host "  .\start-port-forwards.ps1     - Restart port forwards" -ForegroundColor Gray

Write-Host "`nPress any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
