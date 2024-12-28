import { PageObject } from 'e2e/page-object.ts';

export class ProposalPage extends PageObject {
  async goto(team: string, event: string, id: string, title: string) {
    await this.page.goto(`/team/${team}/${event}/reviews/${id}`);
    await this.waitFor(title);
  }

  async waitFor(name: string) {
    await this.page.getByRole('heading', { name }).waitFor();
  }
}
