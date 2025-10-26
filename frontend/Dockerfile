FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm i
EXPOSE 3000