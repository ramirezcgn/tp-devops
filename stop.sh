#!/bin/bash
# Complete shutdown script for TP DevOps Kubernetes cluster

echo "========================================"
echo "  TP DevOps - Kubernetes Shutdown"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Confirm shutdown
read -p "This will stop all services and port forwards. Continue? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Shutdown cancelled.${NC}"
    exit 0
fi

# Step 1: Stop port forwarding
echo -e "\n${YELLOW}[1/3] Stopping port forwards...${NC}"
bash "$(dirname "$0")/stop-port-forwards.sh"

# Step 2: Ask if user wants to delete Kubernetes resources
echo -e "\n${YELLOW}[2/3] Kubernetes resources...${NC}"
read -p "Do you want to delete all Kubernetes resources? (y/N): " deleteResources

if [[ "$deleteResources" =~ ^[Yy]$ ]]; then
    echo -e "  ${CYAN}Deleting all resources...${NC}"
    kubectl delete -f kubernetes/deploy-all.yaml --ignore-not-found=true
    echo -e "  ${GREEN}✓ Resources deleted${NC}"
else
    echo -e "  ${YELLOW}Keeping resources (they will persist after reboot)${NC}"
fi

# Step 3: Summary
echo -e "\n${YELLOW}[3/3] Shutdown complete!${NC}"
echo ""

if [[ "$deleteResources" =~ ^[Yy]$ ]]; then
    echo -e "${WHITE}All resources have been removed from Kubernetes.${NC}"
    echo -e "${CYAN}To start again, run: ./start.sh${NC}"
else
    echo -e "${WHITE}Kubernetes resources are still running.${NC}"
    echo -e "${CYAN}To restart port forwards only: ./start-port-forwards.sh${NC}"
    echo -e "${CYAN}To fully restart: ./start.sh${NC}"
fi

echo ""
