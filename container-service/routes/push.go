package routes

import (
	"container-service/builder"
	"container-service/types"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
)

// Prometheus metrics for push requests
var (
	pushRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "container_service_push_requests_total",
			Help: "Total number of push requests received",
		},
		[]string{"status"},
	)
	pushDuration = prometheus.NewHistogram(
		prometheus.HistogramOpts{
			Name:    "container_service_push_duration_seconds",
			Help:    "Duration of push requests in seconds",
			Buckets: prometheus.DefBuckets,
		},
	)
)

func init() {
	prometheus.MustRegister(pushRequestsTotal, pushDuration)
}

// push given docker image
func HandlePushRequest(c *gin.Context) {
	start := time.Now()

	var request types.PushRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		pushRequestsTotal.WithLabelValues("bad_request").Inc()

		c.JSON(http.StatusBadRequest, gin.H{
			"message": "bad request",
			"error":   err.Error(),
		})
		return
	}

	msg, logs, success, err := builder.PushImage(
		request.ImageTag,
	)
	statusLabel := "failure"
	if success {
		statusLabel = "success"
	}
	if err != nil {
		pushRequestsTotal.WithLabelValues(statusLabel).Inc()
		pushDuration.Observe(time.Since(start).Seconds())

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "internal server error",
			"error":   err.Error(),
		})
		return
	}

	pushRequestsTotal.WithLabelValues(statusLabel).Inc()
	pushDuration.Observe(time.Since(start).Seconds())

	var status = http.StatusOK
	if !success {
		status = http.StatusBadRequest
	}

	c.JSON(status, gin.H{
		"message": msg,
		"logs":    logs,
	})
}

