import type { Locator, Page } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'My profile' });
  }

  async goto() {
    await this.page.goto('/speaker/profile');
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }
}
