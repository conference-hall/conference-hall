import { PageObject } from '../../../helpers/page-object.ts';

export class GeneralSettingsPage extends PageObject {
  readonly heading = this.page.getByRole('heading', { name: 'General' });
  readonly nameInput = this.page.getByLabel('Name');
  readonly slugInput = this.page.getByLabel('Event URL');
  readonly privateRadio = this.page.getByRole('radio', { name: 'Private' });
  readonly publicRadio = this.page.getByRole('radio', { name: 'Public' });
  readonly startDateInput = this.page.getByLabel('Start date');
  readonly endDateInput = this.page.getByLabel('End date');
  readonly locationInput = this.page.getByLabel('Venue location (address, city, country)');
  readonly descriptionInput = this.page.getByLabel('Description');
  readonly websiteUrlInput = this.page.getByLabel('Website URL');
  readonly contactEmailInput = this.page.getByLabel('Contact email');
  readonly saveGeneralButton = this.page.getByRole('button', { name: 'Update event', exact: true });
  readonly saveDetailsButton = this.page.getByRole('button', { name: 'Update event details' });
  readonly archiveButton = this.page.getByRole('button', { name: 'Archive event' });
  readonly restoreButton = this.page.getByRole('button', { name: 'Restore event' });
  readonly deleteButton = this.page.getByRole('button', { name: 'Delete event' });
  readonly deleteDialog = this.page.getByRole('dialog', { name: 'Delete event' });

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/settings`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  switchOnlineEvent(checked?: boolean) {
    return this.page.getByRole('switch', { name: 'Is online event?', checked });
  }
}
