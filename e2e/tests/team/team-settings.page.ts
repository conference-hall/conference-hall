import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import { ActivityPage } from 'e2e/tests/speaker/activity.page.ts';

export class TeamSettingsPage extends PageObject {
  readonly heading: Locator;
  readonly generalPage: Locator;
  readonly membersPage: Locator;
  readonly nameInput: Locator;
  readonly slugInput: Locator;
  readonly members: Locator;
  readonly findMember: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Team settings' });
    this.generalPage = page.getByRole('heading', { name: 'General' });
    this.membersPage = page.getByRole('heading', { name: 'Members' });
    this.nameInput = page.getByRole('textbox', { name: 'Team name' });
    this.slugInput = page.getByRole('textbox', { name: 'Team URL' });
    this.members = page.getByRole('list', { name: 'Members list' }).locator('>li');
    this.findMember = page.getByLabel('Find member');
  }

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
