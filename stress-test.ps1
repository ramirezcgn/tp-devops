# Stress Test Script - TP DevOps
# Este script genera carga en el frontend y backend para visualizar métricas en Grafana

param(
    [int]$Duration = 60,           # Duración del test en segundos
    [int]$Threads = 10,            # Número de threads concurrentes
    [int]$RequestsPerThread = 100, # Requests por thread
    [string]$Target = "both"       # "frontend", "backend", o "both"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🔥 Stress Test - TP DevOps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Configuración:" -ForegroundColor Yellow
Write-Host "  Duración: $Duration segundos" -ForegroundColor White
Write-Host "  Threads concurrentes: $Threads" -ForegroundColor White
Write-Host "  Requests por thread: $RequestsPerThread" -ForegroundColor White
Write-Host "  Target: $Target" -ForegroundColor White
Write-Host ""

# URLs
$frontendUrl = "http://localhost"
$backendUrl = "http://localhost:3001/api/todos"

# Verificar que los servicios estén disponibles
Write-Host "Verificando servicios..." -ForegroundColor Yellow

try {
    if ($Target -eq "frontend" -or $Target -eq "both") {
        $null = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 5
        Write-Host "  ✓ Frontend accesible" -ForegroundColor Green
    }
    if ($Target -eq "backend" -or $Target -eq "both") {
        $null = Invoke-WebRequest -Uri $backendUrl -UseBasicParsing -TimeoutSec 5
        Write-Host "  ✓ Backend accesible" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Error: Servicios no accesibles" -ForegroundColor Red
    Write-Host "  Asegúrate de que port-forwarding esté activo:" -ForegroundColor Yellow
    Write-Host "  .\start-port-forwards.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "🚀 Iniciando stress test en 3 segundos..." -ForegroundColor Yellow
Write-Host "📊 Abre Grafana ahora: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Start-Sleep -Seconds 3

# Función para hacer requests al frontend
$frontendScript = {
    param($url, $requests)
    
    $stats = @{
        Success = 0
        Failed = 0
        TotalTime = 0
    }
    
    for ($i = 0; $i -lt $requests; $i++) {
        try {
            $start = Get-Date
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
            $end = Get-Date
            $elapsed = ($end - $start).TotalMilliseconds
            
            $stats.Success++
            $stats.TotalTime += $elapsed
        } catch {
            $stats.Failed++
        }
        
        # Pequeña pausa aleatoria para simular tráfico real
        Start-Sleep -Milliseconds (Get-Random -Minimum 10 -Maximum 100)
    }
    
    return $stats
}

# Función para hacer requests al backend
$backendScript = {
    param($url, $requests)
    
    $stats = @{
        Success = 0
        Failed = 0
        TotalTime = 0
        Gets = 0
        Posts = 0
        Puts = 0
        Deletes = 0
    }
    
    for ($i = 0; $i -lt $requests; $i++) {
        try {
            $operation = Get-Random -Minimum 0 -Maximum 4
            $start = Get-Date
            
            switch ($operation) {
                0 {
                    # GET - Listar todos
                    $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing -TimeoutSec 10
                    $stats.Gets++
                }
                1 {
                    # POST - Crear todo
                    $body = @{
                        title = "Stress Test Todo $(Get-Random)"
                        completed = $false
                    } | ConvertTo-Json
                    
                    $response = Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
                    $stats.Posts++
                }
                2 {
                    # PUT - Actualizar todo
                    $todoId = Get-Random -Minimum 1 -Maximum 10
                    $body = @{
                        title = "Updated Todo"
                        completed = $true
                    } | ConvertTo-Json
                    
                    $response = Invoke-WebRequest -Uri "$url/$todoId" -Method PUT -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
                    $stats.Puts++
                }
                3 {
                    # GET - Obtener un todo específico
                    $todoId = Get-Random -Minimum 1 -Maximum 10
                    $response = Invoke-WebRequest -Uri "$url/$todoId" -Method GET -UseBasicParsing -TimeoutSec 10
                    $stats.Gets++
                }
            }
            
            $end = Get-Date
            $elapsed = ($end - $start).TotalMilliseconds
            
            $stats.Success++
            $stats.TotalTime += $elapsed
        } catch {
            $stats.Failed++
        }
        
        # Pequeña pausa aleatoria
        Start-Sleep -Milliseconds (Get-Random -Minimum 10 -Maximum 100)
    }
    
    return $stats
}

# Iniciar jobs
$jobs = @()
$startTime = Get-Date

Write-Host "🔥 Generando carga..." -ForegroundColor Red
Write-Host ""

if ($Target -eq "frontend" -or $Target -eq "both") {
    Write-Host "Frontend: Lanzando $Threads threads..." -ForegroundColor Yellow
    for ($i = 0; $i -lt $Threads; $i++) {
        $job = Start-Job -ScriptBlock $frontendScript -ArgumentList $frontendUrl, $RequestsPerThread
        $jobs += @{ Job = $job; Type = "Frontend" }
    }
}

if ($Target -eq "backend" -or $Target -eq "both") {
    Write-Host "Backend: Lanzando $Threads threads..." -ForegroundColor Yellow
    for ($i = 0; $i -lt $Threads; $i++) {
        $job = Start-Job -ScriptBlock $backendScript -ArgumentList $backendUrl, $RequestsPerThread
        $jobs += @{ Job = $job; Type = "Backend" }
    }
}

Write-Host ""
Write-Host "⏳ Test en progreso..." -ForegroundColor Cyan
Write-Host "📊 Ve a Grafana para ver las métricas en tiempo real!" -ForegroundColor Green
Write-Host ""

# Monitorear progreso
$totalJobs = $jobs.Count
$completed = 0

while ($jobs | Where-Object { $_.Job.State -eq 'Running' }) {
    $runningJobs = ($jobs | Where-Object { $_.Job.State -eq 'Running' }).Count
    $completedNow = $totalJobs - $runningJobs
    
    if ($completedNow -ne $completed) {
        $completed = $completedNow
        $percent = [math]::Round(($completed / $totalJobs) * 100, 1)
        $elapsed = ((Get-Date) - $startTime).TotalSeconds
        
        Write-Host "`rProgreso: $completed/$totalJobs threads completados ($percent%) - Tiempo: $([math]::Round($elapsed, 1))s" -NoNewline -ForegroundColor Yellow
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host ""

# Recopilar resultados
Write-Host "📊 Recopilando resultados..." -ForegroundColor Cyan
Write-Host ""

$frontendStats = @{
    Success = 0
    Failed = 0
    TotalTime = 0
    Count = 0
}

$backendStats = @{
    Success = 0
    Failed = 0
    TotalTime = 0
    Gets = 0
    Posts = 0
    Puts = 0
    Deletes = 0
    Count = 0
}

foreach ($jobInfo in $jobs) {
    $result = Receive-Job -Job $jobInfo.Job
    Remove-Job -Job $jobInfo.Job
    
    if ($jobInfo.Type -eq "Frontend") {
        $frontendStats.Success += $result.Success
        $frontendStats.Failed += $result.Failed
        $frontendStats.TotalTime += $result.TotalTime
        $frontendStats.Count++
    } else {
        $backendStats.Success += $result.Success
        $backendStats.Failed += $result.Failed
        $backendStats.TotalTime += $result.TotalTime
        $backendStats.Gets += $result.Gets
        $backendStats.Posts += $result.Posts
        $backendStats.Puts += $result.Puts
        $backendStats.Deletes += $result.Deletes
        $backendStats.Count++
    }
}

$totalTime = ((Get-Date) - $startTime).TotalSeconds

# Mostrar resultados
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Test Completado" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "⏱️  Tiempo total: $([math]::Round($totalTime, 2)) segundos" -ForegroundColor Cyan
Write-Host ""

if ($Target -eq "frontend" -or $Target -eq "both") {
    Write-Host "🌐 FRONTEND (Next.js):" -ForegroundColor Yellow
    Write-Host "  Total requests: $($frontendStats.Success + $frontendStats.Failed)" -ForegroundColor White
    Write-Host "  ✓ Exitosos: $($frontendStats.Success)" -ForegroundColor Green
    Write-Host "  ✗ Fallidos: $($frontendStats.Failed)" -ForegroundColor Red
    
    if ($frontendStats.Success -gt 0) {
        $avgTime = $frontendStats.TotalTime / $frontendStats.Success
        $rps = ($frontendStats.Success + $frontendStats.Failed) / $totalTime
        Write-Host "  ⚡ Tiempo promedio: $([math]::Round($avgTime, 2)) ms" -ForegroundColor Cyan
        Write-Host "  📊 Requests/seg: $([math]::Round($rps, 2))" -ForegroundColor Cyan
    }
    Write-Host ""
}

if ($Target -eq "backend" -or $Target -eq "both") {
    Write-Host "🖥️  BACKEND (Express API):" -ForegroundColor Yellow
    Write-Host "  Total requests: $($backendStats.Success + $backendStats.Failed)" -ForegroundColor White
    Write-Host "  ✓ Exitosos: $($backendStats.Success)" -ForegroundColor Green
    Write-Host "  ✗ Fallidos: $($backendStats.Failed)" -ForegroundColor Red
    
    if ($backendStats.Success -gt 0) {
        $avgTime = $backendStats.TotalTime / $backendStats.Success
        $rps = ($backendStats.Success + $backendStats.Failed) / $totalTime
        Write-Host "  ⚡ Tiempo promedio: $([math]::Round($avgTime, 2)) ms" -ForegroundColor Cyan
        Write-Host "  📊 Requests/seg: $([math]::Round($rps, 2))" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Operaciones:" -ForegroundColor White
        Write-Host "    GET: $($backendStats.Gets)" -ForegroundColor Gray
        Write-Host "    POST: $($backendStats.Posts)" -ForegroundColor Gray
        Write-Host "    PUT: $($backendStats.Puts)" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Ahora revisa Grafana para ver:" -ForegroundColor Cyan
Write-Host "  - Picos en HTTP Requests/sec" -ForegroundColor White
Write-Host "  - Aumento en Response Time" -ForegroundColor White
Write-Host "  - Uso de CPU y Memoria" -ForegroundColor White
Write-Host "  - Conexiones a PostgreSQL y Redis" -ForegroundColor White
Write-Host "  - Tráfico en NGINX" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Grafana: http://localhost:8080" -ForegroundColor Green
Write-Host ""
