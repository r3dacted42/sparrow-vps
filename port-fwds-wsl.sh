#!/bin/bash

NAMESPACE="sparrow-vps"

echo "Please provide your WSL password if prompted. This is required for minikube tunnel to bind to port 80/443."
sudo -v

echo "Starting minikube tunnel in the background..."
minikube tunnel > minikube_tunnel.log 2>&1 &
PID_TUNNEL=$!

echo "Starting port-forwarding for all Sparrow VPS services in namespace: $NAMESPACE..."

kubectl port-forward service/repo-service-svc 30080:8000 -n $NAMESPACE &
PID_REPO=$!

kubectl port-forward service/container-service-svc 30081:8001 -n $NAMESPACE &
PID_CONT=$!

kubectl port-forward service/deploy-service-svc 30082:8002 -n $NAMESPACE &
PID_DPLY=$!

kubectl port-forward service/oauth-service-svc 30083:8003 -n $NAMESPACE &
PID_AUTH=$!

echo "Logs for minikube tunnel are being written to 'minikube_tunnel.log'."
echo "Press [Ctrl+C] to stop all port-forwarding, close the tunnel, and exit."

# Trap SIGINT (Ctrl+C) to gracefully kill the background processes, including the tunnel
trap "echo -e '\nStopping tunnel and port-forwards...'; kill $PID_TUNNEL $PID_REPO $PID_CONT $PID_DPLY $PID_AUTH; echo 'Done.'; exit" SIGINT

wait