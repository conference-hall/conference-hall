import type { Event, EventCategory, EventFormat, EventProposalTag, Proposal, Team } from '@prisma/client';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { eventProposalTagFactory } from 'tests/factories/proposal-tags.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { ProposalsListPage } from './proposals-list.page.ts';

let team: Team;
let event: Event;
let format1: EventFormat;
let category1: EventCategory;
let tag: EventProposalTag;
let proposal1: Proposal;
let proposal2: Proposal;
let proposal3: Proposal;

loginWith('clark-kent');

test.beforeEach(async () => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const member = await userFactory({ traits: ['bruce-wayne'] });
  const reviewer = await userFactory({ traits: ['peter-parker'] });
  team = await teamFactory({ owners: [user], members: [member], reviewers: [reviewer] });
  event = await eventFactory({ team, traits: ['conference-cfp-open'] });
  tag = await eventProposalTagFactory({ event });
  format1 = await eventFormatFactory({ event, attributes: { name: 'Format 1' } });
  category1 = await eventCategoryFactory({ event, attributes: { name: 'Category 1' } });
  const format2 = await eventFormatFactory({ event, attributes: { name: 'Format 2' } });
  const category2 = await eventCategoryFactory({ event, attributes: { name: 'Category 2' } });
  const speaker1 = await userFactory({ attributes: { name: 'Robin' } });
  const speaker2 = await userFactory({ attributes: { name: 'Johnny' } });
  proposal1 = await proposalFactory({
    event,
    formats: [format1],
    categories: [category1],
    tags: [tag],
    talk: await talkFactory({ speakers: [speaker1], attributes: { title: 'First' } }),
  });
  proposal2 = await proposalFactory({
    event,
    traits: ['accepted'],
    formats: [format2],
    categories: [category2],
    talk: await talkFactory({ speakers: [speaker2], attributes: { title: 'Second' } }),
  });
  proposal3 = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1, speaker2] }) });
  await reviewFactory({ proposal: proposal1, user, attributes: { note: 5, feeling: 'POSITIVE' } });
  await reviewFactory({ proposal: proposal2, user, attributes: { note: 2, feeling: 'NEUTRAL' } });
});

test('displays and filters proposals', async ({ page }) => {
  const proposalsPage = new ProposalsListPage(page);
  await proposalsPage.goto(team.slug, event.slug);

  // check the list of proposals
  await expect(proposalsPage.proposalCount(3)).toBeVisible();
  await expect(proposalsPage.proposals).toHaveCount(3);
  await expect(proposalsPage.proposal(proposal1.title)).toBeVisible();
  await expect(proposalsPage.proposal(proposal2.title)).toBeVisible();
  await expect(proposalsPage.proposal(proposal3.title)).toBeVisible();

  // filter by title
  await proposalsPage.searchInput.fill('first');
  await page.keyboard.press('Enter');
  await expect(proposalsPage.proposalCount(1)).toBeVisible();
  await expect(proposalsPage.proposal(proposal1.title)).toBeVisible();
  await proposalsPage.clickOnClearFilters();
  await expect(proposalsPage.proposalCount(3)).toBeVisible();

  // filter by speaker name
  await proposalsPage.searchInput.fill('johnny');
  await page.keyboard.press('Enter');
  await expect(proposalsPage.proposalCount(2)).toBeVisible();
  await expect(proposalsPage.proposal(proposal2.title)).toBeVisible();
  await expect(proposalsPage.proposal(proposal3.title)).toBeVisible();
  await proposalsPage.clickOnClearFilters();
  await expect(proposalsPage.proposalCount(3)).toBeVisible();

  // filter by "reviewed" proposals
  await proposalsPage.clickOnReviewFilter('Reviewed');
  await expect(proposalsPage.proposalCount(2)).toBeVisible();
  await expect(proposalsPage.proposal(proposal1.title)).toBeVisible();
  await expect(proposalsPage.proposal(proposal2.title)).toBeVisible();
  await proposalsPage.clickOnClearFilters();
  await expect(proposalsPage.proposalCount(3)).toBeVisible();

  // filter by "not reviewed" proposals
  await proposalsPage.clickOnReviewFilter('Not reviewed');
  await expect(proposalsPage.proposalCount(1)).toBeVisible();
  await expect(proposalsPage.proposal(proposal3.title)).toBeVisible();
  await proposalsPage.clickOnClearFilters();
  await expect(proposalsPage.proposalCount(3)).toBeVisible();

  // filter by "my favorites" proposals
  await proposalsPage.clickOnReviewFilter('My favorites');
  await expect(proposalsPage.proposalCount(1)).toBeVisible();
  await expect(proposalsPage.proposal(proposal1.title)).toBeVisible();
  await proposalsPage.clickOnClearFilters();
  await expect(proposalsPage.proposalCount(3)).toBeVisible();

  // filter by "accepted" proposals
  await proposalsPage.clickOnStatusFilter('Accepted');
  await expect(proposalsPage.proposalCount(1)).toBeVisible();
  await expect(proposalsPage.proposal(proposal2.title)).toBeVisible();
  await proposalsPage.clickOnClearFilters();
  await expect(proposalsPage.proposalCount(3)).toBeVisible();

  // filter by format
  await proposalsPage.clickOnFormatFilter(format1.name);
  await expect(proposalsPage.proposalCount(1)).toBeVisible();
  await expect(proposalsPage.proposal(proposal1.title)).toBeVisible();
  await proposalsPage.clickOnClearFilters();
  await expect(proposalsPage.proposalCount(3)).toBeVisible();

  // filter by category
  await proposalsPage.clickOnCategoryFilter(category1.name);
  await expect(proposalsPage.proposalCount(1)).toBeVisible();
  await expect(proposalsPage.proposal(proposal1.title)).toBeVisible();
  await proposalsPage.clickOnClearFilters();
  await expect(proposalsPage.proposalCount(3)).toBeVisible();

  // filter by tag
  await proposalsPage.clickOnTagFilter(tag.name);
  await expect(proposalsPage.proposalCount(1)).toBeVisible();
  await expect(proposalsPage.proposal(proposal1.title)).toBeVisible();
  await proposalsPage.clickOnClearFilters();
  await expect(proposalsPage.proposalCount(3)).toBeVisible();

  // sort by oldest
  await proposalsPage.clickOnSortBy('Oldest');
  await expect(proposalsPage.proposals).toHaveCount(3);

  // open a proposal
  const proposalPage = await proposalsPage.clickOnProposal(proposal1.title);
  await proposalPage.waitFor(proposal1.title);
});

test('changes proposal statuses', async ({ page }) => {
  const proposalsPage = new ProposalsListPage(page);

  // mark as accepted
  await proposalsPage.goto(team.slug, event.slug);
  await proposalsPage.clickOnProposalCheckbox(proposal1.title);
  await proposalsPage.clickOnProposalCheckbox(proposal3.title);
  await expect(proposalsPage.proposalSelectedCount(2)).toBeVisible();
  await proposalsPage.clickOnMarkAs('Accepted');
  await expect(proposalsPage.toast).toHaveText('2 proposals marked as "accepted".');

  // mark as pending
  await proposalsPage.goto(team.slug, event.slug);
  await proposalsPage.clickOnProposalCheckbox(proposal2.title);
  await expect(proposalsPage.proposalSelectedCount(1)).toBeVisible();
  await proposalsPage.clickOnMarkAs('Not deliberated');
  await expect(proposalsPage.toast).toHaveText('1 proposals marked as "pending".');

  // mark as rejected
  await proposalsPage.goto(team.slug, event.slug);
  await proposalsPage.clickOnProposalCheckbox(proposal1.title);
  await proposalsPage.clickOnProposalCheckbox(proposal3.title);
  await expect(proposalsPage.proposalSelectedCount(2)).toBeVisible();
  await proposalsPage.clickOnMarkAs('Rejected');
  await expect(proposalsPage.toast).toHaveText('2 proposals marked as "rejected".');
});

test('exports proposals', async ({ page }) => {
  const proposalsPage = new ProposalsListPage(page);
  await proposalsPage.goto(team.slug, event.slug);

  await proposalsPage.clickOnExport();
  await expect(page.getByRole('menuitem', { name: 'As JSON' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'As printable cards' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'To OpenPlanner' })).not.toBeVisible();
});

test('exports proposals with OpenPlanner integration', async ({ page }) => {
  const event2 = await eventFactory({ team, traits: ['conference-cfp-open', 'withIntegration'] });

  const proposalsPage = new ProposalsListPage(page);
  await proposalsPage.goto(team.slug, event2.slug);

  await proposalsPage.clickOnExport();
  await expect(page.getByRole('menuitem', { name: 'As JSON' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'As printable cards' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'To OpenPlanner' })).toBeVisible();
});

test.describe('As a member', () => {
  loginWith('bruce-wayne');

  test('cannot export proposals', async ({ page }) => {
    const proposalsPage = new ProposalsListPage(page);
    await proposalsPage.goto(team.slug, event.slug);

    await expect(proposalsPage.exportButton).not.toBeVisible();
  });
});

test.describe('As a reviewer', () => {
  loginWith('peter-parker');

  test('cannot export proposals', async ({ page }) => {
    const proposalsPage = new ProposalsListPage(page);
    await proposalsPage.goto(team.slug, event.slug);

    await expect(proposalsPage.exportButton).not.toBeVisible();
  });
});
