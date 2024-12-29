import { PageObject } from 'e2e/page-object.ts';

export class IntegrationsSettingsPage extends PageObject {
  readonly heading = this.page.getByRole('heading', { name: 'Slack integration' });
  readonly slackWebhookInput = this.page.getByLabel('Slack web hook URL');
  readonly saveSlackButton = this.page.getByRole('button', { name: 'Save Slack integration' });
  readonly openPlannerEventIdInput = this.page.getByLabel('OpenPlanner event id');
  readonly openPlannerApiKeyInput = this.page.getByLabel('OpenPlanner API key');
  readonly saveOpenPlannerButton = this.page.getByRole('button', { name: 'Save OpenPlanner integration' });
  readonly disableOpenPlannerButton = this.page.getByRole('button', { name: 'Disable' });

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/settings/integrations`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }
}
