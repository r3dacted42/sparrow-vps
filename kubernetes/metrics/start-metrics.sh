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
  kubectl apply -f kubernetes/metrics/$file
done

echo "✅ Metrics stack deployed!"
