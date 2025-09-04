FROM node:22-slim AS base

# Install Java + deps in one layer
RUN apt-get update && apt-get install -y \
    openjdk-17-jre-headless \
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