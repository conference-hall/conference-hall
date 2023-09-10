import { installGlobals } from '@remix-run/node';

import { disconnectDB, resetDB } from './db-helpers';

// This installs globals such as "fetch", "Response", "Request" and "Headers.
installGlobals();

// DB resets and disconnect
afterEach(async () => {
  await resetDB();
});

afterAll(async () => {
  await disconnectDB();
});

// Console in tests
global.console.info = vi.fn();
