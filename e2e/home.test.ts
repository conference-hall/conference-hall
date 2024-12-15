import { expect, test } from './setup/fixtures.ts';

test('has title', async ({ page }) => {
  await page.goto('/');

  const heading = page.getByRole('heading', { name: 'Call for papers for conferences and meetups.' });

  await expect(heading).toBeVisible();
});
