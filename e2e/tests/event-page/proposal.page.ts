import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class ProposalPage extends PageObject {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Proposal page' });
  }

  async goto(slug: string, proposalId: string) {
    await this.page.goto(`/${slug}/proposals/${proposalId}`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }
}
