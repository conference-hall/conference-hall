# Conference Hall

**Conference Hall** is an open SaaS platform to manage call for papers and speaker submissions for your conferences and meetups. Any speaker writes a talk once and can submit it to every event of the platform.

https://conference-hall.io

## Sponsors

[<img  src="./docs/sponsors/devlille.svg" alt="DevLille logo" height="68"/>](https://devlille.fr)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[<img src="./docs/sponsors/gdgnantes.png" alt="GDG Nantes logo" height="68"/>](https://gdgnantes.com)

## Features

**You are a speaker:**

- ✨ Write the abstract of your talk
- 🚀 Submit your talks to events (meetups and conferences)
- 🤝 Invite co-speakers to your talk
- 🔒 Social login

**You are an event organizer:**

- ❤️ Create your conference or meetup
- 📣 Call for papers opens and closes automatically
- ⚡️ Make it public or private
- 👥 Use teams to share an event between organizers
- 💡 Custom formats and categories for the talks
- 📥 Send survey to speakers
- ⭐️ Review proposals
- 💬 Discussion between organizers about a proposal
- ✅ Mark proposals as accepted, declined...
- 💌 Publish result to speakers and notify them with emails
- 👌 Get speaker confirmations
- 📃 Export the proposals
- 🌍 Some integrations (Slack, API...)

## Development

If you want to contribute and make **Conference Hall** better, read our [Contributing Guidelines](./docs/contributing.md).

### Stack

React / React router v7 / Typescript / Tailwind / HeadlessUI / Conform / Zod / Prisma / Firebase Auth / Mailgun / Express / Postgresql / Redis / Bull / Biome / Vitest / Cypress

### Prerequisites

- Docker
- Node 22+

### Getting started

Install dependencies:

```sh
npm install --legacy-peer-deps
```

> [!NOTE] > `--legacy-peer-deps` is necessary since React 19 upgrade and needed for some dependencies not fully-compatible (`dnd-kit`). It will be not necessary anymore in the future.

Start Docker image for Postgres DB, Firebase emulators and Mailpit:

```sh
docker compose up
```

If you start **Conference Hall** for the first time, you need to setup the database with the following command :

```shell
npm run db:reset
```

Start the development server:

```sh
npm run dev
```

### Useful commands

#### Reset and seed local DB

```sh
npm run db:reset
```

#### Execute tests

The docker image for Postgres DB and Firebase emulators MUST be running.

Execute unit and integration tests:

```sh
npm run test
```

Execute end-to-end tests (Dev server MUST be running):

```sh
npm run test:e2e
```

#### Execute linting

```sh
npm run lint
```

#### Execute typecript check

```sh
npm run tsc
```

#### Export emulators data

```sh
docker exec -it ch_firebase_emulators sh
firebase --project=conference-hall emulators:export fixtures
```
