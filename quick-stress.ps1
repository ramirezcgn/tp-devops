# Quick Stress Test - Prueba rápida de carga
# Uso: .\quick-stress.ps1 [segundos]

param(
    [int]$Seconds = 30
)

Write-Host "🔥 Quick Stress Test - $Seconds segundos" -ForegroundColor Cyan
Write-Host ""

$frontendUrl = "http://localhost"
$backendUrl = "http://localhost:3001/api/todos"

Write-Host "Generando carga..." -ForegroundColor Yellow
Write-Host "📊 Abre Grafana: http://localhost:8080" -ForegroundColor Green
Write-Host ""

$endTime = (Get-Date).AddSeconds($Seconds)
$count = 0

while ((Get-Date) -lt $endTime) {
    # Request al frontend
    Start-Job -ScriptBlock {
        param($url)
        try {
            Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5 | Out-Null
        } catch {}
    } -ArgumentList $frontendUrl | Out-Null
    
    # Request al backend
    Start-Job -ScriptBlock {
        param($url)
        try {
            Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5 | Out-Null
        } catch {}
    } -ArgumentList $backendUrl | Out-Null
    
    $count += 2
    $remaining = ($endTime - (Get-Date)).TotalSeconds
    Write-Host "`rRequests enviados: $count - Restantes: $([math]::Round($remaining, 1))s" -NoNewline -ForegroundColor Yellow
    
    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host ""
Write-Host "✅ Test completado - $count requests enviados" -ForegroundColor Green

# Limpiar jobs
Get-Job | Remove-Job -Force
