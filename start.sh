#!/bin/bash
# Complete startup script for TP DevOps Kubernetes cluster

echo "========================================"
echo "  TP DevOps - Kubernetes Startup"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Step 1: Check if Docker Desktop is running
echo -e "${YELLOW}[1/5] Checking Docker Desktop...${NC}"
if docker info &> /dev/null; then
    echo -e "  ${GREEN}✓ Docker is running${NC}"
else
    echo -e "  ${RED}✗ Docker Desktop is not running!${NC}"
    echo -e "  ${YELLOW}Please start Docker Desktop and run this script again.${NC}"
    exit 1
fi

# Step 2: Check if Kubernetes is enabled
echo -e "\n${YELLOW}[2/5] Checking Kubernetes...${NC}"
if kubectl cluster-info &> /dev/null; then
    echo -e "  ${GREEN}✓ Kubernetes is running${NC}"
else
    echo -e "  ${RED}✗ Kubernetes is not enabled!${NC}"
    echo -e "  ${YELLOW}Please enable Kubernetes in Docker Desktop settings.${NC}"
    exit 1
fi

# Step 3: Check if resources are already deployed
echo -e "\n${YELLOW}[3/5] Checking existing deployments...${NC}"
if kubectl get pods --no-headers 2>&1 | grep -q "devops-"; then
    echo -e "  ${GREEN}✓ Resources already deployed${NC}"
    read -p "  Do you want to redeploy? (y/N): " deploy
    if [[ "$deploy" =~ ^[Yy]$ ]]; then
        echo -e "  ${CYAN}Deleting existing resources...${NC}"
        kubectl delete -f kubernetes/deploy-all.yaml --ignore-not-found=true
        sleep 5
        echo -e "  ${CYAN}Deploying resources...${NC}"
        kubectl apply -f kubernetes/deploy-all.yaml
    fi
else
    echo -e "  ${YELLOW}No existing deployments found${NC}"
    echo -e "  ${CYAN}Deploying all resources...${NC}"
    kubectl apply -f kubernetes/deploy-all.yaml
fi

# Step 4: Wait for pods to be ready
echo -e "\n${YELLOW}[4/5] Waiting for pods to be ready...${NC}"
echo -e "  ${GRAY}This may take a few minutes...${NC}"

MAX_WAIT_TIME=180 # 3 minutes
START_TIME=$(date +%s)
ALL_READY=false

while [ "$ALL_READY" = false ]; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    if [ $ELAPSED -gt $MAX_WAIT_TIME ]; then
        break
    fi
    
    TOTAL_PODS=$(kubectl get pods --no-headers 2>/dev/null | wc -l)
    READY_PODS=$(kubectl get pods --no-headers 2>/dev/null | grep -c "1/1.*Running")
    
    if [ "$TOTAL_PODS" -eq 0 ]; then
        echo -e "  ${GRAY}Waiting for pods to start...${NC}"
        sleep 5
        continue
    fi
    
    echo -e "  ${CYAN}Ready: $READY_PODS/$TOTAL_PODS pods${NC}"
    
    if [ "$READY_PODS" -eq "$TOTAL_PODS" ]; then
        ALL_READY=true
    else
        sleep 5
    fi
done

if [ "$ALL_READY" = true ]; then
    echo -e "  ${GREEN}✓ All pods are ready!${NC}"
else
    echo -e "  ${YELLOW}⚠ Some pods are still starting...${NC}"
    echo -e "  ${GRAY}Check status with: kubectl get pods${NC}"
fi

# Step 5: Start port forwarding
echo -e "\n${YELLOW}[5/5] Setting up port forwarding...${NC}"
bash "$(dirname "$0")/start-port-forwards.sh"

# Summary
echo -e "\n========================================"
echo -e "  ${GREEN}Startup Complete!${NC}"
echo -e "========================================"
echo -e "\nYour services are available at:"
echo -e "  ${CYAN}🌐 Application:  http://localhost${NC}"
echo -e "  ${CYAN}📊 Grafana:      http://localhost:8080 (admin/admin)${NC}"
echo -e "  ${CYAN}🔧 Backend API:  http://localhost:3001/api/todos${NC}"
echo -e "  ${CYAN}🔍 Jaeger UI:    http://localhost:16686${NC}"
echo -e "  ${CYAN}📈 Prometheus:   http://localhost:9090${NC}"

echo -e "\nUseful commands:"
echo -e "  ${GRAY}kubectl get pods              - View all pods${NC}"
echo -e "  ${GRAY}kubectl logs -f <pod-name>    - View pod logs${NC}"
echo -e "  ${GRAY}./stop-port-forwards.sh       - Stop port forwards${NC}"
echo -e "  ${GRAY}./start-port-forwards.sh      - Restart port forwards${NC}"

echo ""
