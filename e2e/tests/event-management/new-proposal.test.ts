import type { Event, Team } from '@prisma/client';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { NewProposalPage } from './new-proposal.page.ts';
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

test('creates new proposal as organizer', async ({ page }) => {
  const proposalsPage = new ProposalsListPage(page);
  await proposalsPage.goto(team.slug, event.slug);

  await expect(proposalsPage.newProposalButton).toBeVisible();

  await proposalsPage.clickOnNewProposal();

  const newProposalPage = new NewProposalPage(page);
  await newProposalPage.waitFor();

  await expect(newProposalPage.titleInput).toBeVisible();
  await expect(newProposalPage.abstractTextarea).toBeVisible();
  await expect(newProposalPage.submitButton).toBeVisible();
  await expect(newProposalPage.cancelButton).toBeVisible();

  await newProposalPage.fillProposalForm({
    title: 'E2E Test Proposal',
    abstract: 'This is a test proposal created during e2e testing.',
    level: 'intermediate',
    references: 'https://example.com/references',
  });

  await expect(newProposalPage.titleInput).toHaveValue('E2E Test Proposal');
  await expect(newProposalPage.abstractTextarea).toHaveValue('This is a test proposal created during e2e testing.');
  await expect(newProposalPage.intermediateRadio).toBeChecked();
  await expect(newProposalPage.referencesTextarea).toHaveValue('https://example.com/references');
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
