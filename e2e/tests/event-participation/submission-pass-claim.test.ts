import { eventFactory } from 'tests/factories/events.ts';
import { submissionPassFactory } from 'tests/factories/submission-passes.ts';
import { DEFAULT_PASSWORD, userFactory } from 'tests/factories/users.ts';
import { expect, test } from '../../fixtures.ts';
import { userLoggedFactory } from '../../helpers.ts';
import { LoginPage } from '../auth/login.page.ts';
import { EventPage } from './event.page.ts';
import { SubmissionPassClaimPage } from './submission-pass-claim.page.ts';
import { SubmissionPage } from './submission.page.ts';

test('claims a submission pass and lands on the submission page', async ({ context, page }) => {
  const speaker = await userLoggedFactory(context);
  const event = await eventFactory({ traits: ['conference-cfp-past'] });
  const pass = await submissionPassFactory({ event });

  const claimPage = new SubmissionPassClaimPage(page);
  await claimPage.goto(pass.code);
  await claimPage.waitFor(event.name);
  await expect(claimPage.invitation).toBeVisible();
  await expect(claimPage.accountEmail(speaker.email)).toBeVisible();
  await claimPage.claimButton.click();

  await new SubmissionPage(page).selectionStep.waitFor();
  await expect(page).toHaveURL(`/${event.slug}/submission`);
});

test('claims a submission pass while the CFP is open and lands on the submission page', async ({ context, page }) => {
  await userLoggedFactory(context);
  const event = await eventFactory({ traits: ['conference-cfp-open'] });
  const pass = await submissionPassFactory({ event });

  const claimPage = new SubmissionPassClaimPage(page);
  await claimPage.goto(pass.code);
  await claimPage.waitFor(event.name);
  await claimPage.claimButton.click();

  await new SubmissionPage(page).selectionStep.waitFor();
  await expect(page).toHaveURL(`/${event.slug}/submission`);
});

test('sends a pass holder reopening their link straight to the submission page', async ({ context, page }) => {
  const speaker = await userLoggedFactory(context);
  const event = await eventFactory({ traits: ['conference-cfp-past'] });
  const pass = await submissionPassFactory({ event, user: speaker });

  await new SubmissionPassClaimPage(page).goto(pass.code);

  await new SubmissionPage(page).selectionStep.waitFor();
  await expect(page).toHaveURL(`/${event.slug}/submission`);
});

test('switches account before claiming a submission pass', async ({ context, page }) => {
  await userLoggedFactory(context);
  const otherSpeaker = await userFactory({ withPasswordAccount: true });
  const event = await eventFactory({ traits: ['conference-cfp-past'] });
  const pass = await submissionPassFactory({ event });

  const claimPage = new SubmissionPassClaimPage(page);
  await claimPage.goto(pass.code);
  await claimPage.waitFor(event.name);
  await claimPage.switchAccountButton.click();

  const loginPage = new LoginPage(page);
  await loginPage.waitFor();
  await loginPage.waitForCaptcha();
  await loginPage.signInWithPassword(otherSpeaker.email, DEFAULT_PASSWORD);

  await expect(page).toHaveURL(`/invite/pass/${pass.code}`);
  await expect(claimPage.accountEmail(otherSpeaker.email)).toBeVisible();
});

test('asks to log in before claiming a submission pass', async ({ page }) => {
  const event = await eventFactory({ traits: ['conference-cfp-past'] });
  const pass = await submissionPassFactory({ event });

  await new SubmissionPassClaimPage(page).goto(pass.code);

  await expect(page).toHaveURL(`/auth/login?redirectTo=${encodeURIComponent(`/invite/pass/${pass.code}`)}`);
});

test('shows an error when the pass is held by another speaker', async ({ context, page }) => {
  await userLoggedFactory(context);
  const event = await eventFactory({ traits: ['conference-cfp-past'] });
  const pass = await submissionPassFactory({ event, user: await userFactory() });

  const claimPage = new SubmissionPassClaimPage(page);
  await claimPage.goto(pass.code);

  await expect(claimPage.claimedErrorHeading).toBeVisible();
  await expect(claimPage.claimedErrorDescription).toBeVisible();
});

test('shows an error when the pass does not exist', async ({ context, page }) => {
  await userLoggedFactory(context);

  const claimPage = new SubmissionPassClaimPage(page);
  await claimPage.goto('unknown');

  await expect(claimPage.notFoundErrorHeading).toBeVisible();
});

test('submits a proposal with a submission pass while the CFP is closed', async ({ context, page }) => {
  await userLoggedFactory(context);
  const event = await eventFactory({ traits: ['conference-cfp-past'] });
  const pass = await submissionPassFactory({ event });

  const claimPage = new SubmissionPassClaimPage(page);
  await claimPage.goto(pass.code);
  await claimPage.waitFor(event.name);
  await claimPage.claimButton.click();
  await new SubmissionPage(page).selectionStep.waitFor();

  const eventPage = new EventPage(page);
  await eventPage.goto(event.slug, event.name);
  await expect(page.getByText('You have a submission pass')).toBeVisible();

  const submissionPage = await eventPage.clickOnSubmitButton();
  await submissionPage.selectionStep.waitFor();
  await submissionPage.clickOnNewProposal();

  await submissionPage.proposalStep.waitFor();
  await submissionPage.fillTalkForm('Pass title', 'Pass abstract', 'Beginner', 'French', 'Pass references');
  await submissionPage.clickOnContinue();

  await submissionPage.speakerStep.waitFor();
  await submissionPage.clickOnContinue();

  await submissionPage.waitFor('Pass title');
  await submissionPage.checkboxInput('Please agree with the code of conduct of the event.').check();
  await submissionPage.clickOnSubmit();
  await expect(submissionPage.toast).toHaveText('Congratulation! Proposal submitted!');
});
