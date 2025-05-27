package worker

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"net/url"
	"os"
	"path/filepath"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	networkingv1 "k8s.io/api/networking/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

const (
	basePath        = "/project"
	deployNamespace = "sparrow-vps-deployments"
)

var (
	baseDomain string
	clientset  *kubernetes.Clientset
)

func init() {
	var config *rest.Config
	var err error

	config, err = rest.InClusterConfig()
	if err != nil {
		log.Printf("not running in-cluster, attempting to use local kubeconfig...")
		var kubeconfig string
		if kc := os.Getenv("KUBECONFIG"); kc != "" {
			kubeconfig = kc
		} else if home := homedir.HomeDir(); home != "" {
			kubeconfig = filepath.Join(home, ".kube", "config")
		} else {
			log.Fatalf("error: kubeconfig not found in env or default path.")
		}
		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			log.Fatalf("error building kubeconfig: %v", err)
		}
	}

	clientset, err = kubernetes.NewForConfig(config)
	if err != nil {
		log.Fatalf("error creating Kubernetes clientset: %v", err)
	}
	log.Println("successfully initialized Kubernetes clientset.")

	ctx := context.Background()
	namespace := &corev1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: deployNamespace,
		},
	}
	_, _ = clientset.CoreV1().Namespaces().Create(ctx, namespace, metav1.CreateOptions{})

	baseDomain = os.Getenv("SPARROW_ORIGIN")
	if baseDomain == "" {
		baseDomain = "http://sparrow-vps.local" // fallback
	}
	parsedUrl, err := url.Parse(baseDomain)
	if err != nil {
		log.Printf("error parsing base path, using defaulting to sparrow-vps.local")
		baseDomain = "sparrow-vps.local"
	} else {
		baseDomain = parsedUrl.Hostname()
	}
	log.Printf("baseDomain: %s", baseDomain)
}

func int32Ptr(i int32) *int32 { return &i }

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyz"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

func DeployFromImageTag(
	imageTag string,
	pathName string,
	exposePort int32,
) (string, error) { // url, error
	ctx := context.Background()

	uniqProjId := fmt.Sprintf("%s-%s", pathName, generateRandomString(6))
	resName := fmt.Sprintf("project-%s", uniqProjId)
	svcName := fmt.Sprintf("%s-svc", resName)
	ingName := fmt.Sprintf("%s-ing", resName)

	fullPath := fmt.Sprintf("%s/%s", basePath, uniqProjId)
	projUrl := fmt.Sprintf("http://%s%s", baseDomain, fullPath)

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      resName,
			Namespace: deployNamespace,
			Labels: map[string]string{
				"app":        resName,
				"project-id": pathName,
				"unique-id":  uniqProjId,
			},
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(1),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": resName,
				},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app": resName,
					},
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{
							Name:  "app-container",
							Image: imageTag,
							Ports: []corev1.ContainerPort{
								{
									ContainerPort: exposePort,
								},
							},
						},
					},
				},
			},
		},
	}
	log.Printf("creating deployment '%s'...", resName)
	_, err := clientset.AppsV1().Deployments(deployNamespace).Create(ctx, deployment, metav1.CreateOptions{})
	if err != nil {
		return "", fmt.Errorf("failed to create deployment '%s': %w", resName, err)
	}
	log.Printf("deployment '%s' created", resName)

	service := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      svcName,
			Namespace: deployNamespace,
			Labels: map[string]string{
				"app": resName,
			},
		},
		Spec: corev1.ServiceSpec{
			Selector: map[string]string{
				"app": resName,
			},
			Ports: []corev1.ServicePort{
				{
					Protocol:   corev1.ProtocolTCP,
					Port:       exposePort,
					TargetPort: intstr.FromInt32(exposePort),
				},
			},
			Type: corev1.ServiceTypeClusterIP,
		},
	}
	log.Printf("creating service '%s'...", svcName)
	_, err = clientset.CoreV1().Services(deployNamespace).Create(ctx, service, metav1.CreateOptions{})
	if err != nil {
		_ = clientset.AppsV1().Deployments(deployNamespace).Delete(ctx, resName, metav1.DeleteOptions{})
		return "", fmt.Errorf("failed to create service '%s': %w", svcName, err)
	}
	log.Printf("service '%s' created", svcName)

	ingress := &networkingv1.Ingress{
		ObjectMeta: metav1.ObjectMeta{
			Name:      ingName,
			Namespace: deployNamespace,
			Labels: map[string]string{
				"app": resName,
			},
			Annotations: map[string]string{
				"nginx.ingress.kubernetes.io/rewrite-target": "/",
			},
		},
		Spec: networkingv1.IngressSpec{
			Rules: []networkingv1.IngressRule{
				{
					Host: baseDomain,
					IngressRuleValue: networkingv1.IngressRuleValue{
						HTTP: &networkingv1.HTTPIngressRuleValue{
							Paths: []networkingv1.HTTPIngressPath{
								{
									Path:     fullPath,
									PathType: func() *networkingv1.PathType { pt := networkingv1.PathTypePrefix; return &pt }(),
									Backend: networkingv1.IngressBackend{
										Service: &networkingv1.IngressServiceBackend{
											Name: svcName,
											Port: networkingv1.ServiceBackendPort{
												Number: exposePort,
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}
	log.Printf("creating ingress '%s'...", ingName)
	_, err = clientset.NetworkingV1().Ingresses(deployNamespace).Create(ctx, ingress, metav1.CreateOptions{})
	if err != nil {
		_ = clientset.CoreV1().Services(deployNamespace).Delete(ctx, svcName, metav1.DeleteOptions{})
		_ = clientset.AppsV1().Deployments(deployNamespace).Delete(ctx, resName, metav1.DeleteOptions{})
		return "", fmt.Errorf("failed to create ingress '%s': %w", ingName, err)
	}
	log.Printf("ingress '%s' created", ingName)

	return projUrl, nil
}
