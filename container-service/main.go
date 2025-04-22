package main

import (
	"container-service/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.GET("/", routes.HandleRoot)
	router.POST("/build", routes.HandleBuildRequest)
	router.GET("/preview", routes.HandlePreviewRequest)

	port := ":8001"
	err := router.Run(port)
	if err != nil {
		panic("Failed to start service: " + err.Error())
	}
}
