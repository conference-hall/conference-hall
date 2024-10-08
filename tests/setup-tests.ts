import './custom-matchers.ts';

import { installGlobals } from '@remix-run/node';

import { disconnectDB, resetDB } from './db-helpers.ts';

// This installs globals such as "fetch", "Response", "Request" and "Headers.
installGlobals({ nativeFetch: true });

// DB resets and disconnect
afterEach(async () => {
  await resetDB();
  vi.resetAllMocks();
});

afterAll(async () => {
  await disconnectDB();
});

// Console in tests
global.console.info = vi.fn();
