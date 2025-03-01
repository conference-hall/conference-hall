import type { Locator } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import { ActivityPage } from 'e2e/tests/speaker/activity.page.ts';

export class TeamSettingsPage extends PageObject {
  readonly heading: Locator = this.page.getByRole('heading', { name: 'Team settings' });
  readonly generalPage: Locator = this.page.getByRole('heading', { name: 'General' });
  readonly membersPage: Locator = this.page.getByRole('heading', { name: 'Members' });
  readonly nameInput: Locator = this.page.getByRole('textbox', { name: 'Team name' });
  readonly slugInput: Locator = this.page.getByRole('textbox', { name: 'Team URL' });
  readonly members: Locator = this.page.getByRole('list', { name: 'Members list' }).locator('>li');
  readonly findMember: Locator = this.page.getByLabel('Find member');
  readonly deleteButton = (eventName: string) => this.page.getByRole('button', { name: `Delete "${eventName}"` });
  readonly deleteDialog = (eventName: string) => this.page.getByRole('dialog', { name: `Delete "${eventName}"` });

  async goto(slug: string) {
    await this.page.goto(`/team/${slug}/settings`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  // General settings

  async fillForm(name: string, slug: string) {
    await this.nameInput.fill(name);
    await this.slugInput.fill(slug);
  }

  async clickOnSave() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  leaveTeamButton(teamName: string) {
    return this.page.getByRole('button', { name: `Leave "${teamName}" team` });
  }

  async clickOnLeaveTeam(teamName: string) {
    await this.leaveTeamButton(teamName).click();
    return new ActivityPage(this.page);
  }

  // Member list

  async gotoMembers(slug: string) {
    await this.page.goto(`/team/${slug}/settings/members`);
    await this.waitFor();
  }

  member(name: string) {
    return this.members.getByText(name);
  }

  async clickOnInviteMember() {
    await this.page.getByRole('button', { name: 'Invite member' }).click();
    return this.page.getByLabel('Copy invitation link');
  }

  removeMemberButton(name: string) {
    return this.members.getByRole('button', { name: `Remove ${name} from team` });
  }

  changeRoleButton(name: string) {
    return this.members.getByLabel(`Change role of ${name}`);
  }

  async clickOnRole(role: string) {
    await this.page.getByRole('radio', { name: role }).click();
  }

  async clickOnConfirmRole(name: string) {
    await this.page.getByRole('button', { name: `Change ${name}'s role` }).click();
  }

  async clickOnConfirmRemove(name: string) {
    await this.page.getByRole('button', { name: `Remove ${name}`, exact: true }).click();
  }
}
