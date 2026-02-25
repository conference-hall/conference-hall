import fs from 'node:fs/promises';
import path from 'node:path';
import { getAuthSessionCookie } from 'tests/factories/users.ts';

const TEMP_DIR = '../node_modules/.playwright';
const UPLOADS_DIR = './uploads';

export function getUserAuthPath() {
  return path.join(import.meta.dirname, TEMP_DIR, `./auth.json`);
}

export function getFileUploadPath(file: string) {
  return path.join(import.meta.dirname, UPLOADS_DIR, file);
}

// Store session cookie
export async function storeSessionCookie() {
  const cookieObject = getAuthSessionCookie();
  const filepath = getUserAuthPath();
  await fs.writeFile(filepath, JSON.stringify({ cookies: [cookieObject], origins: [] }, null, 2));
}
