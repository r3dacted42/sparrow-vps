package main

import (
	"container-service/routes"
	"container-service/utils"
	"log"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	router := gin.Default()
	godotenv.Load()

	if err := utils.PingDocker(); err != nil {
		panic("failed to ping docker: " + err.Error())
	}

	allowedOrigins := os.Getenv("SPARROW_ORIGIN")
	log.Println("allowed origins: ", allowedOrigins)
	if allowedOrigins == "" {
		router.Use(cors.Default())
	} else {
		config := cors.DefaultConfig()
		config.AllowOrigins = strings.Split(allowedOrigins, ",")
		router.Use(cors.New(config))
	}

	router.GET("/", routes.HandleRoot)
	router.GET("/preview", routes.HandlePreviewRequest)
	router.POST("/build", routes.HandleBuildRequest)

	port := ":8001"
	if err := router.Run(port); err != nil {
		panic("failed to start service: " + err.Error())
	}
}
