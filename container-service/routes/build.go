package routes

import (
	"container-service/types"
	"net/http"

	"github.com/gin-gonic/gin"
)

// build docker image using given data
func HandleBuildRequest(c *gin.Context) {
	var request types.BuildRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "bad request",
			"error":   err.Error(),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "build endpoint",
	})
}
