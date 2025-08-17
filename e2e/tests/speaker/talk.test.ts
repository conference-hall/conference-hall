import type { Event, Talk, User } from 'prisma/generated/client.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { SubmissionPage } from '../event-participation/submission.page.ts';
import { TalkPage } from './talk.page.ts';

let user: User;
let event1: Event;
let event2: Event;
let talk: Talk & { speakers: User[] };

test.beforeEach(async () => {
  const coSpeaker = await userFactory({ traits: ['bruce-wayne'] });
  user = await userFactory({ traits: ['clark-kent'] });
  event1 = await eventFactory({ attributes: { name: 'Devfest Nantes' }, traits: ['conference-cfp-open'] });
  event2 = await eventFactory({ traits: ['meetup-cfp-open'] });
  talk = await talkFactory({
    speakers: [user, coSpeaker],
    attributes: { abstract: 'My talk abstract', references: 'My talk references' },
  });
  await proposalFactory({ event: event1, talk });
});

loginWith('clark-kent');

test('displays and manages a talk', async ({ page }) => {
  const talkPage = new TalkPage(page);
  await talkPage.goto(talk.id);

  await test.step('displays the talk details', async () => {
    await expect(page.getByRole('heading', { name: talk.title })).toBeVisible();

    await expect(talkPage.speakers).toHaveCount(3);
    await expect(talkPage.speaker('Clark Kent')).toBeVisible();
    await expect(talkPage.speaker('Bruce Wayne')).toBeVisible();

    await expect(page.getByText('My talk abstract')).toBeVisible();
    await expect(page.getByText('Intermediate')).toBeVisible();
    await expect(page.getByText('English')).toBeVisible();

    await talkPage.clickOnReferences();
    await expect(page.getByText('My talk references')).toBeVisible();
  });

  await test.step('can archive and restore a talk', async () => {
    await talkPage.clickOnArchiveTalk();
    await expect(talkPage.toast).toHaveText('Talk archived.');

    await talkPage.clickOnRestoreTalk();
    await expect(talkPage.toast).toHaveText('Talk restored.');
  });

  await test.step('can invite and remove a co-speaker', async () => {
    await talkPage.clickOnAddSpeaker();
    await expect(talkPage.inviteCoSpeaker).toBeVisible();
    await talkPage.closeModal();

    const cospeaker = await talkPage.clickOnSpeaker('Bruce Wayne');
    await cospeaker.waitFor();
    await cospeaker.clickOnRemoveSpeaker('Bruce Wayne');
    await expect(talkPage.toast).toHaveText('Co-speaker removed from talk.');
  });

  await test.step('displays the submitted proposals', async () => {
    await expect(talkPage.submissions).toHaveCount(2); // TODO: the footer list should not be an <li>
    const proposalListPage = await talkPage.clickOnSubmission('Devfest Nantes');

    await expect(proposalListPage.proposals).toHaveCount(1);
    await expect(proposalListPage.proposal(talk.title)).toBeVisible();
  });
});

test('edits a talk', async ({ page }) => {
  const talkPage = new TalkPage(page);
  await talkPage.goto(talk.id);

  const talkEdit = await talkPage.clickOnEditTalk();
  await talkEdit.waitFor();

  await test.step('displays original talk values', async () => {
    await expect(talkEdit.titleInput).toHaveValue(talk.title);
    await expect(talkEdit.abstractInput).toHaveValue(talk.abstract);
    await expect(talkEdit.radioInput('Intermediate')).toBeChecked();
    await expect(talkEdit.languageSelect.selected('English')).toBeVisible();
  });

  await test.step('edits the talk', async () => {
    await talkEdit.fillForm('New title', 'New abstract', 'ADVANCED', 'fr', 'New references');
    await talkEdit.save();
    await expect(talkEdit.toast).toHaveText('Talk updated.');
    // TODO: add component tests for errors on mandatory fields
  });

  await test.step('checks edited talk values', async () => {
    await expect(page.getByRole('main').getByRole('heading', { name: 'New title' })).toBeVisible();
    await expect(page.getByRole('main').getByRole('paragraph').filter({ hasText: 'New abstract' })).toBeVisible();
    await expect(page.getByRole('main').getByText('Advanced')).toBeVisible();
    await expect(page.getByRole('main').getByText('French')).toBeVisible();
    await expect(page.getByRole('main').getByText('English')).toBeVisible();

    await talkPage.clickOnReferences();
    await expect(page.getByRole('main').getByText('New references')).toBeVisible();
  });
});

test('submits a talk', async ({ page }) => {
  const talkPage = new TalkPage(page);
  await talkPage.goto(talk.id);

  const homePage = await talkPage.clickOnSubmitTalk();
  await homePage.waitFor();

  await homePage.clickOnEvent(event2.name);
  const submissionPage = new SubmissionPage(page);
  await expect(submissionPage.proposalStep).toBeVisible();
});

test('cannot submit a talk already submitted', async ({ page }) => {
  const talkPage = new TalkPage(page);
  await talkPage.goto(talk.id);

  const homePage = await talkPage.clickOnSubmitTalk();
  await homePage.waitFor();

  await homePage.clickOnEvent(event1.name);
  const submissionPage = new SubmissionPage(page);
  await expect(submissionPage.alreadySubmittedError).toBeVisible();
});
