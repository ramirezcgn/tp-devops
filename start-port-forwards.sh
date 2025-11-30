#!/bin/bash
# Script to start persistent port forwards for Grafana, NGINX, Jaeger, and Prometheus

echo "Starting port forwards..."

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Kill any existing kubectl port-forward processes
pkill -f "kubectl port-forward" 2>/dev/null
sleep 2

# Start Grafana port-forward (background)
echo -e "${CYAN}Starting Grafana port-forward on localhost:8080...${NC}"
kubectl port-forward svc/grafana 8080:3000 > /dev/null 2>&1 &
sleep 2

# Start NGINX port-forward (background)
echo -e "${CYAN}Starting NGINX port-forward on localhost:80...${NC}"
kubectl port-forward svc/nginx-lb 80:80 > /dev/null 2>&1 &
sleep 2

# Start Backend port-forward (optional, for direct access)
echo -e "${CYAN}Starting Backend port-forward on localhost:3001...${NC}"
kubectl port-forward svc/devops-be 3001:8080 > /dev/null 2>&1 &
sleep 2

# Start Jaeger port-forward (for tracing UI)
echo -e "${CYAN}Starting Jaeger port-forward on localhost:16686...${NC}"
kubectl port-forward svc/jaeger-query 16686:16686 > /dev/null 2>&1 &
sleep 2

# Start Prometheus port-forward (for metrics)
echo -e "${CYAN}Starting Prometheus port-forward on localhost:9090...${NC}"
kubectl port-forward svc/prometheus 9090:9090 > /dev/null 2>&1 &
sleep 2

echo -e "\n${GREEN}Port forwards started successfully!${NC}"
echo -e "\n${YELLOW}Available services:${NC}"
echo -e "  ${WHITE}- Application: http://localhost${NC}"
echo -e "  ${WHITE}- Grafana: http://localhost:8080 (admin/admin)${NC}"
echo -e "  ${WHITE}- Backend API: http://localhost:3001/api/todos${NC}"
echo -e "  ${WHITE}- Jaeger UI: http://localhost:16686${NC}"
echo -e "  ${WHITE}- Prometheus: http://localhost:9090${NC}"

echo -e "\n${YELLOW}To stop port forwards, run:${NC}"
echo -e "  ${WHITE}pkill -f 'kubectl port-forward'${NC}"
