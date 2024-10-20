import '@testing-library/jest-dom/vitest';

import { installGlobals } from '@remix-run/node';
import { cleanup } from '@testing-library/react';

import { disconnectDB, resetDB } from './db-helpers.ts';

// This installs globals such as "fetch", "Response", "Request" and "Headers.
installGlobals({ nativeFetch: true });

// Mock jobs
vi.mock('../app/libs/jobs/job.ts', () => {
  return {
    job: vi.fn().mockImplementation((config) => ({
      config,
      trigger: vi.fn(),
    })),
  };
});

afterEach(async () => {
  cleanup();
  await resetDB();
});

afterAll(async () => {
  await disconnectDB();
});

// Console in tests
global.console.info = vi.fn();
