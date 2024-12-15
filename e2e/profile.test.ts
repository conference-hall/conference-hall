import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from './setup/fixtures.ts';

loginWith('clark-kent');

test('displays speaker profile', async ({ page }) => {
  await userFactory({ traits: ['clark-kent'] });

  await page.goto('/speaker/profile');

  const heading = page.getByRole('heading', { name: 'Personal information' });

  await expect(heading).toBeVisible();
});
