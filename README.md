# Conference Hall Remix

## Prerequisites

- Docker
- Node 18+

## Development

Install dependencies:

```sh
npm install
```

Start Docker image for Postgres DB and Firebase Auth emulator:

```sh
docker compose up -d
```

Start the app in development mode, rebuilding assets on file changes.

```sh
npm run dev
```

## Useful commands

### Reset and seed local DB

```
npm run db:reset
```

### Export emulators data

```
docker exec -it ch_firebase_emulators sh
firebase --project=conference-hall emulators:export fixtures
```

### Execute tests

The docker image for Postgres DB and Firebase Auth emulator MUST be running.

Execute unit and integration tests:

```
npm run test
```

Execute end-to-end tests:

```
npm run cy:run
```
