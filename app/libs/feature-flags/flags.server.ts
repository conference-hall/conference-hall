import flagsConfig from '../../../flags.config.ts';
import { FlagsClient } from './flags-client.ts';
import { DbStorage } from './storages/db-storage.ts';
import { MemoryStorage } from './storages/memory-storage.ts';

const isProduction = process.env.NODE_ENV === 'production' && !process.env.USE_EMULATORS;
const isTest = process.env.NODE_ENV === 'test';

declare global {
  var __flags: any;
}

async function getClient() {
  if (!isProduction && global.__flags) {
    return global.__flags as FlagsClient<typeof flagsConfig>;
  }

  if (!isTest) {
    console.info('🚩 Feature flags config loaded.');
  }

  const storage = isTest ? new MemoryStorage() : new DbStorage();
  const client = new FlagsClient(flagsConfig, storage);
  await client.load();

  if (!isProduction && !global.__flags) {
    global.__flags = client;
  }

  return client;
}

export const flags = await getClient();
