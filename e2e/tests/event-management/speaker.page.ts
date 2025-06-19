import { PageObject } from 'e2e/page-object.ts';

export class SpeakerPage extends PageObject {
  readonly referencesSection = this.page.getByText('References');
  readonly proposalsHeader = this.page.getByText(/Proposals \(\d+\)/);
  readonly emptyState = this.page.getByText('No proposals.');

  async goto(team: string, event: string, speaker: string) {
    await this.page.goto(`/team/${team}/${event}/speakers/${speaker}`);
    await this.page.waitForLoadState('networkidle');
  }

  async expandReferences() {
    await this.referencesSection.click();
  }

  async clickProposal(title: string) {
    await this.page.getByRole('link', { name: new RegExp(title) }).click();
  }
}
