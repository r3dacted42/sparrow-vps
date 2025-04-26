package utils

import (
	"context"
	"fmt"

	"github.com/docker/docker/client"
)

func PingDocker() error {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return fmt.Errorf("error starting docker client: %w", err)
	}
	defer cli.Close()

	ping, err := cli.Ping(ctx)
	if err != nil {
		return fmt.Errorf("error pinging docker daemon: %w", err)
	}

	fmt.Println("docker api version:", ping.APIVersion)
	return nil
}
