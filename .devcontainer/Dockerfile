# Basis-Image mit Node.js
FROM mcr.microsoft.com/devcontainers/typescript-node:22

USER root
RUN apt-get update && apt-get upgrade -y

# Arbeitsverzeichnis
WORKDIR /workspace

# Port freigeben
EXPOSE 3000

# Container läuft als node user
USER node