FROM mcr.microsoft.com/devcontainers/typescript-node:22

USER root

# System-Updates
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Verzeichnisse erstellen und Ownership setzen
RUN mkdir -p /workspace/node_modules /workspace/.nuxt /workspace/.output && \
    chown -R node:node /workspace

# Zu node User wechseln
USER node

EXPOSE 3000