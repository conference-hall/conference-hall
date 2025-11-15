import { PageObject } from '../../../helpers/page-object.ts';

export class CustomizeSettingsPage extends PageObject {
  readonly heading = this.page.getByRole('heading', { name: 'Customize event' });
  readonly logoInput = this.page.getByText('Change logo');
  readonly logoImage = this.page.getByAltText('logo');

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/settings/customize`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }
}
