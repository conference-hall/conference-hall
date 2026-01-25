import { PageObject } from '../../../page-object.ts';

export class CfpSettingsPage extends PageObject {
  readonly heading = this.page.getByRole('heading', { name: 'Call for papers opening' });

  readonly startInput = this.page.getByLabel('Opening date');
  readonly endInput = this.page.getByLabel('Closing date');
  readonly saveOpeningsButton = this.page.getByRole('button', { name: 'Save CFP openings' });

  readonly cfpActivationSwitch = this.page.getByRole('switch', { name: 'Call for papers activation' });

  readonly maxProposalsInput = this.page.getByLabel('Maximum of proposals per speaker');
  readonly codeOfConductUrlInput = this.page.getByLabel('Code of conduct URL');
  readonly savePreferencesButton = this.page.getByRole('button', { name: 'Update CFP preferences' });

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/settings/cfp`);
    await this.waitFor();
  }

  async waitFor() {
    await this.waitForHydration();
    await this.heading.waitFor();
  }
}
