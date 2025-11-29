# Script to start persistent port forwards for Grafana and NGINX
Write-Host "Starting port forwards..." -ForegroundColor Green

# Kill any existing kubectl port-forward processes
Get-Process kubectl -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Grafana port-forward (background)
Write-Host "Starting Grafana port-forward on localhost:8080..." -ForegroundColor Cyan
Start-Process kubectl -ArgumentList "port-forward svc/grafana 8080:3000" -WindowStyle Hidden -PassThru | Out-Null
Start-Sleep -Seconds 2

# Start NGINX port-forward (background)
Write-Host "Starting NGINX port-forward on localhost:80..." -ForegroundColor Cyan
Start-Process kubectl -ArgumentList "port-forward svc/nginx-lb 80:80" -WindowStyle Hidden -PassThru | Out-Null
Start-Sleep -Seconds 2

# Start Backend port-forward (optional, for direct access)
Write-Host "Starting Backend port-forward on localhost:3001..." -ForegroundColor Cyan
Start-Process kubectl -ArgumentList "port-forward svc/devops-be 3001:8080" -WindowStyle Hidden -PassThru | Out-Null
Start-Sleep -Seconds 2

# Start Jaeger port-forward (for tracing UI)
Write-Host "Starting Jaeger port-forward on localhost:16686..." -ForegroundColor Cyan
Start-Process kubectl -ArgumentList "port-forward svc/jaeger-query 16686:16686" -WindowStyle Hidden -PassThru | Out-Null
Start-Sleep -Seconds 2

Write-Host "`nPort forwards started successfully!" -ForegroundColor Green
Write-Host "`nAvailable services:" -ForegroundColor Yellow
Write-Host "  - Application: http://localhost" -ForegroundColor White
Write-Host "  - Grafana: http://localhost:8080 (admin/admin)" -ForegroundColor White
Write-Host "  - Backend API: http://localhost:3001/api/todos" -ForegroundColor White
Write-Host "  - Jaeger UI: http://localhost:16686" -ForegroundColor White

Write-Host "`nTo stop port forwards, run:" -ForegroundColor Yellow
Write-Host "  Get-Process kubectl | Stop-Process" -ForegroundColor White
