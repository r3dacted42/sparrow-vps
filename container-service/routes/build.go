package routes

import (
	"container-service/builder"
	"container-service/types"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"

	// --- [Prometheus] Import Prometheus client library ---
	"github.com/prometheus/client_golang/prometheus"
)

var (
	// --- [Prometheus] Build related metrics ---
	buildCounter = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "container_build_requests_total",
			Help: "Total number of build requests received.",
		},
	)

	buildFailures = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "container_build_failures_total",
			Help: "Total number of failed builds.",
		},
	)

	buildDuration = prometheus.NewHistogram(
		prometheus.HistogramOpts{
			Name:    "container_build_duration_seconds",
			Help:    "Histogram of build durations.",
			Buckets: prometheus.DefBuckets,
		},
	)
)

func init() {
	// --- [Prometheus] Register build metrics ---
	prometheus.MustRegister(buildCounter)
	prometheus.MustRegister(buildFailures)
	prometheus.MustRegister(buildDuration)
}

// build docker image using given data
func HandleBuildRequest(c *gin.Context) {
	startTime := time.Now()         // --- [Prometheus] Start timer
	buildCounter.Inc()              // --- [Prometheus] Increment build requests counter

	var request types.BuildRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		buildFailures.Inc() // --- [Prometheus] Failure increment
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "bad request",
			"error":   err.Error(),
		})
		return
	}

	cloneBaseDir := os.Getenv("CLONE_BASE_DIR")
	log.Println("clone base dir: ", cloneBaseDir)
	if cloneBaseDir == "" {
		cloneBaseDir = "/temp"
	}
	cloneBaseDir, _ = filepath.Abs(cloneBaseDir)
	clonePath := filepath.Join(cloneBaseDir, request.RepoOwner, request.RepoName)
	log.Println("clone path: ", clonePath)

	imageTag := fmt.Sprintf("%s-%s", request.RepoOwner, request.RepoName)
	fullTag, msg, logs, success, err := builder.BuildImage(
		imageTag,
		clonePath,
		request.Dockerfile,
	)

	if err != nil {
		buildFailures.Inc() // --- [Prometheus] Failure increment
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "internal server error",
			"error":   err.Error(),
		})
		return
	}

	if err = os.RemoveAll(clonePath); err != nil {
		log.Println("failed to delete clonePath: ", err)
	}

	if !success {
		buildFailures.Inc() // --- [Prometheus] Failure increment
	}

	buildDuration.Observe(time.Since(startTime).Seconds()) // --- [Prometheus] Observe duration

	var status = http.StatusOK
	if !success {
		status = http.StatusBadRequest
	}

	c.JSON(status, gin.H{
		"message":   msg,
		"image_tag": fullTag,
		"logs":      logs,
	})
}

