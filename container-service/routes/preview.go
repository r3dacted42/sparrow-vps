package routes

import (
	"container-service/preview"
	"container-service/types"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// preview dockerfile
func HandlePreviewRequest(c *gin.Context) {
	var params types.PreviewRequest
	if err := c.BindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "bad request",
			"error":   err.Error(),
		})
		return
	}

	fmt.Printf("project type: %s", params.ProjectType)
	fmt.Printf("install command: %s", params.InstallCommand)
	fmt.Printf("environment vars: %s", params.EnvironmentVars)

	var dockerfile string
	var err error

	switch params.ProjectType { // Use a switch for better readability and structure
	case "javascript":
		dockerfile, err = preview.GetNodeJSDockerfilePreview(
			params.NodeVersion,
			params.InstallCommand,
			params.BuildCommand,
			params.OutputDirectory,
			params.EnvironmentVars,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	case "python":
		dockerfile, err = preview.GetPythonDockerfilePreview(
			params.InstallCommand,
			params.ExposePort,
			params.DeployCommand,
			params.EnvironmentVars,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid project type"})
		return
	}

	c.String(http.StatusOK, dockerfile)
}
