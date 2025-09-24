FROM mcr.microsoft.com/devcontainers/typescript-node:22

USER root
RUN apt-get update && apt-get upgrade -y

WORKDIR /workspace

COPY ./../package*.json ./
RUN npm ci

EXPOSE 3000

USER node