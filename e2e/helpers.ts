import path from 'node:path';

const TEMP_DIR = '../node_modules/.playwright';

export const TEST_USERS = ['clark-kent', 'bruce-wayne'] as const;

export type TestUser = (typeof TEST_USERS)[number];

export function getUserAuthPath(user: TestUser) {
  return path.join(import.meta.dirname, TEMP_DIR, `./auth-${user}.json`);
}
