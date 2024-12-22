import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import { ProposalPage } from './proposal.page.ts';

export class ProposalInvitePage extends PageObject {
  readonly heading: Locator;
  readonly acceptButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Talk invitation.' });
    this.acceptButton = page.getByRole('button', { name: 'Accept invitation' });
  }

  async goto(code: string) {
    await this.page.goto(`/invite/proposal/${code}`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async acceptInvite() {
    await this.acceptButton.click();
    return new ProposalPage(this.page);
  }
}
