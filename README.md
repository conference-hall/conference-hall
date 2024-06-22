# Conference Hall Remix

## Stack

Remix / Tailwind / HeadlessUI / Conform / Zod / Prisma / Firebase Auth / Mailgun / Express / Typescript / Postgresql

## Prerequisites

- Docker
- Node 20+

## Development

Install dependencies:

```sh
npm install
```

Start Docker image for Postgres DB, Firebase emulators and Mailpit:

```sh
docker compose up -d
```

Start the development server:

```sh
npm run dev
```

## Useful commands

### Reset and seed local DB

```
npm run db:reset
```

### Execute tests

The docker image for Postgres DB and Firebase emulators MUST be running.

Execute unit and integration tests:

```
npm run test
```

Execute end-to-end tests (Dev server MUST be running):

```
npm run cypress
```

### Execute linting

```
npm run lint
```

### Execute typecript check

```
npm run tsc
```

### Export emulators data

```
docker exec -it ch_firebase_emulators sh
firebase --project=conference-hall emulators:export fixtures
```
