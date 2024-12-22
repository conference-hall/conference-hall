import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import { ActivityPage } from 'e2e/tests/speaker/activity.page.ts';

export class TeamSettingsPage extends PageObject {
  readonly heading: Locator;
  readonly generalPage: Locator;
  readonly membersPage: Locator;
  readonly nameInput: Locator;
  readonly slugInput: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Team settings' });
    this.generalPage = page.getByRole('heading', { name: 'General' });
    this.membersPage = page.getByRole('heading', { name: 'Members' });
    this.nameInput = page.getByRole('textbox', { name: 'Team name' });
    this.slugInput = page.getByRole('textbox', { name: 'Team URL' });
  }

  async goto(slug: string) {
    await this.page.goto(`/team/${slug}/settings`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

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
}
