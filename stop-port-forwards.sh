#!/bin/bash
# Script to stop all port forwards

echo "Stopping all port forwards..."

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Find and kill all kubectl port-forward processes
PIDS=$(pgrep -f "kubectl port-forward")

if [ -z "$PIDS" ]; then
    echo -e "${GREEN}No port forwards running.${NC}"
else
    for PID in $PIDS; do
        echo -e "${CYAN}Stopping process $PID...${NC}"
        kill -9 "$PID" 2>/dev/null
    done
    
    sleep 1
    echo -e "\n${GREEN}All port forwards stopped.${NC}"
fi
