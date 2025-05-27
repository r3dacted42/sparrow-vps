package routes

import (
	"container-service/preview"
	"container-service/types"
	"fmt"
	"net/http"
	"time" // Added for timing

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus" // Added Prometheus client
)

// Added Prometheus histogram metric for tracking preview request durations and statuses
var (
	previewRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "container_service_preview_request_duration_seconds",
			Help:    "Duration of preview HTTP requests in container service.",
			Buckets: prometheus.ExponentialBuckets(0.01, 2, 10), // Buckets from 10ms to ~10s
		},
		[]string{"project_type", "status"},
	)
)

func init() {
	// Register the metric with Prometheus
	prometheus.MustRegister(previewRequestDuration)
}

// preview dockerfile handler with Prometheus instrumentation
func HandlePreviewRequest(c *gin.Context) {
	start := time.Now() // Start timer
	var status string    // Will hold HTTP status code as string for metrics
	defer func() {
		// Observe duration when function returns
		previewRequestDuration.WithLabelValues(c.Query("projectType"), status).Observe(time.Since(start).Seconds())
	}()

	var params types.PreviewRequest
	if err := c.BindQuery(&params); err != nil {
		status = "400"
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "bad request",
			"error":   err.Error(),
		})
		return
	}

	fmt.Printf("project type: %s\n", params.ProjectType)
	fmt.Printf("install command: %s\n", params.InstallCommand)
	fmt.Printf("environment vars: %s\n", params.EnvironmentVars)

	var dockerfile string
	var err error

	switch params.ProjectType {
	case "javascript":
		dockerfile, err = preview.GetNodeJSDockerfilePreview(
			params.NodeVersion,
			params.InstallCommand,
			params.BuildCommand,
			params.OutputDirectory,
			params.EnvironmentVars,
		)
		if err != nil {
			status = "500"
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	case "python":
		dockerfile, err = preview.GetPythonDockerfilePreview(
			params.InstallCommand,
			params.ExposePort,
			params.DeployCommand,
			params.EnvironmentVars,
		)
		if err != nil {
			status = "500"
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	default:
		status = "400"
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid project type"})
		return
	}

	status = "200"
	c.String(http.StatusOK, dockerfile)
}

