import type { Event, Proposal, Team } from '@prisma/client';
import { expect, loginWith, test } from 'e2e/fixtures.ts';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { commentFactory } from 'tests/factories/comments.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { eventProposalTagFactory } from 'tests/factories/proposal-tags.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { surveyFactory } from 'tests/factories/surveys.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ProposalPage } from './proposal.page.ts';

loginWith('clark-kent');

let team: Team;
let event: Event;
let event2: Event;
let proposal: Proposal;
let proposal2: Proposal;

test.beforeEach(async () => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const reviewer = await userFactory({ traits: ['bruce-wayne'] });
  team = await teamFactory({ owners: [user], reviewers: [reviewer] });
  event = await eventFactory({ team, traits: ['conference-cfp-open', 'withSurveyConfig'] });
  const format1 = await eventFormatFactory({ event, attributes: { name: 'Format 1' } });
  const format2 = await eventFormatFactory({ event, attributes: { name: 'Format 2' } });
  const category1 = await eventCategoryFactory({ event, attributes: { name: 'Category 1' } });
  const category2 = await eventCategoryFactory({ event, attributes: { name: 'Category 2' } });
  const tag1 = await eventProposalTagFactory({ event, attributes: { name: 'Tag 1' } });
  await eventProposalTagFactory({ event, attributes: { name: 'Tag 2' } });
  const speaker1 = await userFactory({
    attributes: {
      name: 'Marie Jane',
      email: 'marie@example.com',
      bio: 'MJ Bio',
      references: 'MJ References',
      location: 'Nantes',
      company: 'MJ Corp',
      socialLinks: ['https://github.com/mj'],
    },
  });
  const speaker2 = await userFactory({ attributes: { name: 'Robin' } });
  proposal = await proposalFactory({
    event,
    formats: [format1],
    categories: [category1],
    tags: [tag1],
    talk: await talkFactory({
      attributes: {
        title: 'Talk 1',
        abstract: 'Talk description',
        level: 'ADVANCED',
        references: 'My talk references',
        languages: ['fr'],
      },
      speakers: [speaker1, speaker2],
    }),
  });
  await proposalFactory({
    event,
    traits: ['accepted'],
    formats: [format2],
    categories: [category2],
    talk: await talkFactory({ attributes: { title: 'Talk 2' }, speakers: [speaker2] }),
  });
  await surveyFactory({
    event,
    user: speaker1,
    attributes: { answers: { accomodation: 'yes', transports: ['taxi', 'train'], info: 'Love you' } },
  });
  await reviewFactory({ proposal, user: reviewer, attributes: { note: 3, feeling: 'NEUTRAL' } });
  await commentFactory({
    proposal,
    user: reviewer,
    attributes: { channel: 'ORGANIZER', comment: 'Hello world' },
    traits: ['withReaction'],
  });
  event2 = await eventFactory({
    team,
    attributes: {
      displayProposalsReviews: false,
      displayProposalsSpeakers: false,
      reviewEnabled: false,
    },
  });
  proposal2 = await proposalFactory({
    attributes: { id: 'proposal-2' },
    event: event2,
    traits: ['accepted'],
    talk: await talkFactory({ attributes: { title: 'Talk 3' }, speakers: [speaker1, speaker2] }),
  });
});

test('displays proposal data and review the proposal', async ({ page }) => {
  const proposalPage = new ProposalPage(page);
  await proposalPage.goto(team.slug, event.slug, proposal.id, proposal.title);

  // Check proposal values
  await expect(page.getByText(proposal.title)).toBeVisible();
  await expect(page.getByText('Advanced')).toBeVisible();
  await expect(page.getByText('French')).toBeVisible();
  await expect(page.getByText('Talk description')).toBeVisible();
  await expect(page.getByText('Format 1')).toBeVisible();
  await expect(page.getByText('Category 1')).toBeVisible();
  await expect(page.getByText('Marie Jane')).toBeVisible();
  await expect(page.getByText('Robin')).toBeVisible();
  await proposalPage.referencesToggle.click();
  await expect(page.getByText('My talk references')).toBeVisible();
  await proposalPage.otherProposalsToggle.click();
  await expect(page.getByText('Talk 2')).toBeVisible();

  // Review proposal
  await expect(page.getByLabel('Review: 3 (Score)')).toBeVisible();
  await page.getByRole('radio', { name: 'Love it' }).click();
  await expect(page.getByLabel('Review: 4 (Score)')).toBeVisible();

  // Check activity feed
  await expect(proposalPage.activityFeed).toHaveCount(3);
  const first = await proposalPage.activityFeed.nth(0);
  const second = await proposalPage.activityFeed.nth(1);
  const third = await proposalPage.activityFeed.nth(2);
  await expect(first).toContainText('Bruce Wayne reviewed the proposal with 3 stars.');
  await expect(second).toContainText('Bruce Wayne commented');
  await expect(second).toContainText('Hello world');
  await expect(third).toContainText('Clark Kent reviewed the proposal with 5 stars.');

  // Add a reaction on comment
  await second.getByRole('button', { name: 'Select a reaction' }).click();
  await page.getByRole('button', { name: 'Thumbs up' }).click();
  await expect(second.getByRole('button', { name: 'Thumbs up' })).toBeVisible();

  // Add a comment
  await proposalPage.fill(proposalPage.commentInput, 'This is a new comment');
  await proposalPage.commentButton.click();
  await expect(proposalPage.activityFeed).toHaveCount(4);
  const fourth = await proposalPage.activityFeed.nth(3);
  await expect(fourth).toContainText('Clark Kent commented');
  await expect(fourth).toContainText('This is a new comment');

  // Delete a comment
  await fourth.getByRole('button', { name: 'delete' }).click();
  await expect(proposalPage.activityFeed).toHaveCount(3);

  // Check speaker profile
  await proposalPage.speaker('Marie Jane').click();
  await expect(page.getByRole('heading', { name: 'Marie Jane' })).toBeVisible();
  await expect(page.getByText('MJ Corp')).toBeVisible();
  await expect(page.getByText('marie@example.com')).toBeVisible();
  await expect(page.getByText('MJ Bio')).toBeVisible();
  await expect(page.getByText('MJ References')).toBeVisible();
  await expect(page.getByText('Nantes')).toBeVisible();
  await expect(page.getByText('Yes')).toBeVisible();
  await expect(page.getByText('Taxi, Train')).toBeVisible();
  await expect(page.getByText('Love you')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
});

test('navigates between proposals', async ({ page }) => {
  const proposalPage = new ProposalPage(page);
  await proposalPage.goto(team.slug, event.slug, proposal.id, proposal.title);

  // Previous proposal
  await proposalPage.previousProposal.click();
  await expect(page.getByText('1/2')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Talk 2' })).toBeVisible();

  // Next proposal
  await proposalPage.nextProposal.click();
  await expect(page.getByText('2/2')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Talk 1' })).toBeVisible();
});

test('deliberates the proposal', async ({ page }) => {
  const proposalPage = new ProposalPage(page);
  await proposalPage.goto(team.slug, event.slug, proposal.id, proposal.title);

  // Default deliberation status
  await expect(proposalPage.deliberationStatus).toContainText('Not deliberated');
  await expect(proposalPage.publishButton).not.toBeVisible();

  // Deliberate as accepted
  await proposalPage.deliberationStatus.click();
  await page.getByRole('option', { name: 'Accepted' }).click();
  await expect(proposalPage.deliberationStatus).toContainText('Accepted');
  await expect(proposalPage.publishButton).toBeVisible();

  // Publish accepted result
  await proposalPage.publishButton.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Publish result to speakers' }).click();
  await expect(proposalPage.deliberationStatus).toContainText('Waiting for speaker confirmation');

  // Deliberate as rejected - handle confirmation dialog for published proposals
  page.on('dialog', (dialog) => dialog.accept());
  await proposalPage.deliberationStatus.click();
  await page.getByRole('option', { name: 'Rejected' }).click();
  await expect(proposalPage.deliberationStatus).toContainText('Rejected');
  await expect(proposalPage.publishButton).toBeVisible();

  // Publish rejected result
  await proposalPage.publishButton.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Publish result to speakers' }).click();
  await expect(proposalPage.deliberationStatus).toContainText('Rejected');
});

test('manage tags', async ({ page }) => {
  const proposalPage = new ProposalPage(page);
  await proposalPage.goto(team.slug, event.slug, proposal.id, proposal.title);

  // Check default tags
  await expect(page.getByText('Tag 1')).toBeVisible();
  await expect(page.getByText('Tag 2')).not.toBeVisible();

  // Select tags
  await proposalPage.tagsButton.click();
  await page.getByRole('option', { name: 'Tag 1' }).click();
  await page.getByRole('option', { name: 'Tag 2' }).click();
  await proposalPage.tagsButton.click();

  // Check default tags
  await expect(page.getByText('Tag 1')).not.toBeVisible();
  await expect(page.getByText('Tag 2')).toBeVisible();
});

test('edit proposal', async ({ page }) => {
  const proposalPage = new ProposalPage(page);
  await proposalPage.goto(team.slug, event.slug, proposal.id, proposal.title);

  const talkEdit = await proposalPage.clickOnEdit();
  await talkEdit.waitFor();

  // check original talk values'
  await expect(talkEdit.titleInput).toHaveValue(proposal.title);
  await expect(talkEdit.abstractInput).toHaveValue(proposal.abstract);
  await expect(talkEdit.radioInput('Advanced')).toBeChecked();
  await expect(talkEdit.radioInput('Format 1')).toBeChecked();
  await expect(talkEdit.radioInput('Category 1')).toBeChecked();
  await expect(talkEdit.languageSelect.selected('French')).toBeVisible();

  // edits the talk
  await talkEdit.waitFor();
  await talkEdit.fillForm('New title', 'New abstract', 'BEGINNER', 'English', 'New references');
  await talkEdit.radioInput('Format 2').click();
  await talkEdit.radioInput('Category 2').click();
  await talkEdit.save();
  await expect(talkEdit.toast).toHaveText('Proposal saved.');

  // checks edited talk values
  await expect(page.getByRole('main').getByRole('heading', { name: 'New title' })).toBeVisible();
  await expect(page.getByRole('main').getByRole('paragraph').filter({ hasText: 'New abstract' })).toBeVisible();
  await expect(page.getByRole('main').getByText('Beginner')).toBeVisible();
  await expect(page.getByRole('main').getByText('French')).toBeVisible();
  await expect(page.getByRole('main').getByText('English')).toBeVisible();
  await expect(page.getByRole('main').getByText('Format 2')).toBeVisible();
  await expect(page.getByRole('main').getByText('Category 2')).toBeVisible();

  await proposalPage.referencesToggle.click();
  await expect(page.getByText('New references')).toBeVisible();
});

test('hides reviews, speakers following event settings', async ({ page }) => {
  const proposalPage = new ProposalPage(page);
  await proposalPage.goto(team.slug, event2.slug, proposal2.id, proposal2.title);

  await expect(page.getByRole('heading', { name: 'Your review' })).not.toBeVisible();
  await expect(page.getByText('Marie Jane')).not.toBeVisible();
  await expect(page.getByText('Robin')).not.toBeVisible();
});

test.describe('As a reviewer', () => {
  loginWith('bruce-wayne');

  test('does not show proposal status panel', async ({ page }) => {
    const proposalPage = new ProposalPage(page);
    await proposalPage.goto(team.slug, event.slug, proposal.id, proposal.title);

    await expect(page.getByRole('heading', { name: 'Proposal status' })).not.toBeVisible();
  });
});
