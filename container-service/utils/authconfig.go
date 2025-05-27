package utils

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"k8s.io/client-go/util/homedir"
)

// dockerConfigFile represents the structure of ~/.docker/config.json
type dockerConfigFile struct {
	Auths       map[string]AuthEntry `json:"auths"`
	CredHelpers map[string]string    `json:"credHelpers"`
	// Add other fields if necessary, e.g., "credsStore", "HttpHeaders"
}

// AuthEntry represents an entry within the "auths" map
type AuthEntry struct {
	Auth string `json:"auth"` // Base64 encoded "username:password"
	// Add other fields if necessary, e.g., "username", "password", "email"
}

// GetDockerAuthConfig reads the Docker authentication configuration for a given registry
// from ~/.docker/config.json. It returns the base64-encoded AuthConfig string
// required by the Docker API for pushing images.
// It assumes `docker login` has been executed for the target registry.
func GetDockerAuthConfig(registry string) (string, error) {
	configPath := ""
	if home := homedir.HomeDir(); home != "" {
		configPath = filepath.Join(home, ".docker", "config.json")
	} else {
		return "", fmt.Errorf("could not find home directory for Docker config.json")
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return "", fmt.Errorf("failed to read Docker config.json at %s: %w", configPath, err)
	}

	var config dockerConfigFile // Correctly unmarshal into the defined struct
	if err := json.Unmarshal(data, &config); err != nil {
		return "", fmt.Errorf("failed to unmarshal Docker config.json: %w", err)
	}

	// Lookup the authentication entry for the specific registry
	authEntry, ok := config.Auths[registry]
	if !ok {
		return "", fmt.Errorf("no authentication entry found for registry %s in Docker config.json. Please run 'docker login' for this registry", registry)
	}

	// The 'auth' field in config.json is base64-encoded "username:password"
	if authEntry.Auth == "" {
		// This case would typically happen if a credHelper is used for this registry,
		// in which case the 'auth' field is empty and credentials are fetched externally.
		// For Docker Hub, this should not be empty if `docker login` was done.
		return "", fmt.Errorf("authentication token for %s is empty. A credHelper might be in use, or login failed. Please ensure 'docker login' is successful.", registry)
	}

	decodedAuth, err := base64.StdEncoding.DecodeString(authEntry.Auth)
	if err != nil {
		return "", fmt.Errorf("failed to base64 decode auth string for %s: %w", registry, err)
	}

	parts := strings.SplitN(string(decodedAuth), ":", 2)
	if len(parts) != 2 {
		return "", fmt.Errorf("invalid decoded auth string format for %s (expected 'username:password')", registry)
	}

	authConfig := map[string]string{
		"Username": parts[0],
		"Password": parts[1],
	}

	// The Docker API's ImagePushOptions.RegistryAuth expects a base64-encoded JSON of types.AuthConfig
	authConfigBytes, err := json.Marshal(authConfig)
	if err != nil {
		return "", fmt.Errorf("failed to marshal AuthConfig to JSON: %w", err)
	}

	return base64.URLEncoding.EncodeToString(authConfigBytes), nil
}
