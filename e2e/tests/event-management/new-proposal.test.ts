import type { Event, Team } from '@prisma/client';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { NewProposalPage } from './new-proposal.page.ts';
import { ProposalPage } from './proposal.page.ts';
import { ProposalsListPage } from './proposals-list.page.ts';

let team: Team;
let event: Event;

loginWith('clark-kent');

test.beforeEach(async () => {
  await flags.set('organizerProposalCreation', true);

  const user = await userFactory({ traits: ['clark-kent'] });
  const member = await userFactory({ traits: ['bruce-wayne'] });
  const reviewer = await userFactory({ traits: ['peter-parker'] });

  team = await teamFactory({ owners: [user], members: [member], reviewers: [reviewer] });
  event = await eventFactory({ team, traits: ['conference-cfp-open'] });
  await eventFormatFactory({ event, attributes: { name: 'Format 1' } });
  await eventCategoryFactory({ event, attributes: { name: 'Category 1' } });
});

test.skip('creates new proposal as organizer', async ({ page }) => {
  const proposalsPage = new ProposalsListPage(page);
  await proposalsPage.goto(team.slug, event.slug);

  await expect(proposalsPage.newProposalButton).toBeVisible();

  await proposalsPage.clickOnNewProposal();

  const newProposalPage = new NewProposalPage(page);
  await newProposalPage.waitFor();

  await newProposalPage.talkForm.fillForm(
    'E2E Test Proposal',
    'This is a test proposal',
    'intermediate',
    'English',
    'https://example.com/references',
  );

  await expect(newProposalPage.talkForm.titleInput).toHaveValue('E2E Test Proposal');
  await expect(newProposalPage.talkForm.abstractInput).toHaveValue('This is a test proposal');
  await expect(newProposalPage.talkForm.intermediateRadio).toBeChecked();
  await expect(newProposalPage.talkForm.referencesInput).toHaveValue('https://example.com/references');

  await newProposalPage.submitButton.click();
  await expect(newProposalPage.toast).toHaveText('Proposal created successfully.');

  const proposalPage = new ProposalPage(page);
  proposalPage.waitFor('E2E Test Proposal');
  await expect(page.getByRole('heading', { name: 'E2E Test Proposal' })).toBeVisible();
});

test.skip('cancels new proposal creation', async ({ page }) => {
  const proposalsPage = new ProposalsListPage(page);
  await proposalsPage.goto(team.slug, event.slug);

  await proposalsPage.clickOnNewProposal();

  const newProposalPage = new NewProposalPage(page);
  await newProposalPage.waitFor();

  await newProposalPage.cancel();
  await proposalsPage.waitFor();

  await expect(proposalsPage.heading).toBeVisible();
});

test.describe.skip('As a member', () => {
  loginWith('bruce-wayne');

  test('can see new proposal button', async ({ page }) => {
    const proposalsPage = new ProposalsListPage(page);
    await proposalsPage.goto(team.slug, event.slug);

    await expect(proposalsPage.newProposalButton).toBeVisible();
  });
});

test.describe.skip('As a reviewer', () => {
  loginWith('peter-parker');

  test('cannot see new proposal button', async ({ page }) => {
    const proposalsPage = new ProposalsListPage(page);
    await proposalsPage.goto(team.slug, event.slug);

    await expect(proposalsPage.newProposalButton).not.toBeVisible();
  });
});
