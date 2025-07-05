import { disconnectRedis } from '~/shared/cache/redis.server.ts';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { disconnectDB, resetDB } from './db-helpers.ts';

afterEach(async () => {
  await resetDB();
  await flags.resetDefaults();
});

afterAll(async () => {
  await disconnectDB();
  await disconnectRedis();
});

// Mock jobs
vi.mock('~/shared/jobs/job.ts', () => {
  return {
    job: vi.fn().mockImplementation((config) => ({
      config,
      trigger: vi.fn(),
    })),
  };
});

// Mock console
global.console.info = vi.fn();
global.console.warn = vi.fn();
global.console.error = vi.fn();
