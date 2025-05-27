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
		return
	}

	cloneBaseDir := os.Getenv("CLONE_BASE_DIR")
	log.Println("clone base dir: ", cloneBaseDir)
	if cloneBaseDir == "" {
		cloneBaseDir = "/temp"
	}
	cloneBaseDir, _ = filepath.Abs(cloneBaseDir)
	clonePath := filepath.Join(cloneBaseDir, request.RepoOwner, request.RepoName)
	log.Println("clone path: ", clonePath)

	imageTag := fmt.Sprintf("%s-%s", request.RepoOwner, request.RepoName)
	fullTag, msg, logs, success, err := builder.BuildImage(
		imageTag,
		clonePath,
		request.Dockerfile,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "internal server error",
			"error":   err.Error(),
		})
		return
	}

	if err = os.RemoveAll(clonePath); err != nil {
		log.Println("failed to delete clonePath: ", err)
	}

	var status = http.StatusOK
	if !success {
		status = http.StatusBadRequest
	}

	c.JSON(status, gin.H{
		"message":   msg,
		"image_tag": fullTag,
		"logs":      logs,
	})
}
