import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import { ProposalPage } from './proposal.page.ts';

export class ProposalsListPage extends PageObject {
  readonly heading: Locator;
  readonly proposals: Locator;
  readonly noProposals: Locator;
  readonly searchInput: Locator;
  readonly exportButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Proposals' });
    this.proposals = page.getByRole('list', { name: 'Proposals list' }).locator('>li');
    this.noProposals = page.getByText('No proposals found');
    this.searchInput = page.getByLabel('Search proposals');
    this.exportButton = page.getByRole('button', { name: 'Export' });
  }

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/reviews`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  proposal(name: string) {
    return this.page.getByRole('link', { name: `Open proposal "${name}"` });
  }

  proposalCount(count: number) {
    return this.page.getByText(`${count} proposals`);
  }

  proposalSelectedCount(count: number) {
    return this.page.getByText(`Mark ${count} selected as`);
  }

  async clickOnProposal(name: string) {
    await this.proposal(name).click();
    return new ProposalPage(this.page);
  }

  async clickOnProposalCheckbox(name: string) {
    await this.page.getByRole('checkbox', { name: `Select proposal "${name}"` }).click();
  }

  async clickOnReviewFilter(name: string) {
    await this.page.getByRole('button', { name: 'Filters' }).click();
    await this.page.getByRole('radio', { name, exact: true }).click();
    await this.page.getByRole('button', { name: 'Apply now' }).click();
  }

  async clickOnStatusFilter(name: string) {
    await this.page.getByRole('button', { name: 'Filters' }).click();
    await this.page.getByRole('radio', { name, exact: true }).click();
    await this.page.getByRole('button', { name: 'Apply now' }).click();
  }

  async clickOnFormatFilter(name: string) {
    await this.page.getByRole('button', { name: 'Filters' }).click();
    await this.page.getByLabel('Formats').click();
    await this.page.getByRole('option', { name }).click();
    await this.page.getByRole('button', { name: 'Apply now' }).click();
  }

  async clickOnCategoryFilter(name: string) {
    await this.page.getByRole('button', { name: 'Filters' }).click();
    await this.page.getByLabel('Categories').click();
    await this.page.getByRole('option', { name }).click();
    await this.page.getByRole('button', { name: 'Apply now' }).click();
  }

  async clickOnTagFilter(name: string) {
    await this.page.getByRole('button', { name: 'Filters' }).click();
    await this.page.getByLabel('Tags').click();
    await this.page.getByRole('option', { name }).click();
    await this.page.getByRole('button', { name: 'Apply now' }).click();
  }

  async clickOnClearFilters() {
    await this.page.getByRole('button', { name: 'Filters' }).click();
    await this.page.getByRole('link', { name: 'Reset' }).click();
  }

  async clickOnSortBy(name: string) {
    await this.page.getByRole('button', { name: 'Sort' }).click();
    await this.page.getByRole('menuitem', { name }).click();
  }

  async clickOnMarkAs(name: 'Accepted' | 'Rejected' | 'Not deliberated') {
    await this.page.getByRole('button', { name }).click();
    await this.page.getByRole('button', { name: `Mark as ${name}` }).click();
  }

  async clickOnExport() {
    await this.exportButton.click();
  }
}
