FROM node:slim

RUN npm install -g serve

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN chmod -R a+x node_modules
RUN npm run build

EXPOSE 5173

CMD [ "serve", "-p", "5173", "dist" ]
