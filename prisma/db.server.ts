import { PrismaClient } from '@prisma/client';

import { eventExtension } from './extensions/event.ts';
import { proposalExtension } from './extensions/proposal.ts';
import { talkExtension } from './extensions/talk.ts';
import { teamExtension } from './extensions/team.ts';

export type DbClient = ReturnType<typeof getClient>;

export type DbTransaction = Omit<DbClient, '$extends' | '$transaction' | '$disconnect' | '$connect' | '$on' | '$use'>;

let db: DbClient;

declare global {
  var __db: DbClient | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === 'production' && !process.env.USE_EMULATORS) {
  db = getClient();
} else {
  if (!global.__db) {
    global.__db = getClient();
  }
  db = global.__db;
}

function getClient() {
  const client = buildClientWithLogger()
    .$extends(eventExtension)
    .$extends(talkExtension)
    .$extends(proposalExtension)
    .$extends(teamExtension);

  client.$connect();

  return client;
}

function buildClientWithLogger(): PrismaClient {
  if (['development', 'test'].includes(process.env.NODE_ENV)) {
    return new PrismaClient({ log: ['warn', 'error'] });
  }

  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ],
  });
  client.$on('info', (event) => {
    console.log(JSON.stringify({ level: 'info', message: event.message, timestamp: event.timestamp.toISOString() }));
  });
  client.$on('warn', (event) => {
    console.log(JSON.stringify({ level: 'warn', message: event.message, timestamp: event.timestamp.toISOString() }));
  });
  client.$on('error', (event) => {
    console.log(JSON.stringify({ level: 'error', message: event.message, timestamp: event.timestamp.toISOString() }));
  });

  return client;
}

export { db };
