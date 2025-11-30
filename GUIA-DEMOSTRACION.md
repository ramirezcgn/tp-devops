# Guía Práctica de Demostración - TP DevOps

> **Objetivo:** Guía paso a paso para demostrar el funcionamiento completo del sistema, incluyendo detalles internos de cómo funciona cada componente.

---

## 📋 Índice

1. [Preparación del Entorno](#preparación-del-entorno)
2. [Demo 1: OpenTelemetry - Logs Estructurados](#demo-1-opentelemetry---logs-estructurados)
3. [Demo 2: OpenTelemetry - Métricas](#demo-2-opentelemetry---métricas)
4. [Demo 3: OpenTelemetry - Trazas Distribuidas](#demo-3-opentelemetry---trazas-distribuidas)
5. [Demo 4: Grafana Dashboards](#demo-4-grafana-dashboards)
6. [Demo 5: Orquestación Kubernetes](#demo-5-orquestación-kubernetes)
7. [Demo 6: Alta Disponibilidad (HA)](#demo-6-alta-disponibilidad-ha)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Preparación del Entorno

### Prerequisitos

1. **Docker Desktop** corriendo con Kubernetes habilitado
2. **kubectl** configurado
3. **curl** disponible en terminal

### Paso 1: Iniciar el Sistema

```bash
# Opción A: Usar script de inicio (recomendado)
./start.sh

# Opción B: Manual
kubectl apply -f kubernetes/deploy-all.yaml
./start-port-forwards.sh
```

**Qué hace internamente:**

1. **Verifica Docker y Kubernetes**
   - `docker info` → Check si daemon está corriendo
   - `kubectl cluster-info` → Check si K8s está habilitado

2. **Deploy de recursos**
   - Lee `kubernetes/deploy-all.yaml` (644 líneas)
   - Crea: Deployments, Services, ConfigMaps, PVCs
   - Kubernetes scheduler asigna pods a nodos

3. **Espera pods ready**
   - Polling cada 5s: `kubectl get pods --no-headers`
   - Cuenta pods con estado `1/1 Running`
   - Max wait: 180s (3 minutos)

4. **Port forwards**
   - Crea túneles: `kubectl port-forward svc/<name> <local>:<remote>`
   - Procesos en background
   - Logs silenciados con `> /dev/null 2>&1`

**Tiempo estimado:** 2-3 minutos

### Paso 2: Verificar que Todo Está Corriendo

```bash
kubectl get pods
```

**Output esperado:**
```
NAME                         READY   STATUS    RESTARTS   AGE
cadvisor-xxxxx               1/1     Running   0          2m
devops-be-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
devops-be-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
devops-db-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
devops-fe-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
devops-fe-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
devops-fe-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
devops-redis-xxxxxxx-xxxxx   1/1     Running   0          2m
grafana-xxxxxxxxxx-xxxxx     1/1     Running   0          2m
jaeger-xxxxxxxxxx-xxxxx      1/1     Running   0          2m
nginx-lb-xxxxxxxxxx-xxxxx    2/2     Running   0          2m
prometheus-xxxxxxxx-xxxxx    1/1     Running   0          2m
```

**Verificar servicios accesibles:**

```bash
# Aplicación frontend
curl http://localhost

# Backend API
curl http://localhost/api/health

# Grafana
curl http://localhost:8080

# Jaeger
curl http://localhost:16686

# Prometheus
curl http://localhost:9090
```

---

## 📝 Demo 1: OpenTelemetry - Logs Estructurados

### Objetivo
Mostrar que los logs están en formato JSON estructurado con trace correlation.

### Paso 1: Generar Actividad

```bash
# Crear un TODO
curl -X POST http://localhost/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Demo OpenTelemetry","description":"Testing structured logs"}'
```

### Paso 2: Ver Logs del Backend

```bash
# Ver últimas 20 líneas
kubectl logs -l app=devops-be --tail=20
```

**Output esperado (JSON estructurado):**

```json
{
  "level": "info",
  "time": 1701382845448,
  "pid": 1,
  "hostname": "devops-be-595b7cbcff-858gz",
  "service": "devops-be",
  "environment": "development",
  "trace_id": "6b4b108a7f9c6e4d4e5030b56ee60abe",
  "span_id": "1c69f0e832739f9e",
  "trace_flags": "01",
  "method": "POST",
  "url": "/api/todos",
  "path": "/api/todos",
  "statusCode": 201,
  "duration": "45ms",
  "msg": "Request completed"
}
```

### Paso 3: Ver Logs en Tiempo Real

```bash
# Seguir logs en tiempo real (like tail -f)
kubectl logs -f -l app=devops-be
```

**Mientras está corriendo, hacer requests:**

```bash
# En otra terminal
curl http://localhost/api/todos
```

**Observa que aparecen inmediatamente en los logs.**

### Cómo Funciona Internamente

**Arquitectura de logging:**

```
[Request] 
   ↓
[Logger Middleware] ← Inyecta trace context
   ↓
[Pino Logger] ← Formatea a JSON
   ↓
[STDOUT] ← Kubernetes captura
   ↓
[kubectl logs] ← Acceso via API
```

**Código relevante (`logger.middleware.ts`):**

```typescript
// Extrae trace context del request
const span = trace.getActiveSpan();
const spanContext = span?.spanContext();

logger.info({
  msg: 'Request completed',
  trace_id: spanContext?.traceId,      // ← Correlation!
  span_id: spanContext?.spanId,
  method: req.method,
  url: req.url,
  statusCode: res.statusCode,
  duration: `${Date.now() - startTime}ms`,
});
```

**Beneficios:**

- ✅ **Trace Correlation:** Buscar `trace_id` en Jaeger → ver request completo
- ✅ **Structured:** Fácil de parsear, buscar, filtrar
- ✅ **Context rico:** método, URL, status, duración automáticos

---

## 📊 Demo 2: OpenTelemetry - Métricas

### Objetivo
Mostrar que las métricas están siendo recolectadas por Prometheus.

### Paso 1: Acceder a Prometheus

Abrir en navegador: **http://localhost:9090**

### Paso 2: Explorar Métricas Disponibles

En el campo de búsqueda, empezar a escribir `http_` y ver el autocompletado:

**Métricas backend:**
- `http_request_duration_seconds` - Histograma de latencias
- `http_requests_total` - Contador de requests
- `db_query_duration_seconds` - Latencia de DB
- `cache_hits_total` - Cache hits
- `cache_misses_total` - Cache misses
- `nodejs_heap_size_used_bytes` - Memoria heap

**Métricas contenedores (cAdvisor):**
- `container_cpu_usage_seconds_total`
- `container_memory_usage_bytes`
- `container_network_transmit_bytes_total`

### Paso 3: Ejecutar Queries PromQL

#### Query 1: Request Rate por Endpoint

```promql
rate(http_requests_total{job="devops-be"}[1m])
```

**Qué hace:**
- `http_requests_total` - Contador total de requests
- `rate([1m])` - Calcula requests por segundo en ventana de 1 minuto
- Resultado: `2.5` = 2.5 req/s

#### Query 2: Latencia P95

```promql
histogram_quantile(0.95, 
  rate(http_request_duration_seconds_bucket{job="devops-be"}[5m])
)
```

**Qué hace:**
- Usa histograma para calcular percentil 95
- 95% de los requests son más rápidos que este valor
- Resultado: `0.085` = 85ms

#### Query 3: Cache Hit Rate

```promql
sum(rate(cache_hits_total[5m])) / 
(sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m])))
```

**Resultado:** `0.85` = 85% de hits

#### Query 4: Memoria por Pod

```promql
container_memory_usage_bytes{pod=~"devops-be.*"} / 1024 / 1024
```

**Resultado:** Memoria en MB de cada pod backend

### Paso 4: Generar Carga y Ver Métricas Cambiar

```bash
# Loop de requests para generar carga
for i in {1..100}; do
  curl -s http://localhost/api/todos > /dev/null
  echo "Request $i"
done
```

**Volver a Prometheus y re-ejecutar las queries anteriores.**

Observa que:
- Request rate aumenta
- Latencia puede subir ligeramente
- Cache hit rate mejora (warm cache)

### Cómo Funciona Internamente

**Arquitectura de métricas:**

```
[Application Code]
   ↓
[Prometheus Client] ← Registra métricas
   ↓
[/metrics endpoint] ← Expone en HTTP
   ↓
[Prometheus Scraper] ← Scrape cada 15s
   ↓
[TSDB] ← Time-series database
   ↓
[PromQL Queries] ← Grafana/UI consulta
```

**Código de métricas (`metrics.ts`):**

```typescript
import { register, Counter, Histogram } from 'prom-client';

// Contador de requests
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Histograma de duración
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5], // Buckets para P95/P99
});
```

**Middleware que registra métricas:**

```typescript
export function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    // Incrementar contador
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    });
    
    // Observar duración
    httpRequestDuration.observe({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    }, duration);
  });
  
  next();
}
```

**Endpoint de métricas (`/metrics`):**

```typescript
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics()); // ← Prometheus scrape esto
});
```

**Configuración de Prometheus (`prometheus.yml`):**

```yaml
scrape_configs:
  - job_name: 'devops-be'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['devops-be:8080']  # ← Scrape cada 15s
```

---

## 🔍 Demo 3: OpenTelemetry - Trazas Distribuidas

### Objetivo
Mostrar trazas end-to-end desde frontend hasta database.

### Paso 1: Acceder a Jaeger UI

Abrir en navegador: **http://localhost:16686**

### Paso 2: Buscar Trazas del Frontend

1. En "Service" dropdown → seleccionar **`devops-fe`**
2. Click en **"Find Traces"**

**Observas:**
- Múltiples trazas del frontend
- Cada una muestra el request HTTP realizado
- Duración total del request

### Paso 3: Explorar una Traza Frontend

Click en cualquier traza para expandirla:

**Estructura:**
```
devops-fe: HTTP GET /api/todos [120ms]
  └─ fetch: GET http://devops-be:8080/api/todos [115ms]
```

**Spans visibles:**
- `HTTP GET /api/todos` - Request principal
- `fetch GET` - Llamada al backend
- Attributes:
  - `http.url`: URL completa
  - `http.method`: GET
  - `http.status_code`: 200

### Paso 4: Ver Traza Completa (Frontend → Backend → DB)

1. Cambiar Service a **`devops-be`**
2. Find Traces
3. Click en una traza que tenga **múltiples spans** (>3)

**Estructura completa:**

```
devops-fe: HTTP GET /api/todos [125ms]
  └─ fetch: GET http://devops-be:8080/api/todos [120ms]
       └─ devops-be: GET /api/todos [115ms]
            ├─ redis: GET todos:all [2ms] ← Cache check
            ├─ pg: SELECT * FROM todos [18ms] ← DB query (cache miss)
            └─ redis: SET todos:all [1ms] ← Cache write
```

**Cómo interpretar:**

- **Cascada de spans:** Cada nivel más profundo = llamada anidada
- **Duración:** Tiempo total incluye hijos
- **Colores:** Diferentes servicios tienen colores distintos
- **Attributes:** Click en span para ver detalles (query SQL, etc.)

### Paso 5: Generar Traza con Error

```bash
# Request a endpoint inexistente
curl http://localhost/api/nonexistent
```

**En Jaeger:**

1. Filtrar por error: En "Tags" agregar `error=true`
2. Find Traces
3. Observa que la traza está marcada en **rojo**
4. Span muestra:
   - `http.status_code`: 404
   - `error`: true
   - Stack trace (si hay exception)

### Paso 6: Service Map

En Jaeger UI:

1. Click en **"System Architecture"** (arriba)
2. Observa el grafo de dependencias:

```
┌───────────┐
│ devops-fe │
└─────┬─────┘
      │
      ▼
┌───────────┐     ┌──────────┐
│ devops-be │────▶│  redis   │
└─────┬─────┘     └──────────┘
      │
      ▼
┌───────────┐
│ postgres  │
└───────────┘
```

**Información mostrada:**
- Request rate entre servicios
- Latencia promedio
- Error rate

### Cómo Funciona Internamente

**Propagación de Trace Context:**

```
[Browser]
   │ traceId: abc123
   │ spanId: span1
   ▼
[HTTP Request Headers]
   traceparent: 00-abc123-span1-01  ← W3C Trace Context
   ▼
[Backend recibe headers]
   │ Extract trace context
   │ Create child span: span2
   ▼
[Backend → DB]
   │ traceId: abc123 (same!)
   │ spanId: span3 (child of span2)
```

**Código Frontend (`telemetry.ts`):**

```typescript
// Instrumenta fetch automáticamente
new FetchInstrumentation({
  propagateTraceHeaderCorsUrls: [/.*/],  // ← Propagar a todos los dominios
  applyCustomAttributesOnSpan: (span, request, result) => {
    span.setAttribute('http.request.url', request.url);
    span.setAttribute('http.response.status_code', result.status);
  },
});

// Export a Jaeger via nginx
const exporter = new OTLPTraceExporter({
  url: '/v1/traces',  // ← Browser → nginx → jaeger-collector:4318
});
```

**Código Backend (`telemetry.ts`):**

```typescript
// Auto-instrumentación
registerInstrumentations({
  instrumentations: [
    new ExpressInstrumentation(),   // HTTP server
    new HttpInstrumentation(),      // HTTP client
    new PgInstrumentation(),        // PostgreSQL
    new IORedisInstrumentation(),   // Redis
  ],
});

// Export a Jaeger
const exporter = new OTLPTraceExporter({
  url: process.env.JAEGER_OTLP_ENDPOINT, // http://jaeger-collector:4318/v1/traces
});

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'devops-be',
  }),
});
```

**Nginx proxy para trazas frontend:**

```nginx
# Browser envía directamente a Jaeger via nginx
location /v1/traces {
    proxy_pass http://jaeger-collector:4318/v1/traces;
    proxy_set_header Content-Type application/json;
    proxy_read_timeout 10s;
}
```

**Flujo completo:**

1. **Browser:** User hace click → fetch('/api/todos')
2. **FetchInstrumentation:** Crea span, agrega traceparent header
3. **ServiceNameProcessor:** Modifica span.resource.attributes['service.name'] = 'devops-fe'
4. **BatchSpanProcessor:** Batchea spans cada 5s
5. **OTLPTraceExporter:** POST a /v1/traces con JSON
6. **Nginx:** Proxy a jaeger-collector:4318
7. **Jaeger Collector:** Recibe y almacena trace
8. **Backend:** Recibe request con traceparent header
9. **ExpressInstrumentation:** Extrae context, crea child span
10. **PgInstrumentation:** Crea span para SELECT query
11. **IORedisInstrumentation:** Crea span para GET/SET
12. **Backend exporta:** Spans a jaeger-collector
13. **Jaeger UI:** Query API para mostrar traza completa

---

## 📈 Demo 4: Grafana Dashboards

### Objetivo
Mostrar dashboard completo con métricas de aplicación y contenedores.

### Paso 1: Acceder a Grafana

Abrir en navegador: **http://localhost:8080**

**Credenciales:**
- Usuario: `admin`
- Password: `admin`

### Paso 2: Explorar Datasources

1. Menu lateral → **Configuration** (⚙️) → **Data sources**
2. Observa: **Prometheus** configurado como default

**Cómo se configuró automáticamente:**

```yaml
# kubernetes/grafana.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-datasources
data:
  datasources.yaml: |
    apiVersion: 1
    datasources:
    - name: Prometheus
      type: prometheus
      access: proxy
      url: http://prometheus:9090  # ← DNS interno K8s
      isDefault: true
```

Kubernetes monta este ConfigMap en `/etc/grafana/provisioning/datasources/`.

### Paso 3: Crear Dashboard - Métricas de Aplicación

1. Menu → **Dashboards** → **New** → **New Dashboard**
2. **Add visualization**
3. Select datasource: **Prometheus**

#### Panel 1: Request Rate

**Query:**
```promql
sum(rate(http_requests_total{job="devops-be"}[1m])) by (route)
```

**Configuración:**
- Title: "Request Rate by Endpoint"
- Type: Graph
- Legend: `{{route}}`
- Y-axis: req/s

**Qué muestra:** Requests por segundo para cada endpoint (separados por color).

#### Panel 2: Latencia P95

**Query:**
```promql
histogram_quantile(0.95, 
  sum(rate(http_request_duration_seconds_bucket{job="devops-be"}[5m])) by (le, route)
)
```

**Configuración:**
- Title: "API Latency P95"
- Type: Graph
- Unit: seconds (s)
- Threshold: Warning at 0.5s, Critical at 1s

**Qué muestra:** El 95% de requests están por debajo de esta línea.

#### Panel 3: Error Rate

**Query:**
```promql
sum(rate(http_requests_total{job="devops-be", status_code=~"5.."}[1m])) /
sum(rate(http_requests_total{job="devops-be"}[1m]))
```

**Configuración:**
- Title: "Error Rate (5xx)"
- Type: Stat
- Unit: percent (0.0-1.0)
- Color: Green (<1%), Yellow (1-5%), Red (>5%)

**Qué muestra:** % de requests que retornan 5xx.

#### Panel 4: Cache Hit Rate

**Query:**
```promql
sum(rate(cache_hits_total[5m])) /
(sum(rate(cache_hits_total[5m])) + sum(rate(cache_misses_total[5m])))
```

**Configuración:**
- Title: "Redis Cache Hit Rate"
- Type: Gauge
- Min: 0, Max: 1
- Thresholds: Red (<70%), Yellow (70-85%), Green (>85%)

### Paso 4: Dashboard - Métricas de Contenedores

#### Panel 5: CPU Usage por Pod

**Query:**
```promql
sum(rate(container_cpu_usage_seconds_total{pod=~"devops-.*", container!=""}[5m])) by (pod) * 100
```

**Configuración:**
- Title: "CPU Usage by Pod"
- Type: Graph
- Unit: percent (0-100)
- Legend: `{{pod}}`

**Qué muestra:** % CPU usado por cada pod en tiempo real.

#### Panel 6: Memory Usage por Pod

**Query:**
```promql
sum(container_memory_usage_bytes{pod=~"devops-.*", container!=""}) by (pod) / 1024 / 1024
```

**Configuración:**
- Title: "Memory Usage by Pod"
- Type: Graph
- Unit: megabytes (MB)
- Legend: `{{pod}}`

**Qué muestra:** MB de memoria usada por cada pod.

#### Panel 7: Network I/O

**Query (TX):**
```promql
sum(rate(container_network_transmit_bytes_total{pod=~"devops-.*"}[1m])) by (pod) / 1024
```

**Query (RX):**
```promql
sum(rate(container_network_receive_bytes_total{pod=~"devops-.*"}[1m])) by (pod) / 1024
```

**Configuración:**
- Title: "Network I/O"
- Type: Graph
- Unit: kilobytes per second (KB/s)
- Series: TX (green), RX (blue)

### Paso 5: Generar Carga y Observar en Vivo

```bash
# Script de carga continua
while true; do
  curl -s http://localhost/api/todos > /dev/null
  sleep 0.5
done
```

**En Grafana:**

1. Set refresh: **5s** (arriba a la derecha)
2. Time range: **Last 5 minutes**
3. Observa en tiempo real:
   - Request rate sube
   - CPU aumenta
   - Latencia puede subir ligeramente
   - Memory se mantiene estable (gracias a cache)

### Paso 6: Agregar Alertas

1. Click en panel → **Edit**
2. Tab **Alert**
3. **Create alert rule**

**Ejemplo: Alert de CPU alto**

```yaml
Condition:
  WHEN: avg() OF query(A, 5m, now)
  IS ABOVE: 80

Alert:
  Name: High CPU Usage
  Message: Pod {{$labels.pod}} CPU > 80% for 5 minutes
  Severity: Warning
```

**Qué hace:**
- Evalúa cada 1 minuto
- Si CPU > 80% durante 5 minutos → FIRING
- Puede enviar a Slack, Email, PagerDuty, etc.

### Cómo Funciona Internamente

**Flujo completo:**

```
[Application] → [Prometheus Client] → [/metrics endpoint]
                                              ↓
                                    [Prometheus Scraper]
                                       (cada 15s)
                                              ↓
                                        [Prometheus TSDB]
                                              ↓
[Grafana] ← [PromQL Query] ← [Prometheus Query API]
```

**cAdvisor recolectando métricas:**

```
[Kubernetes Node]
   │
   ├─ [Container 1] ← cAdvisor lee /sys/fs/cgroup
   │    └─ CPU: 45%
   │    └─ Memory: 128MB
   │
   ├─ [Container 2]
   │    └─ CPU: 12%
   │    └─ Memory: 256MB
   │
   └─ [cAdvisor DaemonSet]
        └─ Expone /metrics:8080 ← Prometheus scrape
```

**DaemonSet de cAdvisor:**

```yaml
apiVersion: apps/v1
kind: DaemonSet  # ← 1 pod por nodo
metadata:
  name: cadvisor
spec:
  template:
    spec:
      containers:
      - name: cadvisor
        image: gcr.io/cadvisor/cadvisor:v0.47.0
        volumeMounts:
        - name: rootfs
          mountPath: /rootfs          # ← Lee filesystem
          readOnly: true
        - name: var-run
          mountPath: /var/run         # ← Docker socket
        - name: sys
          mountPath: /sys             # ← cgroups
          readOnly: true
        - name: docker
          mountPath: /var/lib/docker  # ← Container runtime
          readOnly: true
```

**Prometheus scrape config:**

```yaml
scrape_configs:
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
    
  - job_name: 'devops-be'
    static_configs:
      - targets: ['devops-be:8080']
```

---

## ☸️ Demo 5: Orquestación Kubernetes

### Objetivo
Demostrar deployment, load balancing, scaling y rolling updates.

### Paso 1: Ver Arquitectura Actual

```bash
# Ver todos los pods
kubectl get pods -o wide

# Ver deployments
kubectl get deployments

# Ver services
kubectl get svc

# Ver configmaps
kubectl get configmaps
```

**Output deployment:**
```
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
devops-be      2/2     2            2           30m
devops-fe      3/3     3            3           30m
devops-db      1/1     1            1           30m
devops-redis   1/1     1            1           30m
nginx-lb       1/1     1            1           30m
prometheus     1/1     1            1           30m
grafana        1/1     1            1           30m
jaeger         1/1     1            1           30m
```

### Paso 2: Explorar un Deployment

```bash
kubectl describe deployment devops-be
```

**Información clave:**

```yaml
Replicas:               2 desired | 2 updated | 2 total | 2 available
StrategyType:           RollingUpdate
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  app=devops-be
  Containers:
   devops-be:
    Image:      ramirezcgn/tp-devops-be:latest
    Port:       8080/TCP
    Limits:
      cpu:     500m
      memory:  512Mi
    Requests:
      cpu:        200m
      memory:     256Mi
    Liveness:     http-get http://:8080/health delay=30s
    Readiness:    http-get http://:8080/health delay=10s
```

### Paso 3: Ver Load Balancing en Acción

**Servicio Kubernetes:**

```bash
kubectl get svc devops-be -o yaml
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: devops-be
spec:
  selector:
    app: devops-be  # ← Matchea todos los pods con este label
  ports:
  - port: 8080
    targetPort: 8080
  type: ClusterIP  # ← Load balancing interno
```

**Nginx upstream:**

```nginx
upstream backend {
    least_conn;  # Least connections algorithm
    server devops-be:8080;  # ← Resuelve a todos los pods (round-robin)
}
```

**Test de load balancing:**

```bash
# Hacer múltiples requests y ver qué pod responde
for i in {1..10}; do
  curl -s http://localhost/api/health | jq -r '.hostname'
done
```

**Output esperado (alterna entre pods):**
```
devops-be-595b7cbcff-858gz
devops-be-595b7cbcff-l6npp
devops-be-595b7cbcff-858gz
devops-be-595b7cbcff-l6npp
...
```

### Paso 4: Scaling Manual

#### Scale UP

```bash
# Aumentar a 4 réplicas
kubectl scale deployment devops-be --replicas=4

# Ver el progreso
kubectl get pods -l app=devops-be -w
```

**Observas:**
```
NAME                         READY   STATUS              RESTARTS   AGE
devops-be-595b7cbcff-858gz   1/1     Running             0          1h
devops-be-595b7cbcff-l6npp   1/1     Running             0          1h
devops-be-595b7cbcff-xxxxx   0/1     ContainerCreating   0          5s  ← Nuevo
devops-be-595b7cbcff-yyyyy   0/1     ContainerCreating   0          5s  ← Nuevo
```

**Espera ~30s hasta que estén 1/1 Running.**

#### Scale DOWN

```bash
# Volver a 2 réplicas
kubectl scale deployment devops-be --replicas=2

# Ver qué pods se terminan
kubectl get pods -l app=devops-be -w
```

**Kubernetes elige los pods más nuevos para terminar (FIFO).**

### Paso 5: Rolling Update (Zero Downtime Deployment)

#### Simular actualización de imagen

```bash
# Actualizar imagen (simular nuevo deploy)
kubectl set image deployment/devops-be devops-be=ramirezcgn/tp-devops-be:v2

# Observar el rollout
kubectl rollout status deployment/devops-be

# Ver historial
kubectl rollout history deployment/devops-be
```

**Qué sucede internamente:**

1. **Crear nuevo pod** con imagen v2
2. **Esperar readinessProbe OK** (~10s)
3. **Agregar nuevo pod al Service** (empieza a recibir tráfico)
4. **Terminar 1 pod viejo**
5. **Repetir** hasta reemplazar todos

**Configuración de estrategia:**

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # ← Puede crear 1 pod extra temporalmente
    maxUnavailable: 0  # ← Siempre debe haber pods disponibles
```

**Ventaja:** Zero downtime - siempre hay pods respondiendo requests.

#### Rollback si algo sale mal

```bash
# Volver a versión anterior
kubectl rollout undo deployment/devops-be

# Ver status
kubectl rollout status deployment/devops-be
```

### Paso 6: ConfigMaps - Configuración Externa

```bash
# Ver ConfigMap de nginx
kubectl get configmap nginx-config -o yaml
```

**Uso:**

```yaml
volumes:
- name: nginx-config
  configMap:
    name: nginx-config  # ← Lee del ConfigMap

volumeMounts:
- name: nginx-config
  mountPath: /etc/nginx/nginx.conf
  subPath: nginx.conf  # ← Monta solo este archivo
```

**Modificar configuración sin rebuild:**

```bash
# Editar ConfigMap
kubectl edit configmap nginx-config

# Restart para aplicar cambios
kubectl rollout restart deployment nginx-lb
```

### Paso 7: Persistent Storage (Database)

```bash
# Ver PVC
kubectl get pvc

# Describe
kubectl describe pvc devops-db-pvc
```

**Output:**
```
Name:          devops-db-pvc
Namespace:     default
StorageClass:  hostpath
Status:        Bound
Volume:        pvc-xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Capacity:      1Gi
Access Modes:  RWO (ReadWriteOnce)
```

**Montaje en pod:**

```yaml
volumeMounts:
- name: db-storage
  mountPath: /var/lib/postgresql/data  # ← Persiste aquí

volumes:
- name: db-storage
  persistentVolumeClaim:
    claimName: devops-db-pvc  # ← Usa el PVC
```

**Test de persistencia:**

```bash
# Crear un TODO
curl -X POST http://localhost/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test persistence","description":"This should survive pod restart"}'

# Eliminar pod de DB (fuerza recreación)
kubectl delete pod -l app=devops-db

# Esperar a que vuelva
kubectl wait --for=condition=ready pod -l app=devops-db --timeout=60s

# Verificar que el TODO sigue existiendo
curl http://localhost/api/todos | jq
```

**Resultado:** ✅ TODO sigue ahí (gracias a PVC).

---

## 🛡️ Demo 6: Alta Disponibilidad (HA)

### Objetivo
Demostrar que el sistema se recupera automáticamente ante fallos.

### Escenario: Saturación de Memoria

#### Paso 1: Verificar Configuración HA

```bash
# Ver configuración de recursos del backend
kubectl get deployment devops-be -o yaml | grep -A 10 resources:
```

**Output:**
```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi  # ← Límite máximo
  requests:
    cpu: 200m
    memory: 256Mi  # ← Reserva garantizada
```

**Health checks:**

```bash
kubectl get deployment devops-be -o yaml | grep -A 15 livenessProbe:
```

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10      # ← Check cada 10s
  failureThreshold: 3    # ← 3 fallos = restart

readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5       # ← Check cada 5s
  failureThreshold: 2    # ← 2 fallos = quitar de LB
```

#### Paso 2: Ver Estado Inicial

```bash
kubectl get pods -l app=devops-be
```

**Output:**
```
NAME                         READY   STATUS    RESTARTS   AGE
devops-be-595b7cbcff-858gz   1/1     Running   0          2h
devops-be-595b7cbcff-l6npp   1/1     Running   0          2h
```

**Ambos pods con 0 restarts.**

#### Paso 3: Abrir Monitoreo en Tiempo Real

**Terminal 1: Watch pods**
```bash
kubectl get pods -l app=devops-be -w
```

**Terminal 2: Watch logs**
```bash
kubectl logs -f -l app=devops-be
```

**Terminal 3: Grafana**
- Abrir dashboard con memoria de pods
- Set refresh: 5s

#### Paso 4: Ejecutar Stress Test

**Terminal 4: Trigger stress**

```bash
curl -X POST "http://localhost/api/stress/memory?sizeMB=600&duration=60000"
```

**Parámetros:**
- `sizeMB=600` - Aloca 600MB (excede límite de 512Mi)
- `duration=60000` - Mantiene memoria por 60 segundos

**Qué sucede en el código:**

```typescript
// stressController.ts
static async memoryStress(req, res) {
  const sizeMB = parseInt(req.query.sizeMB as string) || 100;
  const arrays: number[][] = [];
  
  // Allocar memoria en chunks de 1MB
  for (let i = 0; i < sizeMB; i++) {
    const chunk = new Array(1024 * 1024 / 8).fill(0).map(() => Math.random());
    arrays.push(chunk);  // ← Acumula en memoria
  }
  
  // Mantener memoria por 'duration' ms
  await new Promise((resolve) => setTimeout(resolve, duration));
  
  res.json({ success: true, allocatedMB: sizeMB });
  arrays.length = 0;  // ← Liberar (pero nunca llega aquí si OOMKilled)
}
```

#### Paso 5: Observar el Comportamiento

**En Terminal 1 (watch pods):**

```
# Antes
devops-be-595b7cbcff-858gz   1/1     Running   0          2h
devops-be-595b7cbcff-l6npp   1/1     Running   0          2h

# Durante stress (~15-30s después)
devops-be-595b7cbcff-858gz   1/1     Running   0          2h   ← Consumiendo memoria
devops-be-595b7cbcff-l6npp   1/1     Running   0          2h   ← Normal

# Pod crashea (OOMKilled)
devops-be-595b7cbcff-858gz   0/1     Error     0          2h   ← ¡Muerto!
devops-be-595b7cbcff-l6npp   1/1     Running   0          2h   ← Sigue vivo

# Kubernetes reinicia automáticamente
devops-be-595b7cbcff-858gz   0/1     ContainerCreating   1          2h
devops-be-595b7cbcff-l6npp   1/1     Running             0          2h

# Pod recuperado (~30s después)
devops-be-595b7cbcff-858gz   1/1     Running   1 (45s ago)   2h   ← ¡Reiniciado!
devops-be-595b7cbcff-l6npp   1/1     Running   0             2h
```

**En Terminal 2 (logs):**

```json
# Pod 858gz antes de morir
{"level":"info","msg":"Starting memory stress test","sizeMB":600,"duration":60000}
{"level":"info","msg":"Memory allocated","heapUsedMB":612}
# ← Silencio (proceso killed)

# Pod l6npp (continúa normal)
{"level":"info","method":"GET","url":"/api/todos","statusCode":200,"duration":"12ms"}
{"level":"info","method":"GET","url":"/api/todos","statusCode":200,"duration":"8ms"}
```

**En Terminal 4 (curl):**

```html
<html>
<head><title>502 Bad Gateway</title></head>
<body>
<center><h1>502 Bad Gateway</h1></center>
<hr><center>nginx/1.29.3</center>
</body>
</html>
```

**502 Bad Gateway = pod murió antes de responder.**

#### Paso 6: Verificar Recuperación

```bash
# Ver detalles del pod reiniciado
kubectl describe pod devops-be-595b7cbcff-858gz | grep -A 10 "Last State"
```

**Output:**
```
Last State:     Terminated
  Reason:       Error
  Exit Code:    139  # ← Segmentation fault (memory pressure)
  Started:      Sun, 30 Nov 2025 18:20:00 -0300
  Finished:     Sun, 30 Nov 2025 18:23:42 -0300

State:          Running
  Started:      Sun, 30 Nov 2025 18:24:15 -0300
Ready:          True
Restart Count:  1  # ← Incrementado
```

**Exit Code 139:**
- Signal 11 (SIGSEGV) + 128 = 139
- Indica segmentation fault típico de OOM

#### Paso 7: Verificar Continuidad del Servicio

**Durante el incidente, la segunda réplica mantuvo el servicio:**

```bash
# Hacer requests mientras un pod está caído
for i in {1..20}; do
  curl -s http://localhost/api/health | jq -r '.hostname'
  sleep 0.5
done
```

**Output:**
```
devops-be-595b7cbcff-l6npp  ← Solo este responde
devops-be-595b7cbcff-l6npp
devops-be-595b7cbcff-l6npp
devops-be-595b7cbcff-858gz  ← Vuelve después de recuperarse
devops-be-595b7cbcff-l6npp
devops-be-595b7cbcff-858gz  ← Load balancing restaurado
```

#### Paso 8: Ver Métricas en Grafana

**Panel de Memory Usage:**

```
600MB ┤     ╭─╮           ← Spike de pod 858gz
      │     │ │╰──────────  ← Crash y reinicio (memory = 0)
      │     │ 
300MB ┤─────╯ 
      │  Pod 858gz
      │
200MB ┤──────────────────  ← Pod l6npp (estable)
      │  Pod l6npp
      │
  0MB ┴─────────────────────────▶
      0    30s   60s   90s  time
```

**Panel de Restart Count:**

```
Metric: kube_pod_container_status_restarts_total{pod=~"devops-be.*"}

devops-be-595b7cbcff-858gz: 1  ← Incrementó
devops-be-595b7cbcff-l6npp: 0  ← Sin cambios
```

**Panel de Request Distribution:**

Durante el incidente:
```
100% │ ╭─────────────────  ← l6npp recibe 100% del tráfico
     │ │
 50% ┤─╯                   ← 858gz muere, tráfico redirigido
     │
  0% ┴────────────────────▶
         Incident
```

Después de recuperación:
```
100% │
     │ ╭─╮ ╭─╮ ╭─╮ ╭─╮     ← Alternancia restaurada
 50% ┤─╯ ╰─╯ ╰─╯ ╰─╯ ╰──
     │
  0% ┴────────────────────▶
         Normal
```

### Cómo Funciona Internamente

**Kubernetes Monitoring Loop:**

```
[Kubelet] ← Agente en cada nodo
   │
   ├─ [Liveness Probe]
   │    └─ HTTP GET http://pod-ip:8080/health cada 10s
   │    └─ 3 fallos consecutivos → RESTART pod
   │
   ├─ [Readiness Probe]
   │    └─ HTTP GET http://pod-ip:8080/health cada 5s
   │    └─ 2 fallos consecutivos → QUITAR de endpoints
   │
   └─ [Resource Monitoring]
        └─ cgroups: memory.limit_in_bytes = 512Mi
        └─ Si proceso excede → OOM Killer → Exit 137/139
```

**OOM Killer:**

```
[Proceso Node.js]
   │ Aloca 600MB
   ▼
[Kernel cgroups]
   │ memory.usage_in_bytes: 600MB
   │ memory.limit_in_bytes: 512MB (536870912 bytes)
   │ 600MB > 512MB → VIOLACIÓN
   ▼
[OOM Killer]
   │ Selecciona proceso con mayor OOM score
   │ Envía SIGKILL
   ▼
[Proceso termina]
   │ Exit code: 137 (SIGKILL) o 139 (SIGSEGV)
   ▼
[Kubelet detecta]
   │ Container exited
   │ RestartPolicy: Always
   ▼
[Kubernetes reinicia]
   │ Pull image (si no está en cache)
   │ Create container
   │ Start container
   │ Wait for readiness
   ▼
[Pod Running]
   │ RestartCount++
   │ Rejoin Service endpoints
```

**Service Endpoint Management:**

```
[Kubernetes Service Controller]
   │
   ├─ [Endpoint Watcher]
   │    └─ Observa pods con label selector
   │    └─ Solo incluye pods con readiness=true
   │
   ├─ [Endpoints List]
   │    Before crash: [858gz:8080, l6npp:8080]
   │    During crash: [l6npp:8080]  ← 858gz removed
   │    After recovery: [858gz:8080, l6npp:8080]  ← Restored
   │
   └─ [iptables rules]
        └─ Actualiza reglas de load balancing
        └─ Traffic solo a endpoints "Ready"
```

**iptables rules (simplificado):**

```bash
# Durante crash (solo 1 endpoint)
-A KUBE-SVC-XXXXX -m statistic --mode random --probability 1.0 \
  -j KUBE-SEP-l6npp  # ← 100% a l6npp

# Después de recovery (2 endpoints)
-A KUBE-SVC-XXXXX -m statistic --mode random --probability 0.5 \
  -j KUBE-SEP-858gz  # ← 50% a 858gz

-A KUBE-SVC-XXXXX \
  -j KUBE-SEP-l6npp  # ← 50% a l6npp (fallback)
```

### Conclusión HA Demo

**✅ Comportamiento observado:**

1. **Detección rápida:** Pod crash detectado inmediatamente
2. **Isolation:** Solo 1 pod afectado, otro sigue operativo
3. **Traffic shift:** Kubernetes redirige 100% tráfico a pod sano
4. **Auto-recovery:** Pod reiniciado automáticamente en ~30-60s
5. **Restoration:** Load balancing restaurado después de readiness OK

**❌ Sin HA (1 réplica):**
- Pod crash = servicio down
- Downtime de 30-60s durante reinicio
- Users ven errores

**✅ Con HA (2+ réplicas):**
- Pod crash = continuidad de servicio
- Zero user-facing downtime
- Degraded capacity momentánea (50% en lugar de 100%)

**Métricas de éxito:**

- **MTTR (Mean Time To Recovery):** ~60s (tiempo desde crash hasta pod ready)
- **Availability durante incidente:** 50% capacity maintained (1 de 2 pods)
- **User impact:** Latency spike momentáneo (~2-3s), luego normal
- **Data loss:** 0 (requests en-flight a pod muerto retornan error, pero pueden reintentar)

---

## 🔧 Troubleshooting

### Problema: Pods en CrashLoopBackOff

```bash
kubectl get pods
```

```
NAME                         READY   STATUS             RESTARTS   AGE
devops-be-xxxxx-xxxxx        0/1     CrashLoopBackOff   5          3m
```

**Diagnóstico:**

```bash
# Ver logs
kubectl logs devops-be-xxxxx-xxxxx

# Ver eventos
kubectl describe pod devops-be-xxxxx-xxxxx | grep -A 20 Events:
```

**Posibles causas:**

1. **Error de aplicación al iniciar**
   - Check logs para stack trace
   - Verificar variables de entorno

2. **Health check fallando**
   - Aumentar `initialDelaySeconds`
   - Verificar que `/health` responde

3. **Dependencies no disponibles**
   - Verificar DB está corriendo: `kubectl get pods -l app=devops-db`

### Problema: Port Forward No Funciona

```bash
# Error: unable to forward port because pod is not running
```

**Solución:**

```bash
# Kill todos los port forwards
pkill -f "kubectl port-forward"

# Verificar pods están ready
kubectl get pods

# Reiniciar port forwards
./start-port-forwards.sh
```

### Problema: Servicio 502 Bad Gateway

**Diagnóstico:**

```bash
# Check backend pods
kubectl get pods -l app=devops-be

# Check nginx logs
kubectl logs -l app=nginx-lb

# Test directo al backend (bypass nginx)
kubectl port-forward svc/devops-be 8080:8080
curl http://localhost:8080/health
```

**Posibles causas:**

1. **Backend pods no ready**
   - Esperar a que readiness probe pase

2. **Service mal configurado**
   - Verificar selector: `kubectl get svc devops-be -o yaml`

3. **Nginx upstream mal configurado**
   - Check ConfigMap: `kubectl get cm nginx-config -o yaml`

### Problema: Métricas No Aparecen en Grafana

**Diagnóstico:**

```bash
# Check Prometheus está scraping
# Abrir http://localhost:9090/targets

# Debe mostrar:
# devops-be (2 endpoints) - UP
# devops-fe (3 endpoints) - UP
# cadvisor (1 endpoint) - UP
```

**Si target está DOWN:**

```bash
# Verificar pod expone /metrics
kubectl port-forward svc/devops-be 8080:8080
curl http://localhost:8080/metrics

# Debe retornar métricas en formato Prometheus:
# http_requests_total{method="GET",route="/api/todos",status_code="200"} 42
```

### Problema: Trazas No Aparecen en Jaeger

**Diagnóstico:**

```bash
# Check Jaeger collector
kubectl logs -l app=jaeger | grep -i error

# Check que frontend envía trazas
# Abrir DevTools → Network → filtrar "v1/traces"
# Debe ver POST requests a http://localhost/v1/traces
```

**Test manual:**

```bash
# Enviar traza de prueba
curl -X POST http://localhost/v1/traces \
  -H "Content-Type: application/json" \
  -d '{
    "resourceSpans": [{
      "resource": {
        "attributes": [{"key":"service.name","value":{"stringValue":"test"}}]
      },
      "scopeSpans": [{
        "spans": [{
          "traceId":"5b8aa5a2d2c872e8321cf37308d69df2",
          "spanId":"051581bf3cb55c13",
          "name":"test-span",
          "kind":1,
          "startTimeUnixNano":"1234567890000000000",
          "endTimeUnixNano":"1234567891000000000"
        }]
      }]
    }]
  }'
```

**Si retorna 200 OK → Jaeger funciona.**

**Si frontend no envía:**
- Check console: `console.log('✅ OpenTelemetry initialized')`
- Ver errores en DevTools Console

---

## 📚 Resumen de Comandos Clave

### Deployment
```bash
# Deploy completo
kubectl apply -f kubernetes/deploy-all.yaml

# Restart deployment
kubectl rollout restart deployment/<name>

# Ver status de rollout
kubectl rollout status deployment/<name>

# Rollback
kubectl rollout undo deployment/<name>
```

### Monitoring
```bash
# Ver pods
kubectl get pods
kubectl get pods -w  # Watch mode

# Ver logs
kubectl logs <pod-name>
kubectl logs -f <pod-name>  # Follow
kubectl logs -l app=devops-be  # All pods with label

# Ver métricas
kubectl top pods
kubectl top nodes
```

### Debugging
```bash
# Describe (eventos + configuración)
kubectl describe pod <pod-name>
kubectl describe deployment <name>

# Exec en pod
kubectl exec -it <pod-name> -- /bin/sh

# Port forward
kubectl port-forward svc/<service-name> <local-port>:<remote-port>
```

### Cleanup
```bash
# Eliminar todo
kubectl delete -f kubernetes/deploy-all.yaml

# Eliminar específico
kubectl delete deployment <name>
kubectl delete pod <name>
```

---

**FIN DE LA GUÍA**

Con esta guía deberías poder demostrar completamente:

✅ OpenTelemetry (logs + métricas + trazas)  
✅ Grafana dashboards completos  
✅ Orquestación Kubernetes  
✅ Alta disponibilidad con recuperación automática  

**¡Buena suerte con la presentación!** 🚀
