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
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/events"
	"github.com/docker/docker/client"
)

func BuildImageFromDockerfile(
	imageName string,
	clonePath string,
	dockerfile string,
) (string, string, error) {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return "", "", err
	}
	defer cli.Close()

	err = os.WriteFile(filepath.Join(
		clonePath, "Dockerfile"),
		[]byte(dockerfile),
		0644,
	)
	if err != nil {
		return "", "", fmt.Errorf("failed to write Dockerfile: %w", err)
	}

	buf := new(bytes.Buffer)
	err = utils.CreateTarArchive(clonePath, buf)
	if err != nil {
		return "", "", fmt.Errorf("failed to create tar: %w", err)
	}

	buildResponse, err := cli.ImageBuild(
		ctx,
		buf,
		types.ImageBuildOptions{
			Dockerfile: "Dockerfile",
			Tags:       []string{imageName},
			Remove:     false,
		},
	)
	if err != nil {
		return "", "", fmt.Errorf("failed to build image: %w", err)
	}
	defer buildResponse.Body.Close()

	var logBuf bytes.Buffer
	decoder := json.NewDecoder(buildResponse.Body)
	for {
		var rawMessage map[string]interface{}
		err := decoder.Decode(&rawMessage)
		if err != nil {
			if err == io.EOF {
				break // End of stream
			}
			return "", logBuf.String(), fmt.Errorf("error decoding event: %w", err)
		}

		// Check if it's a simple stream message
		if stream, ok := rawMessage["stream"].(string); ok {
			timestamp := time.Now().Format("2006-01-02 15:04:05.000")
			logMessage := fmt.Sprintf("[%s] %s", timestamp, stream)
			log.Print(logMessage)
			logBuf.WriteString(logMessage)
		} else {
			// Attempt to decode it as an events.Message
			var event events.Message
			//convert rawMessage to json.Marshal
			rawMessageBytes, err := json.Marshal(rawMessage)
			if err != nil {
				log.Printf("Error marshalling message: %v, using default log : %v", err, rawMessage)
				logBuf.WriteString(fmt.Sprintf("Error marshalling message: %v, using default log : %v", err, rawMessage))
				continue
			}
			err = json.Unmarshal(rawMessageBytes, &event)
			if err != nil {
				log.Printf("Error unmarshalling event: %v, using default log : %v", err, rawMessage)
				logBuf.WriteString(fmt.Sprintf("Error unmarshalling event: %v, using default log : %v", err, rawMessage))
				continue // Skip if it's not a valid event
			}
			utils.PrettyPrintEvent(os.Stdout, event)
			utils.PrettyPrintEvent(&logBuf, event)
		}
	}
	return "image build complete", logBuf.String(), nil
}
