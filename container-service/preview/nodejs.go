package preview

import "fmt"

func GetNodeJSDockerfilePreview(
	nodeVersion string,
	installCommand string,
	buildCommand string,
	outputDirectory string,
	environmentVars string,
) (string, error) {
	dockerfile := fmt.Sprintf(
		`FROM node:%v-alpine AS builder%v
WORKDIR /app
COPY package*.json ./
RUN %v
COPY . ./
RUN chmod -R a+x node_modules
RUN %v

FROM nginx:alpine
COPY --from=builder /app/%v /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`,
		nodeVersion,
		func() string {
			if environmentVars != "" {
				return "\nENV " + environmentVars
			}
			return ""
		}(),
		installCommand,
		buildCommand,
		outputDirectory,
	)

	return dockerfile, nil
}
