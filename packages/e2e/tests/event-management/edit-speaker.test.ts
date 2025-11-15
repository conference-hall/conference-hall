import type { Event, EventSpeaker, Team } from 'prisma/generated/client.ts';
import { eventSpeakerFactory } from 'tests/factories/event-speakers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../helpers/fixtures.ts';
import { EditSpeakerPage } from './speaker-form.page.ts';

let team: Team;
let event: Event;
let eventSpeaker: EventSpeaker;

loginWith('clark-kent');

test.beforeEach(async () => {
  const user = await userFactory({ traits: ['clark-kent'] });
  team = await teamFactory({ owners: [user] });
  event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const speakerUser = await userFactory({
    attributes: {
      email: 'original@example.com',
      name: 'Original Speaker',
      picture: 'https://example.com/original-photo.jpg',
      bio: 'Original bio content',
      company: 'Original Company',
      location: 'Original Location',
    },
  });
  eventSpeaker = await eventSpeakerFactory({ event, user: speakerUser });
});

test('edits speaker successfully with all fields', async ({ page }) => {
  const editSpeakerPage = new EditSpeakerPage(page);
  await editSpeakerPage.goto(team.slug, event.slug, eventSpeaker.id, 'Original Speaker');

  const updatedData = {
    email: 'updated@example.com',
    name: 'Updated Speaker Name',
    picture: 'https://example.com/updated-photo.jpg',
    company: 'Updated Tech Corp',
    location: 'Updated City, CA',
    bio: 'Updated biography with new experience and achievements.',
    references: 'Updated references from recent conferences.',
    socialLinks: ['https://github.com/updated', 'https://twitter.com/updated'],
  };

  await editSpeakerPage.fillSpeakerForm(updatedData);
  await editSpeakerPage.submitForm();

  // Should redirect to speaker detail page
  await expect(page.getByText('Updated Speaker Name')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/team/${team.slug}/${event.slug}/speakers/${eventSpeaker.id}`));

  // Should show success toast
  await expect(editSpeakerPage.toast).toHaveText('Speaker updated successfully.');
});

test('edits speaker with minimal changes', async ({ page }) => {
  const editSpeakerPage = new EditSpeakerPage(page);
  await editSpeakerPage.goto(team.slug, event.slug, eventSpeaker.id, 'Original Speaker');

  const updatedData = {
    name: 'Just Updated Name',
  };

  await editSpeakerPage.fillSpeakerForm(updatedData);
  await editSpeakerPage.submitForm();

  // Should redirect to speaker detail page
  await expect(page.getByText('Just Updated Name')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/team/${team.slug}/${event.slug}/speakers/${eventSpeaker.id}`));

  // Should show success toast
  await expect(editSpeakerPage.toast).toHaveText('Speaker updated successfully.');
});

test('prevents updating speaker with duplicate email', async ({ page }) => {
  // Create another speaker with an email we'll try to duplicate
  const anotherUser = await userFactory({
    attributes: { email: 'existing@example.com', name: 'Existing Speaker' },
  });
  await eventSpeakerFactory({ event, user: anotherUser });

  const editSpeakerPage = new EditSpeakerPage(page);
  await editSpeakerPage.goto(team.slug, event.slug, eventSpeaker.id, 'Original Speaker');

  await editSpeakerPage.fillSpeakerForm({
    email: 'existing@example.com',
  });
  await editSpeakerPage.submitForm();

  // Should display duplicate email error
  await expect(page.getByText('A speaker with this email address already exists for this event.')).toBeVisible();

  // Should stay on the edit form page
  await expect(page.getByRole('heading', { name: 'Edit speaker Original Speaker' })).toBeVisible();
});

test('cancels speaker editing and returns to detail page', async ({ page }) => {
  const editSpeakerPage = new EditSpeakerPage(page);
  await editSpeakerPage.goto(team.slug, event.slug, eventSpeaker.id, 'Original Speaker');

  // Make some changes
  await editSpeakerPage.fillSpeakerForm({
    name: 'Changed Name',
  });

  // Cancel the edit
  await editSpeakerPage.cancel();

  // Should return to speaker detail page without saving changes
  await expect(page.getByRole('heading').filter({ hasText: 'Original Speaker' })).toBeVisible(); // Original name should still be there
  await expect(page).toHaveURL(new RegExp(`/team/${team.slug}/${event.slug}/speakers/${eventSpeaker.id}`));
});
