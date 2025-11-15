import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { expect, test } from '../../helpers/fixtures.ts';
import { HomePage } from './home.page.ts';

test.beforeEach(async () => {
  await eventFactory({ attributes: { name: 'Devfest Nantes' }, traits: ['conference-cfp-open'] });
  await eventFactory({ attributes: { name: 'GDG Nantes' }, traits: ['meetup-cfp-open'] });
});

test('display and search events', async ({ page }) => {
  const homepage = new HomePage(page);
  await homepage.goto();

  await expect(homepage.results).toHaveCount(2);
  await expect(homepage.item('Devfest Nantes')).toBeVisible();
  await expect(homepage.item('GDG Nantes')).toBeVisible();

  await homepage.search('devfest');
  await expect(homepage.results).toHaveCount(1);
  await expect(homepage.item('Devfest Nantes')).toBeVisible();
  await expect(page.url()).toContain('?query=devfest');

  await homepage.search('gdg');
  await expect(homepage.results).toHaveCount(1);
  await expect(homepage.item('GDG Nantes')).toBeVisible();
  await expect(page.url()).toContain('?query=gdg');

  await homepage.search('nothing');
  await expect(homepage.noResults).toBeVisible();
});

test('filter events', async ({ page }) => {
  const homepage = new HomePage(page);
  await homepage.goto();

  await homepage.filterConferences();
  await expect(homepage.results).toHaveCount(1);
  await expect(homepage.item('Devfest Nantes')).toBeVisible();

  await homepage.filterMeetups();
  await expect(homepage.results).toHaveCount(1);
  await expect(homepage.item('GDG Nantes')).toBeVisible();

  await homepage.filterAll();
  await expect(homepage.results).toHaveCount(2);
  await expect(homepage.item('Devfest Nantes')).toBeVisible();
  await expect(homepage.item('GDG Nantes')).toBeVisible();
});

test('open event page', async ({ page }) => {
  const homepage = new HomePage(page);
  await homepage.goto();

  const eventPage = await homepage.clickOnEvent('Devfest Nantes');
  await expect(eventPage.heading('Devfest Nantes')).toBeVisible();
});
