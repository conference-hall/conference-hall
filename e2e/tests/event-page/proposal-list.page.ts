import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import { ProposalPage } from './proposal.page.ts';

export class ProposalListPage extends PageObject {
  readonly heading: Locator;
  readonly proposals: Locator;
  readonly noProposals: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Your proposals' });
    this.proposals = page.getByRole('list', { name: 'Proposals list' }).locator('>li');
    this.noProposals = page.getByText('No proposals submitted!');
  }

  async goto(slug: string) {
    await this.page.goto(`/${slug}/proposals`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  proposal(title: string) {
    return this.proposals.getByRole('link', { name: title });
  }

  async clickOnProposal(title: string) {
    await this.proposal(title).click();
    return new ProposalPage(this.page);
  }
}
