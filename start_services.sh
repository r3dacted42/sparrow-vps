#!/bin/bash

minikube status > /dev/null 2>&1
minikube_status_code=$?
if [ $minikube_status_code -eq 0 ]; then
  echo "minikube is running."
else
  echo "minikube is not running, starting..."
  minikube start > /dev/null 2>&1
fi

kubectl create namespace sparrow-vps

deploy_resource() {
  local resource_path="$1"
  echo "applying $resource_path"
  kubectl apply -f "$resource_path"
}

basepath="./kubernetes"
repopath="$basepath/repo-service"
contpath="$basepath/container-service"
dplypath="$basepath/deploy-service"
oathpath="$basepath/oauth-service"
fronpath="$basepath/frontend"

deploy_resource "$basepath/sparrow-pv.yml"
deploy_resource "$basepath/repo-data-pvc.yml"
deploy_resource "$basepath/sparrow-config.yml"
deploy_resource "$basepath/sparrow-secrets.yml"

deploy_resource "$repopath/repo-service-deployment.yml"
deploy_resource "$repopath/repo-service-svc.yml"

deploy_resource "$contpath/container-service-deployment.yml"
deploy_resource "$contpath/container-service-svc.yml"

deploy_resource "$dplypath/deploy-service-sa.yml"
deploy_resource "$dplypath/deploy-service-crd.yml"
deploy_resource "$dplypath/deploy-service-crb.yml"
deploy_resource "$dplypath/deploy-service-deployment.yml"
deploy_resource "$dplypath/deploy-service-svc.yml"

deploy_resource "$oathpath/oauth-service-deployment.yml"
deploy_resource "$oathpath/oauth-service-svc.yml"

deploy_resource "$fronpath/frontend-deployment.yml"
deploy_resource "$fronpath/frontend-service.yml"
deploy_resource "$fronpath/frontend-ingress.yml"

minikube_ip=$(minikube ip)
if grep -q "sparrow-vps.local" /etc/hosts; then
  echo "entry for sparrow-vps.local exists, overwriting with $minikube_ip"
  sudo sed -i "s/.*sparrow-vps.local$/$minikube_ip sparrow-vps.local/" /etc/hosts
else
  echo "adding $minikube_ip sparrow-vps.local to /etc/hosts"
  echo "$minikube_ip sparrow-vps.local" | sudo tee -a /etc/hosts
fi
