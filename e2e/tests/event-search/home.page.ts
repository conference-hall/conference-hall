import type { Locator } from '@playwright/test';
import { PageObject } from '../../page-object.ts';
import { EventPage } from '../event-participation/event.page.ts';

export class HomePage extends PageObject {
  readonly heading: Locator = this.page.getByRole('heading', { name: 'Call for papers for conferences and meetups.' });
  readonly searchInput: Locator = this.page.getByLabel('Search conferences and meetups.');
  readonly results: Locator = this.page.getByRole('list', { name: 'Search results' }).locator('li');
  readonly noResults: Locator = this.page.getByText('No results found');

  async goto() {
    await this.page.goto('/');
    await this.waitFor();
  }

  async waitFor() {
    await this.waitForHydration();
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
