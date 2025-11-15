import type { Event, Team, User } from '@conference-hall/database';
import { eventSpeakerFactory } from '@conference-hall/database/tests/factories/event-speakers.ts';
import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { proposalFactory } from '@conference-hall/database/tests/factories/proposals.ts';
import { talkFactory } from '@conference-hall/database/tests/factories/talks.ts';
import { teamFactory } from '@conference-hall/database/tests/factories/team.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { expect, loginWith, test } from '../../helpers/fixtures.ts';
import { SpeakersListPage } from './speakers-list.page.ts';

let team: Team;
let event: Event;
let speaker1: User;
let speaker2: User;
let speaker3: User;

loginWith('clark-kent');

test.beforeEach(async () => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const member = await userFactory({ traits: ['bruce-wayne'] });
  team = await teamFactory({ owners: [user], members: [member] });
  event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  speaker1 = await userFactory({ attributes: { name: 'Alice Johnson', email: 'alice@techcorp.com' } });
  speaker2 = await userFactory({ attributes: { name: 'Bob Wilson', email: 'bob@devinc.com' } });
  speaker3 = await userFactory({ attributes: { name: 'Charlie Brown', email: 'charlie@startupxyz.com' } });

  await proposalFactory({
    event,
    talk: await talkFactory({ speakers: [speaker1] }),
    attributes: {
      deliberationStatus: 'ACCEPTED',
      confirmationStatus: 'CONFIRMED',
    },
  });

  await proposalFactory({
    event,
    talk: await talkFactory({ speakers: [speaker2] }),
    attributes: {
      deliberationStatus: 'ACCEPTED',
      confirmationStatus: 'DECLINED',
    },
  });

  await proposalFactory({
    event,
    talk: await talkFactory({ speakers: [speaker3] }),
    attributes: {
      deliberationStatus: 'PENDING',
    },
  });
});

test('displays speakers list with basic information', async ({ page }) => {
  const speakersPage = new SpeakersListPage(page);
  await speakersPage.goto(team.slug, event.slug);

  // Check the page loads and displays speakers count
  await expect(speakersPage.speakerCount(3)).toBeVisible();
  await expect(speakersPage.speakers).toHaveCount(3);

  // Check all speakers are displayed with correct information
  await expect(speakersPage.speaker('Alice Johnson')).toBeVisible();
  await expect(speakersPage.speaker('Bob Wilson')).toBeVisible();
  await expect(speakersPage.speaker('Charlie Brown')).toBeVisible();
});

test('filters speakers by search query', async ({ page }) => {
  const speakersPage = new SpeakersListPage(page);
  await speakersPage.goto(team.slug, event.slug);

  // Search by name (case insensitive)
  await speakersPage.searchSpeakers('alice');
  await expect(speakersPage.speakerCount(1)).toBeVisible();
  await expect(speakersPage.speaker('Alice Johnson')).toBeVisible();
  await expect(speakersPage.speaker('Bob Wilson')).not.toBeVisible();
  await expect(speakersPage.speaker('Charlie Brown')).not.toBeVisible();

  // Clear search and verify all speakers are shown again
  await speakersPage.clearSearch();
  await expect(speakersPage.speakerCount(3)).toBeVisible();

  // Search by partial name
  await speakersPage.searchSpeakers('brown');
  await expect(speakersPage.speakerCount(1)).toBeVisible();
  await expect(speakersPage.speaker('Charlie Brown')).toBeVisible();
  await expect(speakersPage.speaker('Alice Johnson')).not.toBeVisible();
  await expect(speakersPage.speaker('Bob Wilson')).not.toBeVisible();

  // Search with no results
  await speakersPage.searchSpeakers('nonexistent');
  await expect(speakersPage.speakerSearchEmptyState('nonexistent')).toBeVisible();
  await expect(speakersPage.speakers).toHaveCount(0);

  // Clear search
  await speakersPage.clearSearch();
  await expect(speakersPage.speakerCount(3)).toBeVisible();
});

test('filters speakers by proposal status', async ({ page }) => {
  const speakersPage = new SpeakersListPage(page);
  await speakersPage.goto(team.slug, event.slug);

  // Filter by accepted proposals
  await speakersPage.clickOnProposalStatusFilter('Accepted');
  await expect(speakersPage.speakerCount(2)).toBeVisible();
  await expect(speakersPage.speaker('Alice Johnson')).toBeVisible();
  await expect(speakersPage.speaker('Bob Wilson')).toBeVisible();
  await expect(speakersPage.speaker('Charlie Brown')).not.toBeVisible();
  await expect(speakersPage.filterTag('Accepted')).toBeVisible();

  // Clear filter
  await speakersPage.clickOnClearFilters();
  await expect(speakersPage.speakerCount(3)).toBeVisible();

  // Filter by confirmed proposals
  await speakersPage.clickOnProposalStatusFilter('Confirmed by speaker');
  await expect(speakersPage.speakerCount(1)).toBeVisible();
  await expect(speakersPage.speaker('Alice Johnson')).toBeVisible();
  await expect(speakersPage.speaker('Bob Wilson')).not.toBeVisible();
  await expect(speakersPage.speaker('Charlie Brown')).not.toBeVisible();
  await expect(speakersPage.filterTag('Confirmed by speaker')).toBeVisible();

  // Clear filter
  await speakersPage.clickOnClearFilters();
  await expect(speakersPage.speakerCount(3)).toBeVisible();

  // Filter by declined proposals
  await speakersPage.clickOnProposalStatusFilter('Declined by speaker');
  await expect(speakersPage.speakerCount(1)).toBeVisible();
  await expect(speakersPage.speaker('Bob Wilson')).toBeVisible();
  await expect(speakersPage.speaker('Alice Johnson')).not.toBeVisible();
  await expect(speakersPage.speaker('Charlie Brown')).not.toBeVisible();
  await expect(speakersPage.filterTag('Declined by speaker')).toBeVisible();

  // Clear filter using filter tag
  await speakersPage.removeFilterTag('Declined by speaker');
  await expect(speakersPage.speakerCount(3)).toBeVisible();
});

test('sorts speakers by name', async ({ page }) => {
  const speakersPage = new SpeakersListPage(page);
  await speakersPage.goto(team.slug, event.slug);

  // Default sorting should be A-Z (Alice, Bob, Charlie)
  await expect(speakersPage.speakers.nth(0)).toContainText('Alice Johnson');
  await expect(speakersPage.speakers.nth(1)).toContainText('Bob Wilson');
  await expect(speakersPage.speakers.nth(2)).toContainText('Charlie Brown');

  // Sort by name Z-A
  await speakersPage.clickOnSortBy('Name Z-A');
  await expect(speakersPage.speakers.nth(0)).toContainText('Charlie Brown');
  await expect(speakersPage.speakers.nth(1)).toContainText('Bob Wilson');
  await expect(speakersPage.speakers.nth(2)).toContainText('Alice Johnson');

  // Sort back to A-Z
  await speakersPage.clickOnSortBy('Name A-Z');
  await expect(speakersPage.speakers.nth(0)).toContainText('Alice Johnson');
  await expect(speakersPage.speakers.nth(1)).toContainText('Bob Wilson');
  await expect(speakersPage.speakers.nth(2)).toContainText('Charlie Brown');
});

test('combines search and filters', async ({ page }) => {
  const speakersPage = new SpeakersListPage(page);
  await speakersPage.goto(team.slug, event.slug);

  // Search for Alice and filter by accepted proposals
  await speakersPage.searchSpeakers('alice');
  await speakersPage.clickOnProposalStatusFilter('Accepted');

  await expect(speakersPage.speakerCount(1)).toBeVisible();
  await expect(speakersPage.speaker('Alice Johnson')).toBeVisible();
  await expect(speakersPage.filterTag('alice')).toBeVisible();
  await expect(speakersPage.filterTag('Accepted')).toBeVisible();

  // Search for Bob with accepted filter still active
  await speakersPage.searchSpeakers('bob');
  await expect(speakersPage.speakerCount(1)).toBeVisible();
  await expect(speakersPage.speaker('Bob Wilson')).toBeVisible();
  await expect(speakersPage.filterTag('bob')).toBeVisible();
  await expect(speakersPage.filterTag('Accepted')).toBeVisible();

  // Clear all filters
  await speakersPage.clickOnClearFilters();
  await expect(speakersPage.speakerCount(3)).toBeVisible();
});

test('navigates to speaker detail page when clicking on speaker', async ({ page }) => {
  const speakersPage = new SpeakersListPage(page);
  await speakersPage.goto(team.slug, event.slug);

  // Click on Alice Johnson's speaker card
  await speakersPage.clickOnSpeaker('Alice Johnson');

  // Should navigate to Alice's speaker detail page
  await expect(page.getByText('Alice Johnson')).toBeVisible();
  await expect(page.getByText(/Proposals \(\d+\)/)).toBeVisible();

  // Check URL contains the speaker page path
  await expect(page).toHaveURL(new RegExp(`/team/${team.slug}/${event.slug}/speakers/[a-z0-9]+`));
});

test('displays empty state when no speakers exist', async ({ page }) => {
  // Create an event with no speakers
  const emptyEvent = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const speakersPage = new SpeakersListPage(page);
  await speakersPage.goto(team.slug, emptyEvent.slug);

  await expect(speakersPage.page.getByText('No speakers yet')).toBeVisible();
  await expect(
    speakersPage.page.getByText('Speakers will appear here once they submit proposals to your event.'),
  ).toBeVisible();
  await expect(speakersPage.speakers).toHaveCount(0);
});

test('pagination works with many speakers', async ({ page }) => {
  // Create additional speakers to test pagination (need more than 20 for pagination)
  const additionalSpeakers = [];
  for (let i = 4; i <= 25; i++) {
    const speaker = await userFactory({
      attributes: {
        name: `Speaker ${i.toString().padStart(2, '0')}`,
        company: `Company ${i}`,
      },
    });
    additionalSpeakers.push(speaker);
    await eventSpeakerFactory({ event, user: speaker });
  }

  const speakersPage = new SpeakersListPage(page);
  await speakersPage.goto(team.slug, event.slug);

  // Should show total count and pagination
  await expect(speakersPage.speakerCount(25)).toBeVisible();
  await expect(speakersPage.speakers).toHaveCount(20); // First page shows 20

  // Check pagination controls and text exist
  await expect(speakersPage.page.getByText(/Showing .* to .* of 25 results/)).toBeVisible();

  // Navigate to second page
  await speakersPage.page.getByRole('link', { name: '2', exact: true }).click();
  await expect(speakersPage.speakers).toHaveCount(5); // Second page shows remaining 5

  // Navigate back to first page
  await speakersPage.page.getByRole('link', { name: '1', exact: true }).click();
  await expect(speakersPage.speakers).toHaveCount(20);
});
