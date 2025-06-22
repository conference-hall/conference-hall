import type { Event, EventSpeaker, Team, User } from '@prisma/client';
import { eventSpeakerFactory } from 'tests/factories/event-speakers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { SpeakerPage } from './speaker.page.ts';

let team: Team;
let event: Event;
let speaker: User;
let eventSpeaker: EventSpeaker;

loginWith('clark-kent');

test.beforeEach(async () => {
  await flags.set('speakersPage', true);

  const owner = await userFactory({ traits: ['clark-kent'] });
  speaker = await userFactory({
    attributes: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      bio: 'Experienced React developer.',
      company: 'Tech Corp',
      references: 'Previous speaking engagements at ReactConf.',
    },
  });

  team = await teamFactory({ owners: [owner] });
  event = await eventFactory({ team, traits: ['conference-cfp-open'] });
  eventSpeaker = await eventSpeakerFactory({ event, user: speaker });
});

test.describe('Speaker Page', () => {
  test('displays speaker profile', async ({ page }) => {
    const speakerPage = new SpeakerPage(page);
    await speakerPage.goto(team.slug, event.slug, eventSpeaker.id);

    await expect(page.getByText('Alice Johnson')).toBeVisible();
    await expect(page.getByText('Tech Corp')).toBeVisible();
    await expect(speakerPage.proposalsHeader).toBeVisible();

    await expect(speakerPage.referencesSection).toBeVisible();
    await speakerPage.expandReferences();
    await expect(page.getByText('Previous speaking engagements')).toBeVisible();

    await expect(page.getByText('Proposals (0)')).toBeVisible();
    await expect(speakerPage.emptyState).toBeVisible();
  });

  test('displays proposals with status badges', async ({ page }) => {
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, attributes: { title: 'React Hooks Talk' } });

    const speakerPage = new SpeakerPage(page);
    await speakerPage.goto(team.slug, event.slug, eventSpeaker.id);

    await expect(page.getByText('Proposals (1)')).toBeVisible();
    await expect(page.getByText('React Hooks Talk')).toBeVisible();

    await speakerPage.clickProposal('React Hooks Talk');
    await expect(page).toHaveURL(`/team/${team.slug}/${event.slug}/reviews/${proposal.id}?speakers=${eventSpeaker.id}`);
  });

  test('shows 404 for non-existent speaker', async ({ page }) => {
    await page.goto(`/team/${team.slug}/${event.slug}/speakers/non-existent-id`);
    await expect(page.getByText(/404|Not Found/i)).toBeVisible();
  });
});
