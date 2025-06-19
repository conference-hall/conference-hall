import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import { TeamHomePage } from './team-home.page.ts';

export class NewTeamPage extends PageObject {
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly slugInput: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Create a new team.' });
    this.nameInput = page.getByRole('textbox', { name: 'Team name' });
    this.slugInput = page.getByRole('textbox', { name: 'Team URL' });
  }

  async goto() {
    await this.page.goto('/team/new');
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async clickOnCreate() {
    await this.page.getByRole('button', { name: 'Create team' }).click();
    return new TeamHomePage(this.page);
  }
}
