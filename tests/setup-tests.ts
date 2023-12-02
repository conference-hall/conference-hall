import './custom-matchers.ts';

import { installGlobals } from '@remix-run/node';
import { EmailQueue } from 'jobs/email/email.queue.ts';

import { disconnectDB, resetDB } from './db-helpers.ts';

// This installs globals such as "fetch", "Response", "Request" and "Headers.
installGlobals();

// DB resets and disconnect
afterEach(async () => {
  await resetDB();
  vi.resetAllMocks();
});

afterAll(async () => {
  await disconnectDB();
  await EmailQueue.get().close();
});

// Console in tests
global.console.info = vi.fn();
