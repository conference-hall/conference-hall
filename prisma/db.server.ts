import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

let db: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __db: PrismaClient | undefined;
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
  const log: Prisma.LogLevel[] = process.env.NODE_ENV === 'development' ? ['warn', 'error'] : [];
  const client = new PrismaClient({ log });
  client.$connect();
  return client;
}

export { db };
