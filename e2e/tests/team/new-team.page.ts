import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class NewTeamPage extends PageObject {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Create a new team.' });
  }

  async goto() {
    await this.page.goto('/team/new');
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async fillForm(name: string, slug: string) {
    await this.page.getByLabel('Team name').fill(name);
    await this.page.getByLabel('Team URL').fill(slug);
  }

  async clickOnCreate() {
    await this.page.getByRole('button', { name: 'Create team' }).click();
  }
}
