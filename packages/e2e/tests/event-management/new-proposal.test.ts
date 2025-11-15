import type { Event, Team } from '@conference-hall/database';
import { eventCategoryFactory } from '@conference-hall/database/tests/factories/categories.ts';
import { eventSpeakerFactory } from '@conference-hall/database/tests/factories/event-speakers.ts';
import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { eventFormatFactory } from '@conference-hall/database/tests/factories/formats.ts';
import { eventProposalTagFactory } from '@conference-hall/database/tests/factories/proposal-tags.ts';
import { teamFactory } from '@conference-hall/database/tests/factories/team.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { expect, loginWith, test } from '../../helpers/fixtures.ts';
import { NewProposalPage } from './new-proposal.page.ts';
import { ProposalPage } from './proposal.page.ts';
import { ProposalsListPage } from './proposals-list.page.ts';

let team: Team;
let event: Event;

loginWith('clark-kent');

test.beforeEach(async () => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const member = await userFactory({ traits: ['bruce-wayne'] });
  const reviewer = await userFactory({ traits: ['peter-parker'] });

  team = await teamFactory({ owners: [user], members: [member], reviewers: [reviewer] });
  event = await eventFactory({ team, traits: ['conference-cfp-open'] });
  await eventFormatFactory({ event, attributes: { name: 'Format 1' } });
  await eventCategoryFactory({ event, attributes: { name: 'Category 1' } });
  await eventProposalTagFactory({ event, attributes: { name: 'Tag 1' } });
  await eventSpeakerFactory({ event, attributes: { name: 'John Existing Speaker' } });
});

test('creates new proposal as organizer', async ({ page }) => {
  const proposalsPage = new ProposalsListPage(page);
  await proposalsPage.goto(team.slug, event.slug);

  await proposalsPage.clickOnNewProposal();

  const newProposalPage = new NewProposalPage(page);
  await newProposalPage.waitFor();

  // Fill talk form
  await newProposalPage.talkForm.fillForm(
    'E2E Test Proposal',
    'This is a test proposal',
    'intermediate',
    'English',
    'https://example.com/references',
  );

  // Verify talk form values
  await expect(newProposalPage.talkForm.titleInput).toHaveValue('E2E Test Proposal');
  await expect(newProposalPage.talkForm.abstractInput).toHaveValue('This is a test proposal');
  await expect(newProposalPage.talkForm.intermediateRadio).toBeChecked();
  await expect(newProposalPage.talkForm.referencesInput).toHaveValue('https://example.com/references');

  // Create a speaker for the proposal
  await newProposalPage.speakerPanel.togglePanel();
  const createSpeakerModal = await newProposalPage.speakerPanel.clickCreateSpeaker();
  await createSpeakerModal.emailInput.fill('new.speaker@example.com');
  await createSpeakerModal.nameInput.fill('Jane New Speaker');
  await createSpeakerModal.companyInput.fill('New Speaker Company');
  await createSpeakerModal.bioInput.fill('This is a bio for the new speaker');
  await createSpeakerModal.createSpeaker();

  // Search and select a speaker
  await newProposalPage.speakerPanel.togglePanel();
  await newProposalPage.speakerPanel.searchSpeaker('John');
  await newProposalPage.speakerPanel.selectSpeakerByName('John Existing Speaker');
  await newProposalPage.speakerPanel.togglePanel();

  // Select format
  await newProposalPage.formatsButton.click();
  await page.getByRole('option', { name: 'Format 1' }).click();
  await newProposalPage.formatsButton.click();

  // Select category
  await newProposalPage.categoriesButton.click();
  await page.getByRole('option', { name: 'Category 1' }).click();
  await newProposalPage.categoriesButton.click();

  // Select tag
  await newProposalPage.tagsButton.click();
  await page.getByRole('option', { name: 'Tag 1' }).click();
  await newProposalPage.tagsButton.click();

  // Submit proposal
  await newProposalPage.submitProposal();
  await expect(newProposalPage.toast).toHaveText('Proposal created successfully.');

  // Check created proposal
  const proposalPage = new ProposalPage(page);
  await expect(page.getByRole('heading', { name: 'E2E Test Proposal' })).toBeVisible();
  await expect(page.getByText('This is a test proposal')).toBeVisible();
  await expect(page.getByText('Intermediate')).toBeVisible();
  await expect(page.getByText('Format 1')).toBeVisible();
  await expect(page.getByText('Category 1')).toBeVisible();
  await expect(page.getByText('Tag 1')).toBeVisible();
  await expect(page.getByText('Jane New Speaker')).toBeVisible();
  await expect(page.getByText('John Existing Speaker')).toBeVisible();
  await proposalPage.referencesToggle.click();
  await expect(page.getByText('https://example.com/references')).toBeVisible();
});

test('cancels new proposal creation', async ({ page }) => {
  const proposalsPage = new ProposalsListPage(page);
  await proposalsPage.goto(team.slug, event.slug);

  await proposalsPage.clickOnNewProposal();

  const newProposalPage = new NewProposalPage(page);
  await newProposalPage.waitFor();

  await newProposalPage.cancel();
  await proposalsPage.waitFor();

  await expect(proposalsPage.heading).toBeVisible();
});

test.describe('As a member', () => {
  loginWith('bruce-wayne');

  test('can see new proposal button', async ({ page }) => {
    const proposalsPage = new ProposalsListPage(page);
    await proposalsPage.goto(team.slug, event.slug);

    await expect(proposalsPage.newProposalButton).toBeVisible();
  });
});

test.describe('As a reviewer', () => {
  loginWith('peter-parker');

  test('cannot see new proposal button', async ({ page }) => {
    const proposalsPage = new ProposalsListPage(page);
    await proposalsPage.goto(team.slug, event.slug);

    await expect(proposalsPage.newProposalButton).not.toBeVisible();
  });
});

test('creates proposal with preselected speaker', async ({ page }) => {
  const existingSpeaker = await eventSpeakerFactory({
    event,
    attributes: { name: 'Preselected Speaker', email: 'preselected@example.com' },
  });

  const newProposalPage = new NewProposalPage(page);
  await newProposalPage.goto(team.slug, event.slug, existingSpeaker.id);

  await newProposalPage.verifyPreselectedSpeaker('Preselected Speaker');

  await newProposalPage.talkForm.fillForm(
    'Proposal with Preselected Speaker',
    'This proposal should have the speaker preselected',
    'beginner',
    'English',
    'https://example.com/speaker-refs',
  );

  await newProposalPage.submitProposal();
  await expect(newProposalPage.toast).toHaveText('Proposal created successfully.');

  await expect(page.getByRole('heading', { name: 'Proposal with Preselected Speaker' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View Preselected Speaker' })).toBeVisible();
});

test('handles invalid speaker id gracefully', async ({ page }) => {
  const newProposalPage = new NewProposalPage(page);
  await newProposalPage.goto(team.slug, event.slug, 'invalid-speaker-id');

  await newProposalPage.waitFor();
  await expect(newProposalPage.heading).toBeVisible();

  await newProposalPage.talkForm.fillForm(
    'Proposal without Speaker',
    'This proposal should work even with invalid speaker ID',
    'beginner',
    'English',
    'https://example.com/refs',
  );

  await newProposalPage.speakerPanel.togglePanel();
  const createSpeakerModal = await newProposalPage.speakerPanel.clickCreateSpeaker();
  await createSpeakerModal.emailInput.fill('manual.speaker@example.com');
  await createSpeakerModal.nameInput.fill('Manual Speaker');
  await createSpeakerModal.companyInput.fill('Manual Company');
  await createSpeakerModal.bioInput.fill('Manual bio');
  await createSpeakerModal.createSpeaker();

  await newProposalPage.submitProposal();
  await expect(newProposalPage.toast).toHaveText('Proposal created successfully.');
});
