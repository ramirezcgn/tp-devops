# Quick Start Guide

## After Reboot - Complete Startup

### Super Quick (1 command):
```powershell
.\start.ps1
```
or
```powershell
npm run k3s:start
```

**That's it!** The script handles everything automatically.

---

## What Happens When You Reboot?

### Docker Desktop:
- ✅ Automatically starts with Windows (if configured)
- ✅ Kubernetes cluster persists between reboots

### Kubernetes Resources:
- ✅ Pods, Services, Deployments persist
- ✅ Will auto-restart if Docker Desktop restarts

### Port Forwards:
- ❌ Do NOT persist (need to restart manually)
- This is why you need to run `.\start.ps1`

---

## Step-by-Step (if you prefer manual):

### 1. Ensure Docker Desktop is Running
Check system tray for Docker icon (whale)

### 2. Check if resources are already deployed:
```powershell
kubectl get pods
```

**If pods are running** → Just start port forwards:
```powershell
.\start-port-forwards.ps1
```

**If no pods** → Deploy everything:
```powershell
kubectl apply -f kubernetes/deploy-all.yaml
.\start-port-forwards.ps1
```

---

## Troubleshooting

### "Docker is not running"
1. Open Docker Desktop from Start Menu
2. Wait for it to fully start (green icon in system tray)
3. Run `.\start.ps1` again

### "Kubernetes is not enabled"
1. Open Docker Desktop
2. Settings → Kubernetes → Enable Kubernetes
3. Wait for Kubernetes to start
4. Run `.\start.ps1` again

### "Port already in use"
```powershell
# Find what's using the port
netstat -ano | findstr :80

# Kill the process
Stop-Process -Id <PID> -Force

# Restart
.\start.ps1
```

### "Pods stuck in Pending/ImagePullBackOff"
```powershell
# Check pod status
kubectl describe pod <pod-name>

# Force recreation
kubectl delete -f kubernetes/deploy-all.yaml
kubectl apply -f kubernetes/deploy-all.yaml
```

---

## Daily Workflow

### Morning (after booting PC):
```powershell
.\start.ps1
```
☕ Wait ~1 minute, then access http://localhost

### During Development:
- Just code normally
- Port forwards stay active
- If they die: `.\start-port-forwards.ps1`

### Evening (shutting down):
```powershell
.\stop.ps1
```
Choose whether to keep Kubernetes resources or delete them

---

## Pro Tips

1. **Add to startup** (optional):
   - Create shortcut to `start.ps1`
   - Put in `shell:startup` folder
   - Auto-runs on login

2. **Keep it simple**:
   - Don't delete resources when shutting down
   - Just restart port forwards next time
   - Saves deployment time

3. **Monitor health**:
   ```powershell
   npm run k3s:status
   ```

4. **Quick access to logs**:
   ```powershell
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

You only need to run `.\start.ps1` from now on!
