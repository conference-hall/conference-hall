import { eventFactory } from 'tests/factories/events.ts';
import { HomePage } from './page-objects/home.page.ts';
import { expect, test } from './setup/fixtures.ts';

test.beforeAll(async () => {
  await eventFactory({
    attributes: { name: 'Devfest Nantes', slug: 'devfest-nantes', location: 'Nantes, France' },
    traits: ['conference-cfp-open'],
  });
  await eventFactory({
    attributes: { name: 'GDG Nantes', slug: 'gdg-nantes', location: 'Nantes, France' },
    traits: ['meetup-cfp-open'],
  });
});

test('display and search events', async ({ page }) => {
  const homepage = new HomePage(page);
  await homepage.goto();

  await expect(homepage.results).toHaveCount(2);
  await expect(homepage.item(/Devfest Nantes/)).toBeVisible();
  await expect(homepage.item(/GDG Nantes/)).toBeVisible();

  await homepage.search('devfest');
  await expect(homepage.results).toHaveCount(1);
  await expect(homepage.item(/Devfest Nantes/)).toBeVisible();
  await expect(page.url()).toContain('?query=devfest');

  await homepage.search('gdg');
  await expect(homepage.results).toHaveCount(1);
  await expect(homepage.item(/GDG Nantes/)).toBeVisible();
  await expect(page.url()).toContain('?query=gdg');

  await homepage.search('nothing');
  await expect(homepage.noResults).toBeVisible();
});

test('open event page', async ({ page }) => {
  const homepage = new HomePage(page);
  await homepage.goto();

  const eventPage = await homepage.openEventPage(/Devfest Nantes/);
  await expect(eventPage.heading('Devfest Nantes')).toBeVisible();
});
