# Quick Start Guide

## First Time Setup

### Create the k3d cluster:
```bash
k3d cluster create devops \
  --agents 2 \
  --port "80:80@loadbalancer" \
  --port "8080:8080@loadbalancer" \
  --port "16686:16686@loadbalancer" \
  --port "9090:9090@loadbalancer" \
  --port "3001:3001@loadbalancer"
```

### Deploy the application:
```bash
kubectl apply -f kubernetes/deploy-all.yaml

# Wait for pods to be ready
kubectl get pods --watch
```

**That's it!** Services are accessible directly on localhost.

---

## After Reboot - Quick Start

### Start the cluster:
```bash
k3d cluster start devops
```

### Verify pods are running:
```bash
kubectl get pods
```

If resources were deleted, redeploy:
```bash
kubectl apply -f kubernetes/deploy-all.yaml
```

---

## What Happens When You Reboot?

### k3d Cluster:
- ❌ Cluster stops when Docker stops
- ✅ Automatically restarts when you run `./start.sh`
- ✅ All resources persist (they redeploy quickly)

### Services:
- ✅ Accessible directly on localhost (no port-forwarding needed)
- ✅ LoadBalancer automatically exposes services
- ✅ No tunnels to manage or scripts to remember

---

## Step-by-Step (Manual Workflow)

### 1. Ensure Docker is Running
Check system tray for Docker icon (whale)

### 2. Start k3d cluster:
```bash
k3d cluster start devops
```

### 3. Verify cluster is running:
```bash
k3d cluster list
kubectl cluster-info
```

### 4. Check if resources are deployed:
```bash
kubectl get pods
```

### 5. Deploy if needed:
```bash
kubectl apply -f kubernetes/deploy-all.yaml
```

### 6. Access services:
- http://localhost (Application)
- http://localhost:8080 (Grafana)
- http://localhost:16686 (Jaeger)
- http://localhost:9090 (Prometheus)

---

## Troubleshooting

### "k3d cluster not found"
```bash
# Create the cluster
k3d cluster create devops \
  --agents 2 \
  --port "80:80@loadbalancer" \
  --port "8080:8080@loadbalancer" \
  --port "16686:16686@loadbalancer" \
  --port "9090:9090@loadbalancer" \
  --port "3001:3001@loadbalancer"

# Deploy resources
kubectl apply -f kubernetes/deploy-all.yaml
```

### "Docker is not running"
1. Open Docker Desktop (or Docker)
2. Wait for it to fully start (green icon in system tray)
3. Run `./start.sh` again

### "Port already in use"
```bash
# Find what's using the port
lsof -i :80  # Linux/macOS
netstat -ano | grep :80  # Windows (Git Bash)

# Kill the process
kill -9 <PID>

# Restart
./start.sh
```

### "Pods stuck in Pending/ImagePullBackOff"
```bash
# Check pod status
kubectl describe pod <pod-name>

# Force recreation
kubectl delete -f kubernetes/deploy-all.yaml
kubectl apply -f kubernetes/deploy-all.yaml

# Or restart the cluster
k3d cluster stop devops
k3d cluster start devops
kubectl apply -f kubernetes/deploy-all.yaml
```

---

## Daily Workflow

### Morning (after booting PC):
```bash
# Start cluster
k3d cluster start devops

# Verify pods are running
kubectl get pods
```

☕ Wait ~30-60 seconds, then access:
- http://localhost (Application)
- http://localhost:16686 (Jaeger tracing)
- http://localhost:8080 (Grafana - admin/admin)
- http://localhost:9090 (Prometheus)

### During Development:
- Just code normally
- Services always accessible on localhost
- No tunnels to worry about!

### Evening (shutting down):
```bash
# Stop cluster (optional - saves resources)
k3d cluster stop devops

# Or delete resources but keep cluster running
kubectl delete -f kubernetes/deploy-all.yaml
```

---

## Pro Tips

1. **k3d benefits**:
   - Lighter than Docker Desktop K8s (~1GB less RAM)
   - Faster startup/shutdown
   - No port-forwarding hassle
   - Direct localhost access to all services

2. **Quick cluster management**:
   ```bash
   k3d cluster start devops    # Start
   k3d cluster stop devops     # Stop
   k3d cluster list            # List all clusters
   ```

3. **Monitor health**:
   ```bash
   kubectl get pods
   kubectl get svc
   kubectl top pods
   ```

4. **Quick access to logs**:
   ```bash
   kubectl logs -f deployment/devops-be
   kubectl logs -f deployment/devops-fe
   ```

5. **Keep resources between reboots**:
   - Don't delete resources when stopping
   - Just stop the cluster: `k3d cluster stop devops`
   - Resources persist and restart quickly

---

## Common Commands

```bash
# Cluster management
k3d cluster create devops --agents 2 --port "80:80@loadbalancer" ...
k3d cluster start devops
k3d cluster stop devops
k3d cluster delete devops
k3d cluster list

# Deploy/Update
kubectl apply -f kubernetes/deploy-all.yaml
kubectl delete -f kubernetes/deploy-all.yaml

# Monitor
kubectl get pods
kubectl get svc
kubectl logs -f deployment/devops-be
kubectl describe pod <pod-name>

# Scale
kubectl scale deployment devops-be --replicas=3
kubectl scale deployment devops-fe --replicas=5
```
