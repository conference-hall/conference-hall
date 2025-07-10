import flagsConfig from '../../../flags.config.ts';
import { MemoryCacheLayer } from '../cache/memory-cache-layer.ts';
import { FlagsClient } from './flags-client.ts';
import { FlagsStorage } from './flags-storage.ts';

const isProduction = process.env.NODE_ENV === 'production' && !process.env.USE_EMULATORS;
const isTest = process.env.NODE_ENV === 'test';

declare global {
  var __flags: any;
}

async function getClient() {
  if (!isProduction && global.__flags) {
    return global.__flags as FlagsClient<typeof flagsConfig>;
  }

  if (!isTest && isProduction) {
    console.info('🚩 Feature flags config loaded.');
  }

  const cache = isTest ? new MemoryCacheLayer() : undefined;
  const client = new FlagsClient(flagsConfig, new FlagsStorage(cache));
  await client.load();

  if (!isProduction && !global.__flags) {
    global.__flags = client;
  }

  return client;
}

export const flags = await getClient();
