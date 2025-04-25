package routes

import (
	"container-service/builder"
	"container-service/types"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

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

	cloneBaseDir := os.Getenv("CLONE_BASE_DIR")
	log.Println("clone base dir: ", cloneBaseDir)
	if cloneBaseDir == "" {
		cloneBaseDir = "/temp"
	}
	cloneBaseDir, _ = filepath.Abs(cloneBaseDir)
	clonePath := filepath.Join(cloneBaseDir, request.RepoOwner, request.RepoName)
	log.Println("clone path: ", clonePath)

	msg, logs, err := builder.BuildImageFromDockerfile(
		fmt.Sprintf("%s/%s", request.RepoOwner, request.RepoName),
		clonePath,
		request.Dockerfile,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "internal server error",
			"error":   err.Error(),
		})
	}

	if err = os.RemoveAll(clonePath); err != nil {
		log.Println("failed to delete clonePath: ", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": msg,
		"logs":    logs,
	})
}
