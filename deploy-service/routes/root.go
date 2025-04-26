package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func HandleRoot(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "container service",
	})
}
