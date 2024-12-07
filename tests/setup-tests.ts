import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';

import { flags } from '~/libs/feature-flags/flags.server.ts';
import { disconnectRedis } from '~/libs/redis.ts';
import { disconnectDB, resetDB } from './db-helpers.ts';

afterEach(async () => {
  cleanup();
  await resetDB();
  await flags.resetDefaults();
});

afterAll(async () => {
  await disconnectDB();
  await disconnectRedis();
});

// Mock jobs
vi.mock('../app/libs/jobs/job.ts', () => {
  return {
    job: vi.fn().mockImplementation((config) => ({
      config,
      trigger: vi.fn(),
    })),
  };
});

// Mock the ResizeObserver
vi.stubGlobal(
  'ResizeObserver',
  vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
);

// Mock console
global.console.info = vi.fn();
