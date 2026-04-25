import path from 'node:path';
import type { BrowserContext } from '@playwright/test';
import { userFactory, type UserFactoryOptions } from 'tests/factories/users.ts';
import { auth } from '~/shared/authentication/auth.server.ts';

// Upload file helpers

const UPLOADS_DIR = './uploads';

export function getFileUploadPath(file: string) {
  return path.join(import.meta.dirname, UPLOADS_DIR, file);
}

// Logged user factory

export async function userLoggedFactory(context: BrowserContext, options: UserFactoryOptions = {}) {
  // if no authentication methods, we set password by default
  if (!options.withPasswordAccount && !options.withSocialAccount) {
    options.withPasswordAccount = true;
  }

  // create the user in db
  const user = await userFactory(options);

  // set the authentication cookie
  const { test } = await auth.$context;
  const { cookies } = await test.login({ userId: user.id });
  await context.addCookies(cookies);

  return user;
}
