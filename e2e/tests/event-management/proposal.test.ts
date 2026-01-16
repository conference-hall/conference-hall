import type { Event, Team, User } from 'prisma/generated/client.ts';
import { MessageBlockComponent } from 'e2e/common/message-block.component.ts';
import { expect, loginWith, test } from 'e2e/fixtures.ts';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { commentFactory } from 'tests/factories/comments.ts';
import { conversationMessageFactory } from 'tests/factories/conversation-messages.ts';
import { conversationFactory } from 'tests/factories/conversations.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { eventProposalTagFactory } from 'tests/factories/proposal-tags.ts';
import { type ProposalFactory, proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { surveyFactory } from 'tests/factories/surveys.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { ProposalPage } from './proposal.page.ts';

let user: User;
let team: Team;
let event: Event;
let event2: Event;
let speaker1: User;
let proposal: ProposalFactory;
let proposal2: ProposalFactory;

test.beforeEach(async () => {
  user = await userFactory({ traits: ['clark-kent'] });
  const reviewer = await userFactory({ traits: ['bruce-wayne'] });
  team = await teamFactory({ owners: [user], reviewers: [reviewer] });

  event = await eventFactory({ team, traits: ['conference-cfp-open', 'withSurveyConfig'] });
  const format1 = await eventFormatFactory({ event, attributes: { name: 'Format 1' } });
  const format2 = await eventFormatFactory({ event, attributes: { name: 'Format 2' } });
  const category1 = await eventCategoryFactory({ event, attributes: { name: 'Category 1' } });
  const category2 = await eventCategoryFactory({ event, attributes: { name: 'Category 2' } });
  const tag1 = await eventProposalTagFactory({ event, attributes: { name: 'Tag 1' } });
  await eventProposalTagFactory({ event, attributes: { name: 'Tag 2' } });

  speaker1 = await userFactory({
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

test.describe('As a owner', () => {
  loginWith('clark-kent');

  test('displays proposal data and review the proposal', async ({ page }) => {
    const proposalPage = new ProposalPage(page);
    await proposalPage.goto(team.slug, event.slug, proposal.routeId, proposal.title);

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
    await expect(proposalPage.activityFeed).toHaveCount(5);
    const first = proposalPage.activityFeed.nth(1);
    const second = proposalPage.activityFeed.nth(2);
    const third = proposalPage.activityFeed.nth(3);
    await expect(first).toContainText('Bruce Wayne reviewed the proposal with 3 stars');
    await expect(second).toContainText('Bruce Wayne');
    await expect(second).toContainText('Hello world');
    await expect(third).toContainText('Clark Kent reviewed the proposal with 5 stars');

    // Add a reaction on comment
    await second.getByRole('button', { name: 'Select a reaction' }).click();
    await page.getByRole('button', { name: 'Thumbs up' }).click();
    await expect(second.getByRole('button', { name: 'Thumbs up' })).toBeVisible();

    // Add a comment
    await proposalPage.fill(proposalPage.commentInput, 'This is a new comment');
    await proposalPage.commentButton.click();
    await expect(proposalPage.activityFeed).toHaveCount(6);
    const fourth = proposalPage.activityFeed.nth(4);
    await expect(fourth).toContainText('Clark Kent');
    await expect(fourth).toContainText('This is a new comment');

    // Delete a comment
    const comment = new MessageBlockComponent(fourth, page);
    await comment.clickDelete();
    await expect(proposalPage.activityFeed).toHaveCount(5);

    // Check speaker profile
    const speakerDrawer = await proposalPage.clickOnSpeaker('Marie Jane');

    await expect(speakerDrawer.getByRole('heading', { name: 'Marie Jane' })).toBeVisible();
    await expect(speakerDrawer.getByText('MJ Corp')).toBeVisible();
    await expect(speakerDrawer.getByText('marie@example.com')).toBeVisible();
    await expect(speakerDrawer.getByText('MJ Bio')).toBeVisible();
    await expect(speakerDrawer.getByText('MJ References')).toBeVisible();
    await expect(speakerDrawer.getByText('Nantes')).toBeVisible();
    await expect(speakerDrawer.getByText('Yes')).toBeVisible();
    await expect(speakerDrawer.getByText('Taxi, Train')).toBeVisible();
    await expect(speakerDrawer.getByText('Love you')).toBeVisible();
    await speakerDrawer.getByRole('button', { name: 'Close' }).click();
  });

  test('navigates between proposals', async ({ page }) => {
    const proposalPage = new ProposalPage(page);
    await proposalPage.goto(team.slug, event.slug, proposal.routeId, proposal.title);

    // Previous proposal
    await proposalPage.previousProposal.click();
    await expect(page.getByText('1/2')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Talk 2' })).toBeVisible();

    // Next proposal
    await proposalPage.nextProposal.click();
    await expect(page.getByText('2/2')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Talk 1' })).toBeVisible();
  });

  test('navigates proposal with proposal id in URL', async ({ page }) => {
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
    await proposalPage.goto(team.slug, event.slug, proposal.routeId, proposal.title);

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
    await proposalPage.goto(team.slug, event.slug, proposal.routeId, proposal.title);

    // Check default tags
    await expect(page.getByText('Tag 1')).toBeVisible();
    await expect(page.getByText('Tag 2')).not.toBeVisible();

    // Select tags
    await proposalPage.tagsButton.click();
    await page.getByRole('listbox').waitFor();
    await page.getByRole('option', { name: 'Tag 1' }).click();
    await page.getByRole('option', { name: 'Tag 2' }).click();
    await proposalPage.tagsButton.click();

    // Check updated tags
    await expect(page.getByText('Tag 1')).not.toBeVisible();
    await expect(page.getByText('Tag 2')).toBeVisible();
  });

  test('manage speakers', async ({ page }) => {
    const proposalPage = new ProposalPage(page);
    await proposalPage.goto(team.slug, event.slug, proposal.routeId, proposal.title);

    // Check default speakers
    await expect(page.getByText('Marie Jane')).toBeVisible();
    await expect(page.getByText('Robin')).toBeVisible();

    // Remove a speaker and add it back
    await proposalPage.speakerPanel.togglePanel();
    await page.getByRole('listbox').waitFor();
    await page.getByRole('option', { name: 'Marie Jane' }).click();
    await proposalPage.speakerPanel.togglePanel();

    // Check speaker removed
    await expect(page.getByText('Marie Jane')).not.toBeVisible();
    await expect(page.getByText('Robin')).toBeVisible();

    // Add speaker back
    await proposalPage.speakerPanel.togglePanel();
    await page.getByRole('listbox').waitFor();
    await page.getByPlaceholder('Search...').fill('Marie');
    await page.getByRole('option', { name: 'Marie Jane' }).click();
    await proposalPage.speakerPanel.togglePanel();

    // Check speaker added back
    await expect(page.getByText('Marie Jane')).toBeVisible();
    await expect(page.getByText('Robin')).toBeVisible();

    // Create a speaker
    await proposalPage.speakerPanel.togglePanel();
    const createSpeakerModal = await proposalPage.speakerPanel.clickCreateSpeaker();
    await createSpeakerModal.emailInput.fill('new.speaker@example.com');
    await createSpeakerModal.nameInput.fill('Jane New Speaker');
    await createSpeakerModal.companyInput.fill('New Speaker Company');
    await createSpeakerModal.bioInput.fill('This is a bio for the new speaker');
    await createSpeakerModal.createSpeaker();
    await expect(page.getByText('Jane New Speaker')).toBeVisible();
  });

  test('manage formats', async ({ page }) => {
    const proposalPage = new ProposalPage(page);
    await proposalPage.goto(team.slug, event.slug, proposal.routeId, proposal.title);

    // Check default format
    await expect(page.getByText('Format 1')).toBeVisible();
    await expect(page.getByText('Format 2')).not.toBeVisible();

    // Change format
    await proposalPage.formatsButton.click();
    await page.getByRole('listbox').waitFor();
    await page.getByRole('option', { name: 'Format 1' }).click();
    await page.getByRole('option', { name: 'Format 2' }).click();
    await proposalPage.formatsButton.click();

    // Check format changed
    await expect(page.getByText('Format 1')).not.toBeVisible();
    await expect(page.getByText('Format 2')).toBeVisible();
  });

  test('manage categories', async ({ page }) => {
    const proposalPage = new ProposalPage(page);
    await proposalPage.goto(team.slug, event.slug, proposal.routeId, proposal.title);

    // Check default category
    await expect(page.getByText('Category 1')).toBeVisible();
    await expect(page.getByText('Category 2')).not.toBeVisible();

    // Change category
    await proposalPage.categoriesButton.click();
    await page.getByRole('listbox').waitFor();
    await page.getByRole('option', { name: 'Category 1' }).click();
    await page.getByRole('option', { name: 'Category 2' }).click();
    await proposalPage.categoriesButton.click();

    // Check category changed
    await expect(page.getByText('Category 1')).not.toBeVisible();
    await expect(page.getByText('Category 2')).toBeVisible();
  });

  test('edit proposal', async ({ page }) => {
    const proposalPage = new ProposalPage(page);
    await proposalPage.goto(team.slug, event.slug, proposal.routeId, proposal.title);

    const talkEdit = await proposalPage.clickOnEdit();
    await talkEdit.waitFor();

    // check original talk values'
    await expect(talkEdit.titleInput).toHaveValue(proposal.title);
    await expect(talkEdit.abstractInput).toHaveValue(proposal.abstract);
    await expect(talkEdit.languageSelect.selected('French')).toBeVisible();

    // edits the talk
    await talkEdit.waitFor();
    await talkEdit.fillForm('New title', 'New abstract', 'BEGINNER', 'English', 'New references');
    await talkEdit.save();
    await expect(talkEdit.toast).toHaveText('Proposal saved.');

    // checks edited talk values
    await expect(page.getByRole('main').getByRole('heading', { name: 'New title' })).toBeVisible();
    await expect(page.getByRole('main').getByRole('paragraph').filter({ hasText: 'New abstract' })).toBeVisible();
    await expect(page.getByRole('main').getByText('Beginner')).toBeVisible();
    await expect(page.getByRole('main').getByText('French')).toBeVisible();
    await expect(page.getByRole('main').getByText('English')).toBeVisible();

    await proposalPage.referencesToggle.click();
    await expect(page.getByText('New references')).toBeVisible();
  });

  test('hides reviews, speakers following event settings', async ({ page }) => {
    const proposalPage = new ProposalPage(page);
    await proposalPage.goto(team.slug, event2.slug, proposal2.routeId, proposal2.title);

    await expect(page.getByRole('heading', { name: 'Global review' })).not.toBeVisible();
    await expect(page.getByText('Marie Jane')).not.toBeVisible();
    await expect(page.getByText('Robin')).not.toBeVisible();
  });

  test('opens speaker details and edit pages from drawer', async ({ page }) => {
    const proposalPage = new ProposalPage(page);

    await proposalPage.goto(team.slug, event.slug, proposal.routeId, proposal.title);
    const speakerDrawer = await proposalPage.clickOnSpeaker('Marie Jane');

    const detailsButton = speakerDrawer.getByRole('link', { name: 'Details' });
    await expect(detailsButton).toBeVisible();
    await detailsButton.click();
    await expect(page.getByRole('heading', { name: 'Marie Jane' })).toBeVisible();

    await proposalPage.goto(team.slug, event.slug, proposal.routeId, proposal.title);
    const speakerDrawer2 = await proposalPage.clickOnSpeaker('Marie Jane');

    const editButton = speakerDrawer2.getByRole('link', { name: 'Edit' });
    await expect(editButton).toBeVisible();
    await editButton.click();
    await expect(page.getByRole('heading', { name: 'Edit speaker Marie Jane' })).toBeVisible();
  });

  test('manages speaker conversation in drawer', async ({ page }) => {
    await flags.set('speakersCommunication', true);

    const proposalPage = new ProposalPage(page);
    const conversation = await conversationFactory({ event, proposalId: proposal.id });
    await conversationMessageFactory({
      conversation,
      sender: speaker1,
      role: 'SPEAKER',
      attributes: { content: 'Hello from speaker' },
    });
    await conversationMessageFactory({
      conversation,
      sender: user,
      role: 'ORGANIZER',
      attributes: { content: 'Hello from organizer' },
    });

    await proposalPage.goto(team.slug, event.slug, proposal.routeId, proposal.title);

    const drawer = await proposalPage.openConversationDrawer();
    await expect(drawer.getByText('Hello from speaker')).toBeVisible();
    await expect(drawer.getByText('Hello from organizer')).toBeVisible();

    await proposalPage.sendMessageInDrawer(drawer, 'New message from organizer');
    await expect(drawer.getByText('New message from organizer')).toBeVisible();

    // We test edit and delete on second message because optimistic rendering
    // make it flaky with playwright automation tests
    const messages = await proposalPage.getConversationMessages(drawer);

    await messages[1].editMessage('Updated message from organizer');
    await expect(drawer.getByText('Updated message from organizer')).toBeVisible();

    await messages[1].clickDelete();
    await expect(drawer.getByText('Updated message from organizer')).not.toBeVisible();
  });

  test('archives and restores a proposal', async ({ page }) => {
    const proposalPage = new ProposalPage(page);
    await proposalPage.goto(team.slug, event.slug, proposal.routeId, proposal.title);

    // Verify proposal is not archived initially
    await expect(page.getByText(/Archived at/)).not.toBeVisible();
    await expect(proposalPage.deliberationStatus).toBeEnabled();

    // Archive the proposal
    await proposalPage.archiveProposal();
    await expect(page.getByText('Proposal archived.')).toBeVisible();

    // Verify proposal is archived
    await expect(page.getByText(/Archived at/)).toBeVisible();
    await expect(proposalPage.deliberationStatus).toBeDisabled();

    // Restore the proposal
    await proposalPage.restoreProposal();
    await expect(page.getByText('Proposal restored.')).toBeVisible();

    // Wait for archived indicator to disappear (ensures page has updated)
    await expect(page.getByText(/Archived at/)).not.toBeVisible();
    await expect(proposalPage.deliberationStatus).toBeEnabled();
  });
});

test.describe('As a reviewer', () => {
  loginWith('bruce-wayne');

  test('does not show proposal status panel', async ({ page }) => {
    const proposalPage = new ProposalPage(page);
    await proposalPage.goto(team.slug, event.slug, proposal.routeId, proposal.title);

    await expect(page.getByRole('heading', { name: 'Proposal status' })).not.toBeVisible();
  });
});
