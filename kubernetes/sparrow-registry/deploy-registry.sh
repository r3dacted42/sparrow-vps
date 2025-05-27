kubectl create namespace sparrow-vps 2>/dev/null

pfx="registry"
ext="yml"

kubectl apply -f "$pfx-pvc.$ext"
kubectl apply -f "$pfx-deployment.$ext"
kubectl apply -f "$pfx-service.$ext"
kubectl apply -f "$pfx-ingress.$ext"

minikube_ip=$(minikube ip)
if grep -q "registry.sparrow-vps.local" /etc/hosts; then
  echo "entry for registry.sparrow-vps.local exists, overwriting with $minikube_ip"
  sudo sed -i "s/.*registry.sparrow-vps.local$/$minikube_ip registry.sparrow-vps.local/" /etc/hosts
else
  echo "adding $minikube_ip registry.sparrow-vps.local to /etc/hosts"
  echo "$minikube_ip registry.sparrow-vps.local" | sudo tee -a /etc/hosts
fi
