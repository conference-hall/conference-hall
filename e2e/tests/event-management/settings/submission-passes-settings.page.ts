import { PageObject } from '../../../page-object.ts';

export class SubmissionPassesSettingsPage extends PageObject {
  readonly heading = this.page.getByRole('heading', { name: 'Submission passes' });
  readonly labelInput = this.page.getByLabel('Pass name');
  readonly createButton = this.page.getByRole('button', { name: 'Create pass' });
  readonly unusedHeading = this.page.getByText('Not used yet', { exact: true });
  readonly usedHeading = this.page.getByText('Used', { exact: true });
  readonly unusedList = this.page.getByRole('list', { name: 'Not used yet' }).locator('>li');
  readonly usedList = this.page.getByRole('list', { name: 'Used', exact: true }).locator('>li');

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/settings/submission-passes`);
    await this.waitFor();
  }

  async waitFor() {
    await this.waitForHydration();
    await this.heading.waitFor();
  }
}
