import { PrismaPg } from '@prisma/adapter-pg';
import { getSharedServerEnv } from '../servers/environment.server.ts';
import { eventExtension } from './extensions/event.ts';
import { proposalExtension } from './extensions/proposal.ts';
import { talkExtension } from './extensions/talk.ts';
import { teamExtension } from './extensions/team.ts';
import { PrismaClient } from './generated/client.ts';

const { NODE_ENV, DATABASE_URL } = getSharedServerEnv();

type DbClient = ReturnType<typeof getClient>;

export type DbTransaction = Omit<DbClient, '$extends' | '$transaction' | '$disconnect' | '$connect' | '$on' | '$use'>;

let db: DbClient;

declare global {
  var __db: DbClient | undefined;
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (NODE_ENV === 'production') {
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
  if (NODE_ENV !== 'production') {
    return new PrismaClient({ adapter, log: ['warn', 'error'] });
  }

  const client = new PrismaClient({
    adapter,
    log: [
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ],
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
