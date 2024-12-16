import type { Locator, Page } from '@playwright/test';

export class ProposalPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Proposal page' });
  }

  async goto(slug: string) {
    await this.page.goto(`/${slug}/proposals`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }
}
