import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import { EventPage } from './event-page/event.page.ts';

export class HomePage extends PageObject {
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly results: Locator;
  readonly noResults: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = this.page.getByRole('heading', { name: 'Call for papers for conferences and meetups.' });
    this.searchInput = this.page.getByLabel('Search conferences and meetups.');
    this.results = this.page.getByRole('list', { name: 'Search results' }).locator('li');
    this.noResults = this.page.getByText('No results found!');
  }

  async goto() {
    await this.page.goto('/');
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async filterAll() {
    await this.page.getByRole('link', { name: 'All', exact: true }).click();
  }

  async filterConferences() {
    await this.page.getByRole('link', { name: 'Conferences' }).click();
  }

  async filterMeetups() {
    await this.page.getByRole('link', { name: 'Meetups' }).click();
  }

  item(name: string) {
    return this.results.getByRole('link', { name });
  }

  async clickOnEvent(name: string) {
    await this.item(name).click();
    return new EventPage(this.page);
  }
}
