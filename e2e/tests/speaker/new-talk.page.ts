import type { Locator, Page } from '@playwright/test';

export class NewTalkPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Create a new talk' });
  }

  async goto() {
    await this.page.goto('/speaker/talks/new');
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }
}
