import type { Event } from 'prisma/generated/client.ts';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { EventPage } from './event.page.ts';

let eventOpen: Event;
let eventFuture: Event;
let eventPast: Event;

loginWith('clark-kent');

test.beforeEach(async ({ page }) => {
  userFactory({ traits: ['clark-kent'] });
  eventOpen = await eventFactory({
    attributes: {
      name: 'Devfest Nantes',
      location: 'Nantes, France',
      description: 'The event !',
      conferenceStart: '2020-10-05T00:00:00.000Z',
      conferenceEnd: '2020-10-05T00:00:00.000Z',
      websiteUrl: 'https://devfest.gdgnantes.com',
      contactEmail: 'contact@example.com',
      codeOfConductUrl: 'https://devfest.gdgnantes.com/cod.html',
      migrationId: 'legacy-event-id',
    },
    traits: ['conference-cfp-open'],
  });
  await eventFormatFactory({ event: eventOpen, attributes: { name: 'F1', description: 'Description F1' } });
  await eventCategoryFactory({ event: eventOpen, attributes: { name: 'C1', description: 'Description C1' } });
  eventFuture = await eventFactory({ traits: ['conference-cfp-future'] });
  eventPast = await eventFactory({ traits: ['conference-cfp-past'] });

  await page.clock.install({ time: new Date('2021-03-14T00:00:00') });
});

test('displays event page', async ({ page }) => {
  const eventPage = new EventPage(page);

  await test.step('with CFP open', async () => {
    await eventPage.goto(eventOpen.slug, eventOpen.name);
    await expect(page.getByText('Nantes, France')).toBeVisible();
    await expect(page.getByText('October 05, 2020')).toBeVisible();
    await expect(page.getByText('Call for papers open')).toBeVisible();
    await expect(page.getByText('The event !')).toBeVisible();
    await expect(eventPage.websiteLink).toHaveAttribute('href', 'https://devfest.gdgnantes.com');
    await expect(eventPage.contactsLink).toHaveAttribute('href', 'mailto:contact@example.com');
    await expect(eventPage.codeOfConductLink).toHaveAttribute('href', 'https://devfest.gdgnantes.com/cod.html');
    await expect(page.getByText('F1', { exact: true })).toBeVisible();
    await expect(page.getByText('Description F1')).toBeVisible();
    await expect(page.getByText('C1', { exact: true })).toBeVisible();
    await expect(page.getByText('Description C1')).toBeVisible();

    const submissionPage = await eventPage.clickOnSubmitButton();
    await expect(submissionPage.selectionStep).toBeVisible();
  });

  await test.step('with CFP in the future', async () => {
    await eventPage.goto(eventFuture.slug, eventFuture.name);
    await expect(page.getByText('The call for papers will open in 80 years')).toBeVisible();
  });

  await test.step('with CFP in the past', async () => {
    await eventPage.goto(eventPast.slug, eventPast.name);
    await expect(page.getByText('Call for papers closed')).toBeVisible();
  });

  await test.step('with legacy URL', async () => {
    await eventPage.gotoLegacyUrl(eventOpen.migrationId, eventOpen.name);
    await expect(page.getByRole('heading', { name: 'Devfest Nantes' })).toBeVisible();
  });

  await test.step('with not found event', async () => {
    await page.goto('/not-fount-event');
    await expect(page.getByText('Event not found')).toBeVisible();
  });
});
