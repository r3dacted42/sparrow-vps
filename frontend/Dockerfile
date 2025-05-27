FROM node:slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . ./
RUN chmod -R a+x node_modules
ENV VITE_GH_CLIENT_ID="Ov23li9NfqAcnJPLRd85" \
    VITE_SPARROW_ORIGIN="http://sparrow-vps.local" \
    VITE_REPO_SERVICE="http://sparow-vps.local:30080" \
    VITE_CONT_SERVICE="http://sparow-vps.local:30081" \
    VITE_DPLY_SERVICE="http://sparow-vps.local:30082" \
    VITE_AUTH_SERVICE="http://sparow-vps.local:30083"
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
