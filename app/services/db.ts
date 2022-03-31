import { Prisma, PrismaClient } from '@prisma/client';
import { config } from './config';

let db: PrismaClient;

declare global {
  var __db: PrismaClient | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (config.isProduction) {
  db = new PrismaClient();
  db.$connect();
} else {
  if (!global.__db) {
    const log: Prisma.LogLevel[] = config.isDevelopment ? ['query'] : [];
    global.__db = new PrismaClient({ log });
    global.__db.$connect();
  }
  db = global.__db;
}

export { db };
