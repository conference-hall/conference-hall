import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { teamFactory } from '@conference-hall/database/tests/factories/team.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { expect, loginWith, test } from '../../../helpers/fixtures.ts';
import { SurveySettingsPage } from './survey-settings.page.ts';

loginWith('clark-kent');

test('updates survey settings', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const surveyPage = new SurveySettingsPage(page);
  await surveyPage.goto(team.slug, event.slug);

  expect(surveyPage.questionsList).toHaveCount(0);

  // Enable survey
  await surveyPage.surveyActivationSwitch.click();
  await expect(surveyPage.toast).toHaveText('Speaker survey enabled');

  const question = surveyPage.questionsList.first();

  // Add "text" question
  await surveyPage.addQuestionButton.click();
  await surveyPage.fill(surveyPage.questionInput, 'What is your favorite color?');
  await surveyPage.typeSelect.selectOption('text');
  await surveyPage.requiredCheckbox.check();
  await surveyPage.questionDialog.getByRole('button', { name: 'Add question' }).click();
  await expect(surveyPage.toast).toHaveText('Question added.');
  await expect(surveyPage.questionsList).toHaveCount(1);
  await expect(question).toContainText('What is your favorite color?');

  // Edit question
  await surveyPage.editQuestionButton.click();
  await surveyPage.fill(surveyPage.questionInput, 'What is your favorite color? (updated)');
  await surveyPage.questionDialog.getByRole('button', { name: 'Save' }).click();
  await expect(surveyPage.toast).toHaveText('Question updated.');
  await expect(question).toContainText('What is your favorite color? (updated)');

  // Delete question
  page.on('dialog', (dialog) => dialog.accept());
  await surveyPage.deleteQuestionButton.click();
  await expect(surveyPage.toast).toHaveText('Question removed.');
  await expect(surveyPage.questionsList).toHaveCount(0);

  // Add "radio" question
  await surveyPage.addQuestionButton.click();
  await surveyPage.fill(surveyPage.questionInput, 'What is your favorite animal?');
  await surveyPage.typeSelect.selectOption('radio');
  await surveyPage.fill(surveyPage.newAnswerInput, 'Dog');
  await surveyPage.addAnswerButton.click();
  await surveyPage.fill(surveyPage.newAnswerInput, 'Cat');
  await surveyPage.addAnswerButton.click();
  await surveyPage.questionDialog.getByRole('button', { name: 'Add question' }).click();
  await expect(surveyPage.toast).toHaveText('Question added.');
  await expect(surveyPage.questionsList).toHaveCount(1);
  await expect(question).toContainText('What is your favorite animal?');
  await expect(question).toContainText('Single choice');
  await expect(question).toContainText('Dog, Cat');

  // Add "checkbox" question
  await surveyPage.addQuestionButton.click();
  await surveyPage.fill(surveyPage.questionInput, 'What are your favorite food?');
  await surveyPage.typeSelect.selectOption('checkbox');
  await surveyPage.fill(surveyPage.newAnswerInput, 'Pizza');
  await surveyPage.addAnswerButton.click();
  await surveyPage.fill(surveyPage.newAnswerInput, 'Burger');
  await surveyPage.addAnswerButton.click();
  await surveyPage.questionDialog.getByRole('button', { name: 'Add question' }).click();
  await expect(surveyPage.toast).toHaveText('Question added.');
  await expect(surveyPage.questionsList).toHaveCount(2);
  const question2 = surveyPage.questionsList.nth(1);
  await expect(question2).toContainText('What are your favorite food?');
  await expect(question2).toContainText('Multi choice');
  await expect(question2).toContainText('Pizza, Burger');
});
