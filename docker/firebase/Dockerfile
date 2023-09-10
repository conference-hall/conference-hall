FROM node:18-alpine

RUN apk add openjdk11

RUN npm install -g firebase-tools

WORKDIR /app

CMD [ "firebase", "--project=conference-hall", "emulators:start", "--only", "auth,storage", "--import", "fixtures" ]