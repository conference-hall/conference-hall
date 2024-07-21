import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

import { eventExtension } from './extensions/event.ts';
import { proposalExtension } from './extensions/proposal.ts';
import { talkExtension } from './extensions/talk.ts';
import { teamExtension } from './extensions/team.ts';

let db: ReturnType<typeof getClient>;

declare global {
  var __db: ReturnType<typeof getClient> | undefined;
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
  const log: Prisma.LogLevel[] = process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['warn', 'error'];

  const client = new PrismaClient({ log })
    .$extends(eventExtension)
    .$extends(talkExtension)
    .$extends(proposalExtension)
    .$extends(teamExtension);

  client.$connect();
  return client;
}

export { db };
