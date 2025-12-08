package utils

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
)

func GetDockerAuthConfig(registry string) (string, error) {
	uname := os.Getenv("DOCKER_HUB_UNAME")
	passwd := os.Getenv("DOCKER_HUB_PASSWD")
	if uname == "" || passwd == "" {
		panic("couldn't find valid dockerhub creds from env")
	}

	authConfig := map[string]string{
		"Username": uname,
		"Password": passwd,
	}

	authConfigBytes, err := json.Marshal(authConfig)
	if err != nil {
		return "", fmt.Errorf("failed to marshal AuthConfig to JSON: %w", err)
	}

	return base64.URLEncoding.EncodeToString(authConfigBytes), nil
}
