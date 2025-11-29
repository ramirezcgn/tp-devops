# OpenTelemetry - Observabilidad y Trazabilidad

Este proyecto implementa OpenTelemetry para proporcionar observabilidad completa de la aplicación, incluyendo logs estructurados, trazas distribuidas y métricas.

## 🎯 Características Implementadas

### 1. **Logs Estructurados**
- Todos los logs están en formato JSON estructurado
- Cada log incluye contexto de traza (traceId, spanId)
- Logs de todas las requests HTTP con duración y código de estado
- Logs específicos de operaciones (cache hits/misses, DB queries, etc.)

### 2. **Trazas Distribuidas**
- Propagación automática de contexto entre servicios
- Instrumentación automática de:
  - HTTP requests (entrada y salida)
  - PostgreSQL queries
  - Redis operations
  - Express middleware

### 3. **Trazabilidad Completa**
Se puede seguir el recorrido completo de cada operación:

```
Usuario crea tarea:
  └─ Frontend: POST /api/todos
      └─ Backend: POST /api/todos (Express)
          └─ TodoService.create
              ├─ Redis: check cache
              ├─ ToDoRepository.create
              │   └─ PostgreSQL: INSERT query
              └─ Redis: invalidate cache (todos:all:*)
```

## 🚀 Cómo Usar

### Iniciar el Stack Completo

```bash
# Levantar todos los servicios incluyendo Jaeger
docker-compose up -d

# Ver logs del backend
docker-compose logs -f devops-be
```

### Acceder a las Interfaces

- **Aplicación Frontend**: http://localhost:80
- **Backend API**: http://localhost:8080
- **Jaeger UI**: http://localhost:16686
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Visualizar Trazas en Jaeger

1. Abrir http://localhost:16686
2. En "Service", seleccionar `devops-be`
3. Click en "Find Traces"
4. Seleccionar cualquier traza para ver el detalle completo

## 📊 Ejemplos de Trazas

### Ejemplo 1: Crear una Tarea

```
POST /api/todos
├─ [45ms] HTTP POST /api/todos
│   ├─ [2ms] TodoController.create
│   │   └─ [40ms] TodoService.create
│   │       ├─ [15ms] ToDoRepository.create
│   │       │   └─ [12ms] PostgreSQL INSERT
│   │       └─ [8ms] Redis: invalidate cache
│   │           ├─ [3ms] Redis.keys (todos:all:*)
│   │           └─ [2ms] Redis.del (2 keys)
│   └─ [1ms] Response serialization
└─ Status: 201 Created
```

### Ejemplo 2: Obtener una Tarea (Cache Hit)

```
GET /api/todos/123
├─ [8ms] HTTP GET /api/todos/123
│   ├─ [1ms] TodoController.get
│   │   └─ [5ms] TodoService.get
│   │       └─ [3ms] Redis.get (todo:123)
│   │           └─ cache.hit: true
│   └─ [1ms] Response serialization
└─ Status: 200 OK
```

### Ejemplo 3: Obtener una Tarea (Cache Miss)

```
GET /api/todos/456
├─ [35ms] HTTP GET /api/todos/456
│   ├─ [1ms] TodoController.get
│   │   └─ [30ms] TodoService.get
│   │       ├─ [3ms] Redis.get (todo:456)
│   │       │   └─ cache.hit: false
│   │       ├─ [20ms] ToDoRepository.get
│   │       │   └─ [18ms] PostgreSQL SELECT
│   │       └─ [5ms] Redis.set (todo:456, TTL: 300s)
│   └─ [1ms] Response serialization
└─ Status: 200 OK
```

## 🔍 Estructura de Logs

### Log de Request HTTP

```json
{
  "level": "info",
  "time": "2025-10-22T19:00:00.000Z",
  "msg": "Incoming request",
  "method": "POST",
  "url": "/api/todos",
  "path": "/api/todos",
  "query": {},
  "headers": {
    "user-agent": "Mozilla/5.0...",
    "content-type": "application/json"
  },
  "traceId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "spanId": "q1r2s3t4u5v6w7x8",
  "service": "devops-be",
  "environment": "development"
}
```

### Log de Response HTTP

```json
{
  "level": "info",
  "time": "2025-10-22T19:00:00.045Z",
  "msg": "Request completed",
  "method": "POST",
  "url": "/api/todos",
  "path": "/api/todos",
  "statusCode": 201,
  "duration": "45ms",
  "traceId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "spanId": "q1r2s3t4u5v6w7x8",
  "service": "devops-be",
  "environment": "development"
}
```

### Log de Operación de Servicio

```json
{
  "level": "info",
  "time": "2025-10-22T19:00:00.020Z",
  "msg": "Creating new todo",
  "title": "Nueva tarea de prueba",
  "traceId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "spanId": "y1z2a3b4c5d6e7f8",
  "service": "devops-be",
  "environment": "development"
}
```

### Log de Cache Operation

```json
{
  "level": "info",
  "time": "2025-10-22T19:00:00.015Z",
  "msg": "Cache miss",
  "cacheKey": "todo:123",
  "traceId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "spanId": "g1h2i3j4k5l6m7n8",
  "service": "devops-be",
  "environment": "development"
}
```

## 🛠️ Configuración

### Variables de Entorno

```bash
# OpenTelemetry
JAEGER_OTLP_ENDPOINT=http://localhost:4318/v1/traces  # Endpoint OTLP de Jaeger
LOG_LEVEL=info                                         # Nivel de logs (debug, info, warn, error)
NODE_ENV=development                                   # Ambiente (development, production)

# Aplicación
PORT=8080
DB_HOST=localhost
DB_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Migración a OTLP

⚠️ **Importante**: Este proyecto migró de JaegerExporter (deprecado) a OTLP HTTP:

- **Antes**: `JaegerExporter` → puerto 14268
- **Después**: `OTLPTraceExporter` → puerto 4318
- **Razón**: OTLP es el protocolo estándar de OpenTelemetry, soportado nativamente por Jaeger 1.35+
- **Ventajas**: Mayor compatibilidad, mejor soporte a futuro, protocolo estandarizado

**Paquetes actualizados**:
```json
{
  "@opentelemetry/sdk-node": "^0.55.0",
  "@opentelemetry/exporter-trace-otlp-http": "^0.55.0",
  "@opentelemetry/resources": "^1.28.0"
}
```

### Configuración de Telemetry

El archivo `src/config/telemetry.ts` contiene la configuración principal:

- **Service Name**: `devops-be`
- **Exporter**: OTLP HTTP (OpenTelemetry Protocol)
- **Endpoint**: `http://jaeger-collector:4318/v1/traces` (Kubernetes) o `http://localhost:4318/v1/traces` (local)
- **Instrumentations**: HTTP, Express, PostgreSQL, Redis
- **Sampling**: 100% en desarrollo

**Ejemplo de configuración**:
```typescript
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const traceExporter = new OTLPTraceExporter({
  url: process.env.JAEGER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'
});

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'devops-be',
    [ATTR_SERVICE_VERSION]: '1.0.0'
  }),
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations(),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new PgInstrumentation(),
    new IORedisInstrumentation()
  ]
});
```

## 📈 Métricas Capturadas

### HTTP Metrics
- **http.method**: Método HTTP (GET, POST, etc.)
- **http.url**: URL completa
- **http.status_code**: Código de respuesta
- **http.response_time_ms**: Tiempo de respuesta en ms

### Database Metrics
- **db.system**: Sistema de BD (postgresql)
- **db.statement**: Query SQL ejecutado
- **db.operation**: Tipo de operación (SELECT, INSERT, etc.)

### Cache Metrics
- **redis.operation**: Operación de Redis (GET, SET, DEL, etc.)
- **redis.key**: Key de Redis
- **redis.hit**: Si fue cache hit o miss
- **redis.ttl**: TTL configurado (en segundos)

### Business Metrics
- **todo.id**: ID de la tarea
- **todo.title**: Título de la tarea
- **pagination.page**: Página solicitada
- **pagination.limit**: Límite de resultados

## 🎓 Ventajas de esta Implementación

### Para Desarrollo
- ✅ **Debug más fácil**: Ver el flujo completo de cada request
- ✅ **Identificar bottlenecks**: Ver qué operaciones son lentas
- ✅ **Entender el sistema**: Visualizar las dependencias entre servicios

### Para Producción
- ✅ **Troubleshooting**: Encontrar la causa raíz de errores
- ✅ **Performance monitoring**: Detectar degradación de rendimiento
- ✅ **SLA monitoring**: Verificar tiempos de respuesta
- ✅ **Capacity planning**: Entender patrones de uso

### Para el Equipo
- ✅ **Onboarding**: Nuevos miembros entienden el sistema visualmente
- ✅ **Documentación viva**: Las trazas documentan el comportamiento real
- ✅ **Colaboración**: Equipo completo puede ver y entender el sistema

## 🔧 Troubleshooting

### No veo trazas en Jaeger

1. Verificar que Jaeger esté corriendo:
```bash
docker-compose ps jaeger
```

2. Verificar que el backend pueda conectarse a Jaeger:
```bash
docker-compose logs devops-be | grep -i "opentelemetry\|jaeger"
```

3. Verificar la configuración del endpoint OTLP:
```bash
echo $JAEGER_OTLP_ENDPOINT  # Debe ser: http://jaeger-collector:4318/v1/traces
```

4. Verificar que Jaeger tenga el puerto OTLP habilitado:
```bash
# En Kubernetes
kubectl get svc jaeger-collector -o yaml | grep -A 5 "4318"

# En Docker Compose
docker-compose exec jaeger netstat -tlnp | grep 4318
```

### Los logs no están estructurados

Verificar que el middleware de logging esté registrado primero en `app.ts`:

```typescript
app.use(loggingMiddleware);  // DEBE estar antes que otros middlewares
```

### Las trazas no incluyen operaciones de BD/Redis

Verificar que las instrumentaciones estén habilitadas en `telemetry.ts` y que las librerías sean compatibles.

## 📚 Referencias

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [Pino Logger](https://getpino.io/)
- [OpenTelemetry Node.js](https://opentelemetry.io/docs/languages/js/)

## 🚀 Próximos Pasos

1. **Agregar métricas**: Implementar exportador de métricas de Prometheus
2. **Alertas**: Configurar alertas basadas en trazas y logs
3. **Dashboards**: Crear dashboards en Grafana para visualización
4. **Sampling**: Configurar sampling inteligente en producción
5. **Frontend tracing**: Agregar OpenTelemetry al frontend Next.js
