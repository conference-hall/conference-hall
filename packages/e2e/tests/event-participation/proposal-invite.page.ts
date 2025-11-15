import type { Locator, Page } from '@playwright/test';
import { PageObject } from '../../helpers/page-object.ts';
import { ProposalPage } from './proposal.page.ts';

export class ProposalInvitePage extends PageObject {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Talk invitation.' });
  }

  async goto(code: string) {
    await this.page.goto(`/invite/proposal/${code}`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async clickOnAcceptInvite() {
    await this.page.getByRole('button', { name: 'Accept invitation' }).click();
    return new ProposalPage(this.page);
  }
}
