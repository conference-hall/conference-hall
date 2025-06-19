import { PageObject } from 'e2e/page-object.ts';
import { TeamHomePage } from './team-home.page.ts';

export class TeamInvitePage extends PageObject {
  async goto(code: string, teamName: string) {
    await this.page.goto(`/invite/team/${code}`);
    await this.waitFor(teamName);
  }

  async waitFor(teamName: string) {
    await this.page.getByRole('heading', { name: teamName }).waitFor();
  }

  async clickOnAcceptInvite() {
    await this.page.getByRole('button', { name: 'Accept invitation' }).click();
    return new TeamHomePage(this.page);
  }
}
