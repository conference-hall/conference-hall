import { PageObject } from '../../../page-object.ts';

export class SurveySettingsPage extends PageObject {
  readonly heading = this.page.getByRole('heading', { name: 'Speaker survey' });
  readonly questionsList = this.page.getByRole('list', { name: 'Questions list' }).locator('>li');
  readonly surveyActivationSwitch = this.page.getByRole('switch', { name: 'Speaker survey activation' });
  readonly addQuestionButton = this.page.getByRole('button', { name: 'Add question' });
  readonly saveQuestionsButton = this.page.getByRole('button', { name: 'Save question' });
  readonly editQuestionButton = this.page.getByRole('button', { name: 'Edit' });
  readonly deleteQuestionButton = this.page.getByRole('button', { name: 'Delete' });
  readonly questionInput = this.page.getByLabel('Question', { exact: true });
  readonly typeSelect = this.page.getByLabel('Type');
  readonly requiredCheckbox = this.page.getByLabel('This question is required');
  readonly newAnswerInput = this.page.getByPlaceholder('New answer');
  readonly addAnswerButton = this.page.getByRole('button', { name: 'Add answer' });
  readonly questionDialog = this.page.getByRole('dialog');

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/settings/survey`);
    await this.waitFor();
  }

  async waitFor() {
    await this.waitForHydration();
    await this.heading.waitFor();
  }
}
