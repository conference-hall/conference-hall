import type { Locator, Page } from '@playwright/test';
import { PageObject } from '../../helpers/page-object.ts';

export class SpeakersListPage extends PageObject {
  readonly heading: Locator;
  readonly speakers: Locator;
  readonly noSpeakers: Locator;
  readonly searchInput: Locator;
  readonly newSpeakerButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Speakers' });
    this.speakers = page.getByRole('list', { name: 'Speakers' }).locator('>li');
    this.noSpeakers = page.getByText('No speakers yet');
    this.searchInput = page.getByLabel('Search speakers');
    this.newSpeakerButton = page.getByRole('link', { name: 'Speaker', exact: true });
  }

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/speakers`);
    await this.waitFor();
  }

  async waitFor() {
    await this.page.waitForLoadState('networkidle');
    await this.heading.waitFor();
  }

  speaker(name: string) {
    return this.page.getByText(name).first();
  }

  speakerCount(count: number) {
    if (count === 0) return this.page.getByText('No speakers found');
    if (count === 1) return this.page.getByText('1 speaker');
    return this.page.getByText(`${count} speakers`);
  }

  speakerSearchEmptyState(_query: string) {
    return this.page.getByText('No speakers found');
  }

  async clickOnProposalStatusFilter(name: string) {
    await this.page.getByRole('button', { name: 'Filters' }).click();
    await this.page.getByRole('radio', { name, exact: true }).click();
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

  async searchSpeakers(query: string) {
    await this.fill(this.searchInput, query);
    await this.searchInput.press('Enter');
  }

  async clearSearch() {
    await this.fill(this.searchInput, '');
    await this.searchInput.press('Enter');
  }

  filterTag(name: string) {
    return this.page.getByText('Filters:').locator('..').getByText(name);
  }

  async removeFilterTag(name: string) {
    await this.filterTag(name).getByRole('button').click();
  }

  async clickOnSpeaker(name: string) {
    await this.speaker(name).click();
  }

  async clickNewSpeaker() {
    await this.newSpeakerButton.click();
  }
}
