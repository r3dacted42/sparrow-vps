package preview

import (
	"fmt"
	"strings"
)

func GetPythonDockerfilePreview(
	installCommand string,
	exposePort string,
	deployCommand string,
	environmentVars string,
) (string, error) {
	cmdParts := strings.Split(deployCommand, " ")
	cmdString := `[`
	for i, part := range cmdParts {
		cmdString += fmt.Sprintf(`"%s"`, part)
		if i < len(cmdParts)-1 {
			cmdString += `, `
		}
	}
	cmdString += `]`

	dockerfile := fmt.Sprintf(
		`FROM python:alpine
ARG %v
WORKDIR /usr/src/app
COPY requirements.txt ./
RUN %v
COPY . ./
EXPOSE %v
CMD %v`,
		environmentVars,
		installCommand,
		exposePort,
		cmdString,
	)

	return dockerfile, nil
}
