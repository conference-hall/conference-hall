import { PageObject } from 'e2e/page-object.ts';

export class WebApiSettingsPage extends PageObject {
  readonly heading = this.page.getByRole('heading', { name: 'Web API' });
  readonly generateAPIKeyButton = this.page.getByRole('button', { name: 'Generate API key' });
  readonly revokeAPIKeyButton = this.page.getByRole('button', { name: 'Revoke API key' });
  readonly apiKeyInput = this.page.getByLabel('API key');

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/settings/api`);
    await this.waitFor();
  }

  async waitFor() {
    await this.page.waitForLoadState('networkidle');
    await this.heading.waitFor();
  }
}
