package main

import (
	"deploy-service/routes"
	"log"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	// Prometheus packages for metrics
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// Prometheus middleware for Gin (simple wrapper)
func PrometheusMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// You could add more instrumentation here (histograms, counters etc.)
		c.Next()
	}
}

func main() {
	router := gin.Default()
	godotenv.Load()

	allowedOrigins := os.Getenv("SPARROW_ORIGIN")
	log.Println("allowed origins: ", allowedOrigins)
	if allowedOrigins == "" {
		router.Use(cors.Default())
	} else {
		config := cors.DefaultConfig()
		config.AllowOrigins = strings.Split(allowedOrigins, ",")
		router.Use(cors.New(config))
	}

	// Add Prometheus middleware (optional, for request instrumentation)
	router.Use(PrometheusMiddleware()) // <-- Added Prometheus middleware

	// Add the metrics endpoint for Prometheus to scrape
	router.GET("/metrics", gin.WrapH(promhttp.Handler())) // <-- Expose /metrics endpoint

	router.GET("/", routes.HandleRoot)
	router.POST("/deploy", routes.HandleDeploy)

	port := ":8002"
	if err := router.Run(port); err != nil {
		panic("failed to start service: " + err.Error())
	}
}
