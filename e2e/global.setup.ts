import { test as setup } from './fixtures.ts';
import { storeSessionCookie } from './helpers.ts';

setup('Store session cookie for authentication', async () => {
  await storeSessionCookie();
});
