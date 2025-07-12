import { getSharedServerEnv } from 'servers/environment.server.ts';
import flagsConfig from '../../../flags.config.ts';
import { MemoryCacheLayer } from '../cache/memory-cache-layer.ts';
import { FlagsClient } from './flags-client.ts';
import { FlagsStorage } from './flags-storage.ts';

const env = getSharedServerEnv();

const isProduction = env.NODE_ENV === 'production';

declare global {
  var __flags: any;
}

async function getClient() {
  if (!isProduction && global.__flags) {
    return global.__flags as FlagsClient<typeof flagsConfig>;
  }

  if (isProduction) {
    console.info('🚩 Feature flags config loaded.');
  }

  const cache = env.VITEST ? new MemoryCacheLayer() : undefined;
  const client = new FlagsClient(flagsConfig, new FlagsStorage(cache));
  await client.load();

  if (!isProduction && !global.__flags) {
    global.__flags = client;
  }

  return client;
}

export const flags = await getClient();
