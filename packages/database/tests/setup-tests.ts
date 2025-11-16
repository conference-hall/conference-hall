import { disconnectDB, resetDB } from './db-helpers.ts';

beforeAll(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

afterEach(async () => {
  await resetDB();
});

afterAll(async () => {
  await disconnectDB();
});
