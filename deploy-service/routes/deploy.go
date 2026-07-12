package routes

import (
	"deploy-service/types"
	"deploy-service/worker"
	"net/http"
	"log"

	"github.com/gin-gonic/gin"
)

// deploy given docker image
func HandleDeploy(c *gin.Context) {
	var request types.DeployRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "bad request",
			"error":   err.Error(),
		})
		return
	}

	url, err := worker.DeployFromImageTag(
		request.ImageTag,
		request.PathName,
		request.ExposePort,
	)
	if err != nil {
		log.Printf("Deployment failed for image '%s' on path '%s': %v", request.ImageTag, request.PathName, err)
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "internal server error",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "project deployed successfully",
		"project_url": url,
	})
}
