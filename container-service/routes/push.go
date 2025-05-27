package routes

import (
	"container-service/builder"
	"container-service/types"
	"net/http"

	"github.com/gin-gonic/gin"
)

// push given docker image
func HandlePushRequest(c *gin.Context) {
	var request types.PushRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "bad request",
			"error":   err.Error(),
		})
		return
	}

	msg, logs, success, err := builder.PushImage(
		request.ImageTag,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "internal server error",
			"error":   err.Error(),
		})
		return
	}

	var status = http.StatusOK
	if !success {
		status = http.StatusBadRequest
	}

	c.JSON(status, gin.H{
		"message": msg,
		"logs":    logs,
	})
}
