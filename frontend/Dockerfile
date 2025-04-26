FROM node:slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . ./
RUN chmod -R a+x node_modules
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
