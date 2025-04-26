package routes

import (
	"deploy-service/types"
	"net/http"

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
}
