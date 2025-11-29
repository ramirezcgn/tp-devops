# Kubernetes Deployment

Este directorio contiene los manifiestos de Kubernetes para desplegar la aplicación completa con observabilidad (OpenTelemetry + Jaeger).

## 🚀 Despliegue Rápido

Usa el archivo `deploy-all.yaml` que contiene todos los manifiestos combinados:

```bash
kubectl apply -f kubernetes/deploy-all.yaml
```

## 📦 Componentes Incluidos

El despliegue incluye:

- **Jaeger** (tracing distribuido con OTLP en puerto 4318)
- **PostgreSQL** (base de datos)
- **Redis** (cache)
- **Backend** (API con OpenTelemetry)
- **Frontend** (Next.js con web tracing)
- **Prometheus** (métricas)
- **Grafana** (dashboards)
- **NGINX** (load balancer)

## 🔗 Acceso a los Servicios

Después del despliegue, accede a:

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| Aplicación | http://localhost:30080 | - |
| Jaeger UI | http://localhost:30686 | - |
| Grafana | http://localhost:30000 | admin/admin |
| Prometheus | Port-forward requerido | - |

## 🔍 Verificación

Verifica que todos los pods estén corriendo:

```bash
kubectl get pods
```

Ver logs con contexto de trazas:

```bash
kubectl logs -f deployment/devops-be
```

Ver trazas en Jaeger:

1. Abre http://localhost:30686
2. Selecciona `devops-be` en Service
3. Click en "Find Traces"

## 🔧 Troubleshooting

### Los pods no inician

```bash
# Ver estado detallado
kubectl describe pod <pod-name>

# Ver logs
kubectl logs <pod-name>
```

### Backend no conecta a Jaeger

Verifica que el endpoint OTLP esté correcto:

```bash
kubectl get pod <backend-pod> -o yaml | grep JAEGER_OTLP_ENDPOINT
# Debe mostrar: http://jaeger-collector:4318/v1/traces
```

### Actualizar imágenes

Si modificas el código y reconstruyes las imágenes:

```bash
# Backend
docker build -t ramirezcgn/tp-devops-be:latest tp-devops-be

# Frontend
docker build -t ramirezcgn/tp-devops-fe:latest tp-devops-fe

# Reiniciar deployments
kubectl rollout restart deployment/devops-be
kubectl rollout restart deployment/devops-fe
```

## 🧹 Limpieza

Para eliminar todo:

```bash
kubectl delete -f kubernetes/deploy-all.yaml
```

## 🔧 Despliegue Granular (Opcional)

Si necesitas desplegar o actualizar componentes individuales, también hay manifiestos separados:

```bash
# Desplegar solo un componente
kubectl apply -f kubernetes/devops-be.yaml

# Orden recomendado para despliegue completo:
kubectl apply -f kubernetes/jaeger.yaml
kubectl apply -f kubernetes/devops-db.yaml
kubectl apply -f kubernetes/devops-redis.yaml
kubectl apply -f kubernetes/devops-be.yaml
kubectl apply -f kubernetes/devops-fe.yaml
kubectl apply -f kubernetes/prometheus.yaml
kubectl apply -f kubernetes/grafana.yaml
kubectl apply -f kubernetes/nginx-lb.yaml
```

Esto es útil cuando solo necesitas actualizar un servicio específico.
