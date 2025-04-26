#!/bin/bash

minikube status > /dev/null 2>&1
minikube_status_code=$?
if [ $minikube_status_code -eq 0 ]; then
  echo "minikube is running."
else
  echo "minikube is not running. exiting..."
  exit 1
fi

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
  echo "entry for sparrow-vps.local exists, overwriting with $minikube_ip"
  sudo sed -i "s/.*sparrow-vps.local$/$minikube_ip sparrow-vps.local/" /etc/hosts
else
  echo "adding $minikube_ip sparrow-vps.local to /etc/hosts"
  echo "$minikube_ip sparrow-vps.local" | sudo tee -a /etc/hosts
fi
