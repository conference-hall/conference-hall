import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { ProposalListPage } from './proposal-list.page.ts';
import { SubmissionPage } from './submission.page.ts';
import { SurveyPage } from './survey.page.ts';

loginWith('clark-kent');

test('submits a new talk for a conference (full funnel)', async ({ page }) => {
  await userFactory({ traits: ['clark-kent'] });
  const event = await eventFactory({
    attributes: {
      formatsRequired: true,
      categoriesRequired: true,
      formatsAllowMultiple: true,
      categoriesAllowMultiple: true,
    },
    traits: ['conference-cfp-open', 'withSurveyConfig'],
  });
  await eventFormatFactory({ event, attributes: { name: 'Quickie' } });
  await eventCategoryFactory({ event, attributes: { name: 'Web' } });

  const submissionPage = new SubmissionPage(page);
  await submissionPage.goto(event.slug);
  await submissionPage.clickOnNewProposal();

  // Step: talk creation
  await submissionPage.proposalStep.waitFor();
  await submissionPage.fillTalkForm('New title', 'New abstract', 'Beginner', 'French', 'New references');
  await submissionPage.clickOnContinue();

  // Step: speaker
  await submissionPage.speakerStep.waitFor();
  await submissionPage.fillSpeakerForm('New bio');
  await submissionPage.clickOnContinue();

  // Step: tracks
  await submissionPage.tracksStep.waitFor();
  await submissionPage.clickOnContinue();
  await expect(page.getByText('You have to select at least one proposal format.')).toBeVisible();
  await expect(page.getByText('You have to select at least one proposal category.')).toBeVisible();
  await submissionPage.checkboxInput('Quickie').check();
  await submissionPage.checkboxInput('Web').check();
  await submissionPage.clickOnContinue();

  // Step: survey
  await submissionPage.surveyStep.waitFor();
  await submissionPage.radioInput('Yes').check();
  await submissionPage.checkboxInput('Train').check();
  await submissionPage.clickOnContinue();

  // Step: confirmation
  await submissionPage.waitFor('New title');
  await submissionPage.checkboxInput('Please agree with the code of conduct of the event.').check();
  const proposalPage = await submissionPage.clickOnSubmit();
  await expect(submissionPage.toast).toHaveText('Congratulation! Proposal submitted!');

  // Check the proposal details
  await proposalPage.waitFor();
  await expect(proposalPage.speaker('Clark Kent')).toBeVisible();
  await expect(page.getByText('New abstract')).toBeVisible();
  await expect(page.getByText('Beginner')).toBeVisible();
  await expect(page.getByText('French')).toBeVisible();
  await expect(page.getByText('Quickie')).toBeVisible();
  await expect(page.getByText('Web')).toBeVisible();
  await proposalPage.clickOnReferences();
  await expect(page.getByText('New references')).toBeVisible();

  // Check the survey answers
  const surveyPage = new SurveyPage(page);
  await surveyPage.goto(event.slug);
  await expect(surveyPage.radioInput('Yes')).toBeChecked();
  await expect(surveyPage.checkboxInput('Train')).toBeChecked();
});

test('submits an existing talk', async ({ page }) => {
  const speaker1 = await userFactory({ traits: ['clark-kent'] });
  const speaker2 = await userFactory({ traits: ['bruce-wayne'] });
  const talk = await talkFactory({ speakers: [speaker1, speaker2] });
  const event = await eventFactory({ traits: ['conference-cfp-open'] });

  const submissionPage = new SubmissionPage(page);
  await submissionPage.goto(event.slug);

  // Step: talk selection
  await submissionPage.selectionStep.waitFor();
  await submissionPage.clickOnTalk(talk.title);

  // Step: talk editing
  await submissionPage.proposalStep.waitFor();
  await submissionPage.fillTalkForm('Update title', 'Update abstract', 'Beginner', 'French', 'Update references');
  await submissionPage.clickOnContinue();

  // Step: speaker
  await submissionPage.speakerStep.waitFor();
  await expect(submissionPage.speaker('Bruce Wayne')).toBeVisible();
  const cospeaker = await submissionPage.clickOnSpeaker('Bruce Wayne');
  await cospeaker.waitFor();
  await cospeaker.clickOnRemoveSpeaker('Bruce Wayne');
  await expect(submissionPage.speaker('Bruce Wayne')).not.toBeVisible();
  await submissionPage.clickOnAddSpeaker();
  await expect(submissionPage.inviteCoSpeaker).toBeVisible();
  await submissionPage.closeModal();
  await submissionPage.clickOnContinue();

  // Step: confirmation
  await submissionPage.waitFor('Update title');
  await submissionPage.checkboxInput('Please agree with the code of conduct of the event.').check();
  const proposalPage = await submissionPage.clickOnSubmit();
  await expect(submissionPage.toast).toHaveText('Congratulation! Proposal submitted!');

  // Check the proposal details
  await proposalPage.waitFor();
  await expect(proposalPage.speaker('Clark Kent')).toBeVisible();
  await expect(page.getByText('Update abstract')).toBeVisible();
  await expect(page.getByText('Beginner')).toBeVisible();
  await expect(page.getByText('French')).toBeVisible();
  await proposalPage.clickOnReferences();
  await expect(page.getByText('Update references')).toBeVisible();
});

test('saves a proposal as draft', async ({ page }) => {
  await userFactory({ traits: ['clark-kent'] });
  const event = await eventFactory({ traits: ['conference-cfp-open'] });

  const submissionPage = new SubmissionPage(page);
  await submissionPage.goto(event.slug);
  await submissionPage.clickOnNewProposal();

  // Step: talk creation
  await submissionPage.proposalStep.waitFor();
  await submissionPage.fillTalkForm('Draft title', 'Draft abstract', 'Beginner', 'French', 'Draft references');
  await submissionPage.clickOnContinue();
  await submissionPage.speakerStep.waitFor();

  // Go to proposal list
  await submissionPage.goto(event.slug);
  await expect(submissionPage.drafts).toHaveCount(1);
  await submissionPage.clickOnDraft('Draft title');

  // Step: proposal draft editing
  await submissionPage.proposalStep.waitFor();
  await expect(page.getByLabel('Title')).toHaveValue('Draft title');
});

test('submits a talk for an event w/o survey', async ({ page }) => {
  await userFactory({ traits: ['clark-kent'] });
  const event = await eventFactory({ traits: ['conference-cfp-open'] });
  await eventFormatFactory({ event, attributes: { name: 'Quickie' } });
  await eventCategoryFactory({ event, attributes: { name: 'Web' } });

  const submissionPage = new SubmissionPage(page);
  await submissionPage.goto(event.slug);
  await submissionPage.clickOnNewProposal();

  // Step: talk creation
  await submissionPage.proposalStep.waitFor();
  await submissionPage.fillTalkForm('New title', 'New abstract', 'Beginner', 'French', 'New references');
  await submissionPage.clickOnContinue();

  // Step: speaker
  await submissionPage.speakerStep.waitFor();
  await submissionPage.clickOnContinue();

  // Step: tracks
  await submissionPage.tracksStep.waitFor();
  await submissionPage.clickOnContinue();

  // Step: confirmation
  await submissionPage.waitFor('New title');
  await submissionPage.checkboxInput('Please agree with the code of conduct of the event.').check();
  await submissionPage.clickOnSubmit();
  await expect(submissionPage.toast).toHaveText('Congratulation! Proposal submitted!');
});

test('submits a talk for an event w/o tracks', async ({ page }) => {
  await userFactory({ traits: ['clark-kent'] });
  const event = await eventFactory({ traits: ['conference-cfp-open', 'withSurveyConfig'] });

  const submissionPage = new SubmissionPage(page);
  await submissionPage.goto(event.slug);
  await submissionPage.clickOnNewProposal();

  // Step: talk creation
  await submissionPage.proposalStep.waitFor();
  await submissionPage.fillTalkForm('New title', 'New abstract', 'Beginner', 'French', 'New references');
  await submissionPage.clickOnContinue();

  // Step: speaker
  await submissionPage.speakerStep.waitFor();
  await submissionPage.clickOnContinue();

  // Step: survey
  await submissionPage.surveyStep.waitFor();
  await submissionPage.clickOnContinue();

  // Step: confirmation
  await submissionPage.waitFor('New title');
  await submissionPage.checkboxInput('Please agree with the code of conduct of the event.').check();
  await submissionPage.clickOnSubmit();
  await expect(submissionPage.toast).toHaveText('Congratulation! Proposal submitted!');
});

test('submits a talk for an event w/o tracks, survey and cod', async ({ page }) => {
  await userFactory({ traits: ['clark-kent'] });
  const event = await eventFactory({ traits: ['conference-cfp-open'], attributes: { codeOfConductUrl: null } });

  const submissionPage = new SubmissionPage(page);
  await submissionPage.goto(event.slug);
  await submissionPage.clickOnNewProposal();

  // Step: talk creation
  await submissionPage.proposalStep.waitFor();
  await submissionPage.fillTalkForm('New title', 'New abstract', 'Beginner', 'French', 'New references');
  await submissionPage.clickOnContinue();

  // Step: speaker
  await submissionPage.speakerStep.waitFor();
  await submissionPage.clickOnContinue();

  // Step: confirmation
  await submissionPage.waitFor('New title');
  await submissionPage.clickOnSubmit();
  await expect(submissionPage.toast).toHaveText('Congratulation! Proposal submitted!');
});

test('cannot submit a talk when max proposal reached', async ({ page }) => {
  await userFactory({ traits: ['clark-kent'] });
  const event = await eventFactory({
    traits: ['conference-cfp-open'],
    attributes: { codeOfConductUrl: null, maxProposals: 1 },
  });

  const submissionPage = new SubmissionPage(page);
  await submissionPage.goto(event.slug);

  await expect(page.getByText('1 proposals by speaker.')).toBeVisible();

  // Step: talk creation
  await submissionPage.clickOnNewProposal();
  await submissionPage.proposalStep.waitFor();
  await submissionPage.fillTalkForm('New title', 'New abstract', 'Beginner', 'French', 'New references');
  await submissionPage.clickOnContinue();

  // Step: speaker
  await submissionPage.speakerStep.waitFor();
  await submissionPage.clickOnContinue();

  // Step: confirmation
  await submissionPage.waitFor('New title');
  const proposalPage = await submissionPage.clickOnSubmit();
  await expect(submissionPage.toast).toHaveText('Congratulation! Proposal submitted!');
  await proposalPage.waitFor();

  // Check the proposal is in the list
  await page.getByRole('link', { name: 'Your proposals' }).click();
  const proposalList = new ProposalListPage(page);
  await proposalList.waitFor();
  await proposalList.clickOnSubmitProposal();
  await expect(
    page.getByText('You have reached the maximum of submitted proposals for the event (1 max)'),
  ).toBeVisible();
  await submissionPage.clickOnCheckMyProposals();
  await proposalList.waitFor();
});

test('cannot submit a talk when CFP is not open yet', async ({ page }) => {
  await userFactory({ traits: ['clark-kent'] });
  const event = await eventFactory({ traits: ['conference-cfp-future'] });

  await page.goto(`/${event.slug}/submission`);
  await expect(page.getByText('The call for papers is not open yet.')).toBeVisible();
});

test('cannot submit a talk when CFP is closed', async ({ page }) => {
  await userFactory({ traits: ['clark-kent'] });
  const event = await eventFactory({ traits: ['conference-cfp-past'] });

  await page.goto(`/${event.slug}/submission`);
  await expect(page.getByText('The call for papers is not open yet.')).toBeVisible();
});
