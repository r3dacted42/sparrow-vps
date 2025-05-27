package builder

import (
	"bytes"
	"container-service/utils"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
)

const (
	imageRepo = "r3dacted42/sparrow-project-images"
)

var (
	dockerClient *client.Client
)

func init() {
	var err error
	dockerClient, err = client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatalf("failed to create Docker client: %v", err)
	}
}

func BuildImage(
	imageTag string,
	clonePath string,
	dockerfile string,
) (string, string, string, bool, error) { // fullTag, message, logs, success, error
	ctx := context.Background()

	dockerfilePath := filepath.Join(clonePath, "Dockerfile")
	err := os.WriteFile(dockerfilePath, []byte(dockerfile), 0644)
	if err != nil {
		return "", "", "", false, fmt.Errorf("failed to write Dockerfile: %w", err)
	}
	log.Printf("Dockerfile written to: %s", dockerfilePath)

	buf := new(bytes.Buffer)
	err = utils.CreateTarArchive(clonePath, buf)
	if err != nil {
		return "", "", "", false, fmt.Errorf("failed to create tar archive for build context: %w", err)
	}
	log.Printf("Tar archive created from %s", clonePath)

	fullRegistryImageTag := fmt.Sprintf("%s:%s", imageRepo, strings.ReplaceAll(imageTag, ":", "-"))
	log.Printf("Attempting to build image with tag: %s", fullRegistryImageTag)

	buildResponse, err := dockerClient.ImageBuild(
		ctx,
		buf,
		types.ImageBuildOptions{
			Dockerfile: "Dockerfile",
			Tags:       []string{fullRegistryImageTag},
			Remove:     true, // Clean up intermediate containers
		},
	)
	if err != nil {
		return "", "", "", false, fmt.Errorf("failed to initiate image build: %w", err)
	}
	defer buildResponse.Body.Close()

	var logBuf bytes.Buffer
	decoder := json.NewDecoder(buildResponse.Body)
	var buildSuccess = true

	logBuf.WriteString("--- image build logs ---\n")
	for {
		var rawMessage map[string]any
		err := decoder.Decode(&rawMessage)
		if err != nil {
			if err == io.EOF {
				break
			}
			return "", logBuf.String(), "", false, fmt.Errorf("error decoding build event: %w", err)
		}

		timestamp := time.Now().Format("2006-01-02 15:04:05.000")
		var logMessage string

		if stream, ok := rawMessage["stream"].(string); ok {
			if strings.TrimSpace(stream) == "" {
				continue
			}
			logMessage = fmt.Sprintf("[%s] BUILD: %s", timestamp, stream)
		} else if errMessage, ok := rawMessage["error"].(string); ok {
			logMessage = fmt.Sprintf("[%s] BUILD ERROR: %s", timestamp, errMessage)
			buildSuccess = false
		} else if status, ok := rawMessage["status"].(string); ok {
			logMessage = fmt.Sprintf("[%s] BUILD STATUS: %s", timestamp, status)
		}

		log.Print(logMessage)
		logBuf.WriteString(logMessage)

		if !buildSuccess {
			break
		}
	}

	if !buildSuccess {
		return "", "image build failed", logBuf.String(), false, nil
	}
	logBuf.WriteString("--- image build complete ---\n")
	log.Printf("image '%s' built successfully.", fullRegistryImageTag)

	return fullRegistryImageTag, "image built successfully", logBuf.String(), true, nil
}
