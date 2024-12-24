import type { Event, Proposal } from '@prisma/client';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { ProposalPage } from './proposal.page.ts';

let event: Event;
let proposal1: Proposal;
let proposal2: Proposal;
let proposal3: Proposal;

test.beforeEach(async () => {
  const speaker1 = await userFactory({ traits: ['clark-kent'] });
  const speaker2 = await userFactory({ traits: ['bruce-wayne'] });

  event = await eventFactory({ traits: ['conference', 'conference-cfp-open'] });
  const format = await eventFormatFactory({ event, attributes: { name: 'Quickie' } });
  await eventFormatFactory({ event, attributes: { name: 'Workshop' } });
  const category = await eventCategoryFactory({ event, attributes: { name: 'Web' } });
  await eventCategoryFactory({ event, attributes: { name: 'Cloud' } });

  const talk = await talkFactory({
    speakers: [speaker1, speaker2],
    attributes: { abstract: 'My abstract', references: 'My references' },
  });
  const talk2 = await talkFactory({ speakers: [speaker1, speaker2], attributes: { title: 'My talk 2' } });
  const talk3 = await talkFactory({ speakers: [speaker1], attributes: { title: 'My talk 3' } });
  const talk4 = await talkFactory({ speakers: [speaker1], attributes: { title: 'My talk 4' } });

  proposal1 = await proposalFactory({ event, talk, formats: [format], categories: [category] });
  proposal2 = await proposalFactory({ event: event, talk: talk2, traits: ['draft'] });
  proposal3 = await proposalFactory({ event: event, talk: talk3, traits: ['accepted-published'] });
  await proposalFactory({ event: event, talk: talk4, traits: ['rejected-published'] });
});

loginWith('clark-kent');

test('displays a proposal', async ({ page }) => {
  const proposalPage = new ProposalPage(page);
  await proposalPage.goto(event.slug, proposal1.id);

  await expect(page.getByRole('heading', { name: proposal1.title })).toBeVisible();

  await expect(proposalPage.speakers).toHaveCount(3);
  await expect(proposalPage.speaker('Clark Kent')).toBeVisible();
  await expect(proposalPage.speaker('Bruce Wayne')).toBeVisible();

  await expect(page.getByText('My abstract')).toBeVisible();
  await expect(page.getByText('Intermediate')).toBeVisible();
  await expect(page.getByText('English')).toBeVisible();
  await expect(page.getByText('Quickie')).toBeVisible();
  await expect(page.getByText('Web')).toBeVisible();

  await proposalPage.clickOnReferences();
  await expect(page.getByText('My references')).toBeVisible();
});

test('edits a proposal', async ({ page }) => {
  const proposalPage = new ProposalPage(page);
  await proposalPage.goto(event.slug, proposal1.id);

  await test.step('can invite and remove a co-speaker', async () => {
    await proposalPage.clickOnAddSpeaker();
    await expect(proposalPage.inviteCoSpeaker).toBeVisible();
    await proposalPage.closeModal();

    const cospeaker = await proposalPage.clickOnSpeaker('Bruce Wayne');
    await cospeaker.waitFor();
    await cospeaker.clickOnRemoveSpeaker('Bruce Wayne');
    await expect(proposalPage.toast).toHaveText('Co-speaker removed from proposal.');
  });

  const talkEdit = await proposalPage.clickOnEditTalk();
  await talkEdit.waitFor();

  await test.step('displays original talk values', async () => {
    await expect(talkEdit.titleInput).toHaveValue(proposal1.title);
    await expect(talkEdit.abstractInput).toHaveValue(proposal1.abstract);
    await expect(talkEdit.radioInput('Intermediate')).toBeChecked();
    await expect(talkEdit.radioInput('Quickie')).toBeChecked();
    await expect(talkEdit.radioInput('Web')).toBeChecked();
    await expect(talkEdit.languageSelect).toHaveText('English');
  });

  await test.step('edits the talk', async () => {
    await talkEdit.fillForm('New title', 'New abstract', 'ADVANCED', 'fr', 'New references');
    await talkEdit.radioInput('Cloud').click();
    await talkEdit.radioInput('Workshop').click();
    await talkEdit.save();
    await expect(talkEdit.toast).toHaveText('Proposal saved.');
  });

  await test.step('checks edited talk values', async () => {
    await talkEdit.waitFor();
    await expect(page.getByRole('heading', { name: 'New title' })).toBeVisible();
    await expect(page.getByText('New abstract')).toBeVisible();
    await expect(page.getByText('Advanced')).toBeVisible();
    await expect(page.getByText('French')).toBeVisible();
    await expect(page.getByText('English')).toBeVisible();
    await expect(page.getByText('Workshop')).toBeVisible();
    await expect(page.getByText('Cloud')).toBeVisible();

    await proposalPage.clickOnReferences();
    await expect(page.getByText('New references')).toBeVisible();
  });
});

test('removes a proposal submission', async ({ page }) => {
  const proposalPage = new ProposalPage(page);
  await proposalPage.goto(event.slug, proposal1.id);

  await proposalPage.clickOnRemoveProposal();
  await proposalPage.closeModal();
  await expect(proposalPage.removeConfirmationDialog).not.toBeVisible();

  await proposalPage.clickOnRemoveProposal();
  const proposalListPage = await proposalPage.clickOnConfirmRemoveProposal();
  await expect(proposalPage.toast).toHaveText('Proposal submission removed.');
  await proposalListPage.waitFor();
});

test('submits a draft proposal', async ({ page }) => {
  const proposalPage = new ProposalPage(page);
  await proposalPage.goto(event.slug, proposal2.id);

  await expect(page.getByText('Draft proposal!')).toBeVisible();
  const submissionPage = await proposalPage.clickOnContinueSubmission();
  await expect(submissionPage.proposalStep).toBeVisible();
});

test('confirms a participation', async ({ page }) => {
  const proposalPage = new ProposalPage(page);
  await proposalPage.goto(event.slug, proposal3.id);

  await expect(page.getByText(`Proposal has been accepted to ${event.name}!`)).toBeVisible();
  await proposalPage.clickOnConfirmation();
  await expect(proposalPage.toast).toHaveText('Your response has been sent to organizers.');
  await expect(page.getByText(`Your participation to ${event.name} is confirmed, Thanks!`)).toBeVisible();
});

test('declines a participation', async ({ page }) => {
  const proposalPage = new ProposalPage(page);
  await proposalPage.goto(event.slug, proposal3.id);

  await expect(page.getByText(`Proposal has been accepted to ${event.name}!`)).toBeVisible();
  await proposalPage.clickOnDecline();
  await expect(proposalPage.toast).toHaveText('Your response has been sent to organizers.');
  await expect(page.getByText(`You have declined this proposal for ${event.name}.`)).toBeVisible();
});
