import type { CustomTemplateName } from '~/shared/emails/email.types.ts';
import { PageObject } from '../../../page-object.ts';

export class EmailsSettingsPage extends PageObject {
  readonly heading = this.page.getByRole('heading', { name: 'Email Templates', exact: true });
  readonly description = this.page.getByText('Customize the emails sent to speakers.');

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/settings/emails`);
    await this.waitFor();
  }

  async waitFor() {
    await this.waitForHydration();
    await this.heading.waitFor();
  }

  getTemplateSection(template: CustomTemplateName) {
    return this.page
      .locator('div')
      .filter({ hasText: new RegExp(this.getTemplateTitle(template), 'i') })
      .first();
  }

  getCustomizeLink(template: CustomTemplateName, locale: string) {
    return this.page.locator(`a[href*="${template}"][href*="locale=${locale}"]`);
  }

  getCustomBadge(template: CustomTemplateName) {
    const templateSection = this.getTemplateSection(template);
    return templateSection
      .locator('.inline-flex.items-center.text-nowrap.bg-gray-100, .inline-flex.items-center.text-nowrap.bg-blue-100')
      .first();
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
