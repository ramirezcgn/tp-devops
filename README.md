# TP DevOps - Full Stack Application with Kubernetes

This project contains a full-stack application with backend, frontend, databases (PostgreSQL and Redis), monitoring (Prometheus and Grafana), and load balancing (NGINX).

## 🚀 Quick Start

### First Time Setup

**Create the k3d cluster:**
```bash
k3d cluster create devops \
  --agents 2 \
  --port "80:80@loadbalancer" \
  --port "8080:8080@loadbalancer" \
  --port "16686:16686@loadbalancer" \
  --port "9090:9090@loadbalancer" \
  --port "3001:3001@loadbalancer"
```

**Deploy the application:**
```bash
kubectl apply -f kubernetes/deploy-all.yaml
```

### After Reboot

**Start the cluster:**
```bash
k3d cluster start devops
```

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Daily workflow and troubleshooting
- **[OPENTELEMETRY.md](OPENTELEMETRY.md)** - Observability with OpenTelemetry and Jaeger
- **[README.md](README.md)** - Complete documentation (this file)

## Architecture

### Components

- **Backend (devops-be)**: Node.js/Express application - **2 replicas** with load balancing
- **Frontend (devops-fe)**: Next.js application - **3 replicas** with load balancing
- **Database**: PostgreSQL 16 - 1 replica with persistent storage
- **Cache**: Redis 7 - 1 replica with retry strategy
- **Monitoring**: Prometheus (port 9090) - Metrics collection
- **Dashboards**: Grafana (port 3000, user: admin, pass: admin) - Visualization
- **Load Balancer**: NGINX - External access and routing
- **Tracing**: Jaeger (port 16686) - Distributed tracing with OpenTelemetry

### Traffic Flow

```
External Access (Browser):
User → NGINX LoadBalancer (port 80) → Frontend Service → 3 Frontend Pods
                                    → Backend Service → 2 Backend Pods

Internal Communication (within cluster):
Frontend Pods → Backend Service → 2 Backend Pods (load balanced by Kubernetes)
Backend Pods → PostgreSQL Service → Database Pod
Backend Pods → Redis Service → Redis Pod
Prometheus → All services (metrics scraping)
```

### Load Balancing Strategy

**External Traffic (via NGINX):**
- NGINX receives all external requests on port 80
- Routes `/` to Frontend Service (3 pods)
- Routes `/api` to Backend Service (2 pods)
- Uses `least_conn` algorithm for distribution

**Internal Traffic (via Kubernetes Services):**
- Frontend → Backend: Uses ClusterIP Service (automatic k3s load balancing)
- Backend → Database/Redis: Direct Service connection (single replica)

**Pod Identification:**
- All requests include custom headers: `X-Pod-Name` and `X-Served-By`
- Allows tracking which replica handled each request

### High Availability Features

1. **Multiple Replicas**: Frontend (3) and Backend (2) for redundancy
2. **Health Checks**: Kubernetes monitors pod health
3. **Auto-restart**: Failed pods are automatically recreated
4. **Load Distribution**: Requests distributed across healthy pods
5. **Redis Retry Strategy**: Backend retries Redis connections with exponential backoff
6. **Database Connection Pool**: Automatic reconnection on failures

## Quick Start

### Managing the k3d Cluster

**Start the cluster:**
```bash
k3d cluster start devops
```

**Stop the cluster:**
```bash
k3d cluster stop devops
```

**Delete the cluster:**
```bash
k3d cluster delete devops
```

**Check cluster status:**
```bash
k3d cluster list
```

### Alternative: Docker Compose (Simple Option)

```sh
docker-compose up --build
# or
npm run docker:up
```

## Kubernetes Deployment

### Prerequisites

1. **Docker** installed and running
2. **k3d** installed (`brew install k3d` or download from https://k3d.io)
3. **kubectl** command available

**Installation:**
```bash
# Windows (via Chocolatey)
choco install k3d

# macOS
brew install k3d

# Linux
wget -q -O - https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
```

### Deploy All Components

```sh
# Deploy everything at once (recommended)
kubectl apply -f kubernetes/deploy-all.yaml

# Or deploy individually (for granular control)
kubectl apply -f kubernetes/jaeger.yaml        # Deploy Jaeger first
kubectl apply -f kubernetes/devops-db.yaml
kubectl apply -f kubernetes/devops-redis.yaml
kubectl apply -f kubernetes/devops-be.yaml
kubectl apply -f kubernetes/devops-fe.yaml
kubectl apply -f kubernetes/prometheus.yaml
kubectl apply -f kubernetes/grafana.yaml
kubectl apply -f kubernetes/nginx-lb.yaml

# Wait for all pods to be ready
kubectl get pods --watch
```

### Access Services

All services are accessible directly on localhost via LoadBalancer:

- **Application (Frontend)**: http://localhost
- **Backend API**: http://localhost/api/todos
- **Jaeger UI**: http://localhost:16686 (Distributed tracing)
- **Grafana**: http://localhost:8080 (Dashboards - admin/admin)
- **Prometheus**: http://localhost:9090 (Metrics)

**Direct Access**: k3d automatically exposes LoadBalancer services to localhost. No port-forwarding needed!

### Testing Load Balancing

You can verify load balancing by checking the custom headers in responses:

```sh
# Test Frontend Load Balancing (3 replicas)
for i in {1..5}; do curl -I http://localhost | grep -i x-pod-name; done

# Test Backend Load Balancing (2 replicas)
for i in {1..5}; do curl -I http://localhost/api/todos | grep -i x-pod-name; done

# Expected output: Different pod names across requests
# Frontend: devops-fe-<hash>-<id>
# Backend: devops-be-<hash>-<id>
```

### Available NPM Scripts

```sh
# Kubernetes commands
npm run k3s:status         # View pods and services status
npm run k3s:logs:be        # View backend logs
npm run k3s:logs:fe        # View frontend logs
npm run k3s:logs:grafana   # View Grafana logs

# Docker Compose commands
npm run docker:up          # Start with docker-compose
npm run docker:down        # Stop docker-compose

# Development commands
npm install                # Install all dependencies (BE + FE)
npm test                   # Run all tests (BE + FE)
npm run install-be         # Install backend dependencies
npm run install-fe         # Install frontend dependencies
npm run test:be            # Run backend tests
npm run test:fe            # Run frontend tests
```

```sh
# k3d cluster management
k3d cluster start devops           # Start cluster
k3d cluster stop devops            # Stop cluster
k3d cluster delete devops          # Delete cluster
k3d cluster list                   # List clusters

# View all services and their endpoints
kubectl get svc,endpoints

# View all pods with details
kubectl get pods -o wide

# View logs
kubectl logs -f deployment/devops-be
kubectl logs -f deployment/devops-fe
kubectl logs -f deployment/prometheus
kubectl logs -f deployment/grafana

# Check which pods are behind a service
kubectl get endpoints devops-be
kubectl get endpoints devops-fe

# Scale applications
kubectl scale deployment devops-be --replicas=3
kubectl scale deployment devops-fe --replicas=5

# Restart deployments (useful after updating images)
kubectl rollout restart deployment/devops-be
kubectl rollout restart deployment/devops-fe

# View resource usage
kubectl top nodes
kubectl top pods

# Execute commands inside a pod
kubectl exec -it deployment/devops-be -- sh
kubectl exec -it deployment/devops-fe -- sh

# Delete all resources
kubectl delete -f kubernetes/deploy-all.yaml
```

## Project Structure

```
tp-devops/
├── tp-devops-be/          # Backend application (Node.js/Express)
│   └── src/
│       ├── app.ts         # Express app with custom headers middleware
│       ├── config/
│       │   └── redis.ts   # Redis config with retry strategy
│       └── ...
├── tp-devops-fe/          # Frontend application (Next.js)
│   └── src/
│       ├── middleware.ts  # Custom headers for pod identification
│       ├── services/
│       │   └── todoService.ts  # Backend API calls
│       └── ...
├── kubernetes/            # Kubernetes manifests
│   ├── deploy-all.yaml   # Complete deployment (all-in-one)
│   ├── devops-db.yaml    # PostgreSQL database + PVC
│   ├── devops-redis.yaml # Redis cache
│   ├── devops-be.yaml    # Backend service (2 replicas)
│   ├── devops-fe.yaml    # Frontend service (3 replicas)
│   ├── prometheus.yaml   # Monitoring + ConfigMap
│   ├── grafana.yaml      # Dashboards + DataSource config
│   └── nginx-lb.yaml     # Load balancer + routing config
└── docker-compose.yml    # Docker Compose configuration
```

## Technical Details

### Kubernetes Services Explained

**ClusterIP Services** (default):
- `devops-be`, `devops-fe`, `devops-db`, `devops-redis`, `prometheus`
- Only accessible within the cluster
- Kubernetes automatically load balances between pod replicas
- Uses kube-proxy with iptables/ipvs for distribution

**LoadBalancer Services**:
- `nginx-lb`, `grafana`
- Accessible from outside the cluster
- Docker Desktop assigns an external IP (172.19.0.x)
- Maps to host localhost for easy access

### Load Balancing Comparison

| Method | Use Case | Algorithm | Health Checks |
|--------|----------|-----------|---------------|
| **Kubernetes Service** | Internal traffic | Round-robin (kube-proxy) | Readiness probes |
| **NGINX** | External traffic | least_conn | HTTP health checks |

**Why Both?**
- NGINX: Entry point for external users, advanced routing, caching, SSL termination
- k3s Service: Efficient internal communication, automatic service discovery

### Custom Headers for Debugging

Both frontend and backend add these headers to every response:
- `X-Pod-Name`: Kubernetes pod hostname (e.g., `devops-fe-86449976d4-f75p5`)
- `X-Served-By`: Formatted pod identifier (e.g., `pod-devops-fe-86449976d4-f75p5`)

This allows you to:
- Verify load balancing is working
- Debug issues with specific pods
- Monitor traffic distribution

### Redis Retry Strategy

The backend implements a robust Redis connection strategy:
```typescript
retryStrategy: (times) => {
  const delay = Math.min(times * 50, 2000);
  return delay;  // Max 2 seconds between retries
}
```
- Prevents backend from crashing if Redis is unavailable
- Exponential backoff with cap
- Event handlers for connection monitoring

## Deployment Workflow

1. **Build Docker Images**:
   ```sh
   docker build -t ramirezcgn/tp-devops-fe:latest ./tp-devops-fe
   docker build -t ramirezcgn/tp-devops-be:latest ./tp-devops-be
   ```

2. **Deploy to Kubernetes**:
   ```sh
   kubectl apply -f kubernetes/deploy-all.yaml
   ```

3. **Wait for Pods to be Ready**:
   ```sh
   kubectl get pods --watch
   ```

4. **Setup Port Forwarding** (if needed):
   ```sh
   kubectl port-forward svc/grafana 8080:3000
   ```

5. **Access Application**:
   - Open browser to http://localhost

## Troubleshooting

### Pods Not Starting
```sh
# Check pod status and events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Common issues:
# - ImagePullBackOff: Check image name/tag
# - CrashLoopBackOff: Check application logs
# - Pending: Check resource availability
```

### Load Balancer Not Working
```sh
# Verify service has endpoints
kubectl get endpoints devops-fe
kubectl get endpoints devops-be

# Should show multiple IPs (one per replica)
# If empty, check pod labels match service selector
```

### k3d Cluster Issues

```bash
# Check cluster status
k3d cluster list

# Restart cluster if stopped
k3d cluster start devops

# Delete and recreate cluster (if needed)
k3d cluster delete devops
k3d cluster create devops \
  --agents 2 \
  --port "80:80@loadbalancer" \
  --port "8080:8080@loadbalancer" \
  --port "16686:16686@loadbalancer" \
  --port "9090:9090@loadbalancer" \
  --port "3001:3001@loadbalancer"
```

**Why k3d?**
- LoadBalancer services automatically exposed on localhost
- Lightweight (~1GB less RAM than Docker Desktop K8s)
- Faster startup and shutdown
- No port-forwarding scripts needed

### Database Connection Issues
```sh
# Check if database pod is running
kubectl get pods -l app=devops-db

# Check backend logs for connection errors
kubectl logs -l app=devops-be --tail=50

# Verify environment variables
kubectl describe pod <backend-pod-name> | grep -A 10 Environment
```
