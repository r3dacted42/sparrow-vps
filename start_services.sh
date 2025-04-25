#!/bin/bash

kubectl create namespace sparrow-vps

deploy_resource() {
  local resource_path="$1"
  echo "applying $resource_path"
  kubectl apply -f "$resource_path"
}

deploy_resource "./kubernetes/sparrow-pv.yml"
deploy_resource "./kubernetes/repo-data-pvc.yml"
deploy_resource "./kubernetes/repo-service/repo-service-deployment.yml"
deploy_resource "./kubernetes/repo-service/repo-service-svc.yml"
deploy_resource "./kubernetes/container-service/container-service-deployment.yml"
deploy_resource "./kubernetes/container-service/container-service-svc.yml"
deploy_resource "./kubernetes/frontend/frontend-deployment.yml"
deploy_resource "./kubernetes/frontend/frontend-service.yml"
deploy_resource "./kubernetes/frontend/frontend-ingress.yml"

minikube_ip=$(minikube ip)
if grep -q "sparrow-vps.local" /etc/hosts; then
  echo "entry for sparrow-vps.local already exists"
else
  echo "ddding $minikube_ip sparrow-vps.local to /etc/hosts"
  echo "$minikube_ip sparrow-vps.local" | sudo tee -a /etc/hosts
fi
