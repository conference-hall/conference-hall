import type { CustomTemplateName } from '~/shared/emails/email.types.ts';
import { PageObject } from '../../../helpers/page-object.ts';

export class EmailTemplateSettingsPage extends PageObject {
  readonly backButton = this.page.getByRole('link', { name: 'Go back' });
  readonly customBadge = this.page.getByText('Custom').or(this.page.getByText('Default'));
  readonly editButton = this.page.getByRole('button', { name: 'Edit template' });
  readonly resetButton = this.page.getByRole('button', { name: 'Reset to default' });

  async goto(team: string, event: string, template: string, locale = 'en') {
    await this.page.goto(`/team/${team}/${event}/settings/emails/${template}?locale=${locale}`);
    await this.waitFor();
  }

  async waitFor() {
    await this.page.waitForLoadState('networkidle');
  }

  getTemplateHeading(template: CustomTemplateName) {
    return this.page.getByRole('heading', { name: this.getTemplateTitle(template), exact: true });
  }

  async clickEditButton() {
    await this.editButton.click();
  }

  async clickResetButton() {
    await this.resetButton.click();
  }

  async clickBackButton() {
    await this.backButton.click();
  }

  // Edit modal selectors
  readonly editModal = this.page.getByRole('dialog');
  readonly subjectInput = this.page.getByLabel('Subject');
  readonly contentTextarea = this.page.getByLabel('Content');
  readonly saveButton = this.page.getByRole('button', { name: 'Save customization' });

  async fillSubject(subject: string) {
    await this.fill(this.subjectInput, subject);
  }

  async fillContent(content: string) {
    await this.fill(this.contentTextarea, content);
  }

  async saveChanges() {
    await this.saveButton.click();
  }

  private getTemplateTitle(template: CustomTemplateName): string {
    switch (template) {
      case 'speakers-proposal-submitted':
        return 'Proposal Submitted';
      case 'speakers-proposal-accepted':
        return 'Proposal Accepted';
      case 'speakers-proposal-rejected':
        return 'Proposal Rejected';
      default:
        return template;
    }
  }
}
