# Quick Start Guide

## After Reboot - Complete Startup

### Super Quick (1 command):
```bash
./start.sh
```
or
```bash
npm run k3s:start
```

**That's it!** The script handles everything automatically.

---

## What Happens When You Reboot?

### Docker Desktop:
- ✅ Automatically starts with system (if configured)
- ✅ Kubernetes cluster persists between reboots

### Kubernetes Resources:
- ✅ Pods, Services, Deployments persist
- ✅ Will auto-restart if Docker Desktop restarts

### Port Forwards:
- ❌ Do NOT persist (need to restart manually)
- This is why you need to run `./start.sh`

---

## Step-by-Step (if you prefer manual):

### 1. Ensure Docker Desktop is Running
Check system tray for Docker icon (whale)

### 2. Check if resources are already deployed:
```bash
kubectl get pods
```

**If pods are running** → Just start port forwards:
```bash
./start-port-forwards.sh
```

**If no pods** → Deploy everything:
```bash
kubectl apply -f kubernetes/deploy-all.yaml
./start-port-forwards.sh
```

---

## Troubleshooting

### "Docker is not running"
1. Open Docker Desktop
2. Wait for it to fully start (green icon in system tray)
3. Run `./start.sh` again

### "Kubernetes is not enabled"
1. Open Docker Desktop
2. Settings → Kubernetes → Enable Kubernetes
3. Wait for Kubernetes to start
4. Run `./start.sh` again

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
```

---

## Daily Workflow

### Morning (after booting PC):
```bash
./start.sh
```
☕ Wait ~1 minute, then access:
- http://localhost (Application)
- http://localhost:16686 (Jaeger tracing)
- http://localhost:8080 (Grafana - admin/admin)

### During Development:
- Just code normally
- Port forwards stay active
- If they die: `./start-port-forwards.sh`

### Evening (shutting down):
```bash
./stop.sh
```
Choose whether to keep Kubernetes resources or delete them

---

## Pro Tips

1. **Keep it simple**:
   - Don't delete resources when shutting down
   - Just restart port forwards next time
   - Saves deployment time

2. **Monitor health**:
   ```bash
   npm run k3s:status
   ```

3. **Quick access to logs**:
   ```bash
   npm run k3s:logs:be
   npm run k3s:logs:fe
   ```

---

## First Time Setup (Already Done)

For reference, this is what was already configured:

1. ✅ Built Docker images
2. ✅ Created Kubernetes manifests
3. ✅ Configured port forwarding scripts
4. ✅ Added npm scripts

You only need to run `./start.sh` from now on!
