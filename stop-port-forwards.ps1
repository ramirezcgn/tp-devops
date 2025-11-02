# Script to stop all port forwards
Write-Host "Stopping all port forwards..." -ForegroundColor Yellow

Get-Process kubectl -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Stopping process $($_.Id)..." -ForegroundColor Cyan
    Stop-Process -Id $_.Id -Force
}

Start-Sleep -Seconds 1

Write-Host "`nAll port forwards stopped." -ForegroundColor Green
