import { PageObject } from '../../page-object.ts';

export class SpeakerPage extends PageObject {
  readonly referencesSection = this.page.getByText('References');
  readonly proposalsHeader = this.page.getByText(/Proposals \(\d+\)/);
  readonly emptyState = this.page.getByText('No proposals.');
  readonly newProposalButton = this.page.getByRole('link', { name: 'Proposal', exact: true });

  async goto(team: string, event: string, speaker: string) {
    await this.page.goto(`/team/${team}/${event}/speakers/${speaker}`);
    await this.waitForHydration();
  }

  async expandReferences() {
    await this.referencesSection.click();
  }

  async clickProposal(title: string) {
    await this.page.getByRole('link', { name: new RegExp(title) }).click();
  }

  async clickNewProposal() {
    await this.newProposalButton.click();
  }
}
