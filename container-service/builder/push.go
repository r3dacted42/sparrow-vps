package builder

import (
	"bytes"
	"container-service/utils"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"time"

	"github.com/docker/docker/api/types/image"

	// --- [Prometheus] Import Prometheus client library ---
	"github.com/prometheus/client_golang/prometheus"
)

var (
	// --- [Prometheus] Define push metrics ---
	pushCounter = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "container_image_push_total",
			Help: "Total number of image pushes triggered.",
		},
	)

	pushFailures = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "container_image_push_failures_total",
			Help: "Total number of failed image pushes.",
		},
	)

	pushDuration = prometheus.NewHistogram(
		prometheus.HistogramOpts{
			Name:    "container_image_push_duration_seconds",
			Help:    "Histogram of image push durations.",
			Buckets: prometheus.DefBuckets,
		},
	)
)

func init() {
	// --- [Prometheus] Register push metrics ---
	prometheus.MustRegister(pushCounter)
	prometheus.MustRegister(pushFailures)
	prometheus.MustRegister(pushDuration)
}

func PushImage(
	fullRegistryImageTag string,
) (string, string, bool, error) { // message, logs, success, error
	ctx := context.Background()

	startTime := time.Now() // --- [Prometheus] Start timer
	pushCounter.Inc()       // --- [Prometheus] Increment push count

	log.Printf("attempting to push image '%s'", fullRegistryImageTag)
	authConfig, err := utils.GetDockerAuthConfig("https://index.docker.io/v1/")
	if err != nil {
		pushFailures.Inc() // --- [Prometheus] Failure metric
		return "", "", false, fmt.Errorf("failed to get Docker Hub auth config: %w", err)
	}

	pushResponse, err := dockerClient.ImagePush(ctx, fullRegistryImageTag, image.PushOptions{
		RegistryAuth: authConfig,
	})
	if err != nil {
		pushFailures.Inc() // --- [Prometheus] Failure metric
		return "", "", false, fmt.Errorf("failed to initiate image push: %w", err)
	}
	defer pushResponse.Close()

	var logBuf bytes.Buffer
	decoder := json.NewDecoder(pushResponse)
	var pushSuccess = true

	logBuf.WriteString("--- image push logs ---\n")
	for {
		var rawMessage map[string]any
		err := decoder.Decode(&rawMessage)
		if err != nil {
			if err == io.EOF {
				break
			}
			pushFailures.Inc() // --- [Prometheus] Failure metric
			return logBuf.String(), "", false, fmt.Errorf("error decoding push event: %w", err)
		}

		timestamp := time.Now().Format("2006-01-02 15:04:05.000")
		var logMessage string
		if status, ok := rawMessage["status"].(string); ok {
			logMessage = fmt.Sprintf("[%s] PUSH: %s\n", timestamp, status)
		} else if errorDetail, ok := rawMessage["errorDetail"].(map[string]any); ok {
			if message, ok := errorDetail["message"].(string); ok {
				logMessage = fmt.Sprintf("[%s] PUSH ERROR: %s\n", timestamp, message)
				pushSuccess = false
			}
		}

		log.Print(logMessage)
		logBuf.WriteString(logMessage)

		if !pushSuccess {
			pushFailures.Inc() // --- [Prometheus] Failure metric
			break
		}
	}
	logBuf.WriteString("--- image push complete ---\n")

	pushDuration.Observe(time.Since(startTime).Seconds()) // --- [Prometheus] Observe duration

	if pushSuccess {
		return "image pushed successfully", logBuf.String(), true, nil
	} else {
		return "image push failed", logBuf.String(), false, nil
	}
}

