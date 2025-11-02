# Port Forwarding Scripts

## Why These Scripts Are Needed

When running Kubernetes (K3s) on **Docker Desktop for Windows**, LoadBalancer services don't automatically expose ports to `localhost`. This is different from:

- **Cloud providers** (AWS, GCP, Azure): Get real external IPs
- **Minikube**: Has `minikube tunnel` command
- **Native Linux k3s**: Can expose ports directly

### The Problem

```yaml
service/nginx-lb     LoadBalancer   10.96.84.226    172.19.0.6    80:30080/TCP
service/grafana      LoadBalancer   10.96.52.161    172.19.0.5    3000:31473/TCP
```

The `EXTERNAL-IP` (172.19.0.x) is an **internal Docker network IP**, not accessible from Windows.

### The Solution

**Port forwarding** creates a tunnel: `localhost:port → Kubernetes Service → Pods`

## Usage

### Start All Port Forwards

```powershell
.\start-port-forwards.ps1
```

This starts:
- **Grafana**: http://localhost:8080
- **NGINX (Frontend/Backend)**: http://localhost
- **Backend API**: http://localhost:3001

### Stop All Port Forwards

```powershell
.\stop-port-forwards.ps1
```

Or manually:
```powershell
Get-Process kubectl | Stop-Process
```

## Checking Active Port Forwards

```powershell
# List kubectl processes
Get-Process kubectl

# Should show 3 processes (one per service)
```

## Troubleshooting

### Port Already in Use

```powershell
# Find what's using the port (e.g., port 80)
netstat -ano | findstr :80

# Kill the process using the port
Stop-Process -Id <PID> -Force

# Restart port forwards
.\start-port-forwards.ps1
```

### Connection Refused

1. **Check if pods are running**:
   ```powershell
   kubectl get pods
   ```

2. **Check if services exist**:
   ```powershell
   kubectl get svc
   ```

3. **Restart port forwards**:
   ```powershell
   .\stop-port-forwards.ps1
   .\start-port-forwards.ps1
   ```

### Port Forward Keeps Dying

Port forwards can die if:
- Network changes (WiFi reconnect, VPN change)
- Docker Desktop restarts
- Kubernetes pods restart

**Solution**: Just run `.\start-port-forwards.ps1` again

## Alternative: MetalLB (Advanced)

For a more production-like setup, you can install MetalLB:

```sh
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.12/config/manifests/metallb-native.yaml

# Configure IP pool
kubectl apply -f - <<EOF
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: first-pool
  namespace: metallb-system
spec:
  addresses:
  - 192.168.1.240-192.168.1.250
EOF
```

Then LoadBalancer services will get real external IPs (but still requires network configuration).

## Best Practices

1. **Always check** if port forwards are running before accessing services
2. **Use the scripts** instead of manual commands (less error-prone)
3. **Document the ports** your team is using to avoid conflicts
4. **Consider Ingress** for production setups (nginx-ingress, traefik)

## Production Setup

In production, you would use:
- **Ingress Controller** instead of port-forwarding
- **Real LoadBalancer** from cloud provider
- **DNS** instead of localhost
- **TLS/SSL** certificates

Example with nginx-ingress:
```yaml
apiVersion: networking.k3s.io/v1
kind: Ingress
metadata:
  name: devops-ingress
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-lb
            port:
              number: 80
```
