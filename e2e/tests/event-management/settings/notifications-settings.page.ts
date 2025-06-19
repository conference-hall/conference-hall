import { PageObject } from 'e2e/page-object.ts';

export class NotificationsSettingsPage extends PageObject {
  readonly heading = this.page.getByRole('heading', { name: 'Email notifications' });
  readonly emailInput = this.page.getByLabel('Email receiving notifications');
  readonly saveButton = this.page.getByRole('button', { name: 'Save email' });
  readonly submittedProposalSwitch = this.page.getByRole('switch', { name: 'Submitted proposals' });
  readonly confirmedProposalSwitch = this.page.getByRole('switch', { name: 'Confirmed proposals' });
  readonly declinedProposalSwitch = this.page.getByRole('switch', { name: 'Declined proposals' });

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/settings/notifications`);
    await this.waitFor();
  }

  async waitFor() {
    await this.page.waitForLoadState('networkidle');
    await this.heading.waitFor();
  }
}
