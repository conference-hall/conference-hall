FROM node:24-slim AS base

# Install Java 21 (Adoptium Temurin) + deps in one layer
RUN apt-get update && apt-get install -y wget gnupg \
 && wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | gpg --dearmor -o /usr/share/keyrings/adoptium.gpg \
 && echo "deb [signed-by=/usr/share/keyrings/adoptium.gpg] https://packages.adoptium.net/artifactory/deb bookworm main" > /etc/apt/sources.list.d/adoptium.list \
 && apt-get update && apt-get install -y \
    temurin-21-jre \
    curl \
 && rm -rf /var/lib/apt/lists/*

 # Install Firebase tools
RUN npm install -g firebase-tools

WORKDIR /app

# Copy config 
COPY firebase.json storage.rules /app/

# Prefetch emulator binaries (avoids downloading on container start)
RUN firebase setup:emulators:ui && firebase setup:emulators:storage

# Ensure fixtures dir exists (can be mounted later)
RUN mkdir -p /app/fixtures

CMD [ "firebase", "--project=conference-hall", "emulators:start", "--only", "auth,storage", "--import", "fixtures" ]