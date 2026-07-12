#!/bin/bash

set -e

echo "🚀 Starting Prometheus & Grafana metrics stack..."

FILES=(
  monitoring-namespace.yaml
  prometheus-config.yaml
  prometheus-deployment.yaml
  prometheus-ingress.yaml
  grafana-deployment.yaml
  grafana-ingress.yaml
)

for file in "${FILES[@]}"; do
  echo "🔧 Applying $file..."
  kubectl apply -f $file
done

minikube_ip=$(minikube ip)
sudo -v
DOMAINS=("grafana.local" "prometheus.local")

for DOMAIN in "${DOMAINS[@]}"; do
  if grep -q "[[:space:]]$DOMAIN" /etc/hosts; then
    echo "Entry for $DOMAIN exists, updating to $minikube_ip..."
    sudo sed -i "/[[:space:]]$DOMAIN/d" /etc/hosts
  else
    echo "Adding $DOMAIN to /etc/hosts..."
  fi
  echo "$minikube_ip $DOMAIN" | sudo tee -a /etc/hosts > /dev/null
done

echo "✅ Metrics stack deployed!"
