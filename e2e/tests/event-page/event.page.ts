import type { Page } from '@playwright/test';

export class EventPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(slug: string, name: string) {
    await this.page.goto(`/${slug}`);
    await this.waitFor(name);
  }

  async waitFor(name: string) {
    await this.heading(name).waitFor();
  }

  heading(name: string) {
    return this.page.getByRole('heading', { name });
  }
}
