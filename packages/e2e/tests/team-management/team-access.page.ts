import type { Locator, Page } from '@playwright/test';
import { PageObject } from '../../helpers/page-object.ts';
import { NewTeamPage } from './new-team.page.ts';

export class TeamAccessPage extends PageObject {
  readonly heading: Locator;
  readonly formLink: Locator;
  readonly keyInput: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Become event organizer.' });
    this.formLink = page.getByRole('link', { name: 'Request a beta access key' });
    this.keyInput = page.getByLabel('Beta access key');
  }

  async goto() {
    await this.page.goto('/team/request');
    await this.heading.waitFor();
  }

  async clickOnGetAccess() {
    await this.page.getByRole('button', { name: 'Get access' }).click();
    return new NewTeamPage(this.page);
  }
}
