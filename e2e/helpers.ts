import path from 'node:path';

const TEMP_DIR = '../node_modules/.playwright';
const UPLOADS_DIR = './uploads';

export const TEST_USERS = ['clark-kent', 'bruce-wayne', 'peter-parker'] as const;

export type TestUser = (typeof TEST_USERS)[number];

export function getUserAuthPath(user: TestUser) {
  return path.join(import.meta.dirname, TEMP_DIR, `./auth-${user}.json`);
}

export function getFileUploadPath(file: string) {
  return path.join(import.meta.dirname, UPLOADS_DIR, file);
}
