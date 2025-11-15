import type { Event, Team } from '@conference-hall/database';
import { eventSpeakerFactory } from '@conference-hall/database/tests/factories/event-speakers.ts';
import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { teamFactory } from '@conference-hall/database/tests/factories/team.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { expect, loginWith, test } from '../../helpers/fixtures.ts';
import { NewSpeakerPage } from './speaker-form.page.ts';

let team: Team;
let event: Event;

loginWith('clark-kent');

test.beforeEach(async () => {
  const user = await userFactory({ traits: ['clark-kent'] });
  team = await teamFactory({ owners: [user] });
  event = await eventFactory({ team, traits: ['conference-cfp-open'] });
});

test('creates a new speaker successfully with all fields', async ({ page }) => {
  const newSpeakerPage = new NewSpeakerPage(page);
  await newSpeakerPage.goto(team.slug, event.slug);

  const speakerData = {
    email: 'john.doe@example.com',
    name: 'John Doe',
    picture: 'https://example.com/photo.jpg',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    bio: 'Experienced software developer with 10+ years in web development.',
    references: 'Previously spoke at DevConf 2023 and TechSummit 2022.',
    socialLinks: ['https://github.com/johndoe', 'https://twitter.com/johndoe'],
  };

  await newSpeakerPage.fillSpeakerForm(speakerData);
  await newSpeakerPage.submitForm();

  // Should redirect to speaker detail page
  await expect(page.getByText('John Doe')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/team/${team.slug}/${event.slug}/speakers/[a-z0-9]+`));

  // Should show success toast
  await expect(newSpeakerPage.toast).toHaveText('Speaker created successfully.');
});

test('creates a new speaker with minimal required fields', async ({ page }) => {
  const newSpeakerPage = new NewSpeakerPage(page);
  await newSpeakerPage.goto(team.slug, event.slug);

  const speakerData = {
    email: 'minimal@example.com',
    name: 'Minimal Speaker',
  };

  await newSpeakerPage.fillSpeakerForm(speakerData);
  await newSpeakerPage.submitForm();

  // Should redirect to speaker detail page
  await expect(page.getByText('Minimal Speaker')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/team/${team.slug}/${event.slug}/speakers/[a-z0-9]+`));
});

test('prevents creating speaker with duplicate email', async ({ page }) => {
  const existingUser = await userFactory({
    attributes: { email: 'duplicate@example.com', name: 'Existing Speaker' },
  });
  await eventSpeakerFactory({ event, user: existingUser });

  const newSpeakerPage = new NewSpeakerPage(page);
  await newSpeakerPage.goto(team.slug, event.slug);

  await newSpeakerPage.fillSpeakerForm({
    email: 'duplicate@example.com',
    name: 'New Speaker',
  });
  await newSpeakerPage.submitForm();

  // Should display duplicate email error
  await expect(page.getByText('A speaker with this email address already exists for this event.')).toBeVisible();

  // Should stay on the form page
  await expect(newSpeakerPage.heading).toBeVisible();
});
