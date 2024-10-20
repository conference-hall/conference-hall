import '@testing-library/jest-dom/vitest';

import { installGlobals } from '@remix-run/node';
import { cleanup } from '@testing-library/react';

import { disconnectDB, resetDB } from './db-helpers.ts';

// This installs globals such as "fetch", "Response", "Request" and "Headers.
installGlobals({ nativeFetch: true });

afterEach(async () => {
  cleanup();
  await resetDB();
});

afterAll(async () => {
  await disconnectDB();
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
