import { eventSpeakerFactory } from 'tests/factories/event-speakers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { db } from '../../../prisma/db.server.ts';
import type { Event, Team, User } from '../../../prisma/generated/client.ts';
import { expect, test } from '../../fixtures.ts';
import { userLoggedFactory } from '../../helpers.ts';
import { PageObject } from '../../page-object.ts';

let team: Team;
let event: Event;
let organizer: User;

test.beforeEach(async ({ context }) => {
  organizer = await userLoggedFactory(context);
  team = await teamFactory({ owners: [organizer] });
  event = await eventFactory({ team });
});

test('adds an account from the speakers page and makes it available for proposals', async ({ page }) => {
  const user = await userFactory({ attributes: { name: 'Existing Speaker', email: 'speaker@example.com' } });
  await page.goto(`/team/${team.slug}/${event.slug}/speakers`);
  await new PageObject(page).waitForHydration();
  await page.getByRole('link', { name: 'Add existing speaker' }).click();

  await page.getByLabel('Email address', { exact: true }).fill('SPEAKER@example.com');
  await page.getByRole('button', { name: 'Add speaker', exact: true }).click();

  await expect(page).toHaveURL(new RegExp(`/team/${team.slug}/${event.slug}/speakers/[a-z0-9]+`));
  await expect(page.getByText('Existing Speaker', { exact: true })).toBeVisible();
  const speaker = await db.eventSpeaker.findFirstOrThrow({ where: { eventId: event.id, userId: user.id } });
  expect(speaker.bio).toBe(user.bio);

  const response = await page.request.get(`/team/${team.slug}/${event.slug}/autocomplete?kind=speakers&query=Existing`);
  expect(await response.json()).toContainEqual(expect.objectContaining({ id: speaker.id, name: user.name }));
});

test('offers adding an account from the manual creation page', async ({ page }) => {
  await page.goto(`/team/${team.slug}/${event.slug}/speakers/new`);
  await new PageObject(page).waitForHydration();
  await page.getByRole('link', { name: 'Add existing speaker' }).click();

  await expect(page.getByRole('heading', { name: 'Add existing speaker' })).toBeVisible();
  await page.getByRole('link', { name: 'Cancel' }).click();
  await expect(page).toHaveURL(`/team/${team.slug}/${event.slug}/speakers`);
});

test('shows an email error when the account cannot be found', async ({ page }) => {
  await page.goto(`/team/${team.slug}/${event.slug}/speakers/add`);
  await new PageObject(page).waitForHydration();
  await page.getByLabel('Email address', { exact: true }).fill('missing@example.com');
  await page.getByRole('button', { name: 'Add speaker', exact: true }).click();

  await expect(page.getByText("No matching account found. Check the speaker's account email.")).toBeVisible();
  await expect(page.getByLabel('Email address', { exact: true })).toHaveValue('missing@example.com');
  expect(await db.eventSpeaker.count({ where: { eventId: event.id } })).toBe(0);
});

test('reports email conflicts without linking or replacing a manual speaker', async ({ page }) => {
  const user = await userFactory();
  const manualSpeaker = await eventSpeakerFactory({ event, attributes: { email: user.email } });
  await page.goto(`/team/${team.slug}/${event.slug}/speakers/add`);
  await new PageObject(page).waitForHydration();
  await page.getByLabel('Email address', { exact: true }).fill(user.email);
  await page.getByRole('button', { name: 'Add speaker', exact: true }).click();

  await expect(page.getByText('A speaker with this email address already exists for this event.')).toBeVisible();
  expect(await db.eventSpeaker.findUnique({ where: { id: manualSpeaker.id } })).toEqual(manualSpeaker);
});

test('opens the existing event speaker without overwriting organizer changes', async ({ page }) => {
  const user = await userFactory();
  const speaker = await eventSpeakerFactory({ event, user, attributes: { name: 'Name for this event' } });
  await page.goto(`/team/${team.slug}/${event.slug}/speakers/add`);
  await new PageObject(page).waitForHydration();
  await page.getByLabel('Email address', { exact: true }).fill(user.email);
  await page.getByRole('button', { name: 'Add speaker', exact: true }).click();

  await expect(page).toHaveURL(`/team/${team.slug}/${event.slug}/speakers/${speaker.id}`);
  await expect(page.getByText('Name for this event', { exact: true })).toBeVisible();
  expect(await db.eventSpeaker.count({ where: { eventId: event.id } })).toBe(1);
});

test('rejects malformed email addresses submitted directly', async ({ page }) => {
  const response = await page.request.post(`/team/${team.slug}/${event.slug}/speakers/add`, {
    form: { email: 'invalid-email' },
  });

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('Invalid email');
  expect(await db.eventSpeaker.count({ where: { eventId: event.id } })).toBe(0);
});

test('prevents reviewers from accessing or posting to the add-account form', async ({ page }) => {
  const user = await userFactory();
  await db.teamMember.update({
    where: { memberId_teamId: { memberId: organizer.id, teamId: team.id } },
    data: { role: 'REVIEWER' },
  });
  const url = `/team/${team.slug}/${event.slug}/speakers/add`;

  const getResponse = await page.request.get(url);
  const postResponse = await page.request.post(url, { form: { email: user.email } });

  expect(getResponse.status()).toBe(403);
  expect(postResponse.status()).toBe(403);
  expect(await db.eventSpeaker.count({ where: { eventId: event.id } })).toBe(0);
});
