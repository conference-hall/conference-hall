import { installGlobals } from '@remix-run/node';

import { disconnectDB, resetDB } from './db-helpers.ts';

// Mock jobs during testing
vi.mock('../app/libs/jobs/job.ts', () => {
  return {
    job: vi.fn().mockImplementation((config) => ({
      config,
      trigger: vi.fn(),
    })),
  };
});

// This installs globals such as "fetch", "Response", "Request" and "Headers.
installGlobals({ nativeFetch: true });

// DB resets and disconnect
afterEach(async () => {
  await resetDB();
  vi.restoreAllMocks();
});

afterAll(async () => {
  await disconnectDB();
});

// Console in tests
global.console.info = vi.fn();
