package main

import (
	"deploy-service/routes"
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
	router.POST("/deploy", routes.HandleDeploy)

	port := ":8002"
	if err := router.Run(port); err != nil {
		panic("failed to start service: " + err.Error())
	}
}
