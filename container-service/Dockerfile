FROM golang:alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . ./
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /out/app .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /out/app ./app
EXPOSE 8081
ENV ALLOWED_ORIGINS="http://localhost:5173,http://my-frontend.com" \
    CLONE_BASE_DIR="/temp"
CMD [ "./app" ]
