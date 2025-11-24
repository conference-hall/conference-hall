import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import { NewEventPage } from './new-event.page.ts';

export class TeamHomePage extends PageObject {
  readonly heading: Locator;
  readonly eventsTab: Locator;
  readonly settingsTab: Locator;
  readonly events: Locator;
  readonly newEventButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Team events' });
    this.events = page.getByRole('list', { name: 'Events list' }).locator('>li');
    this.eventsTab = page.getByRole('link', { name: 'Events' });
    this.settingsTab = page.getByRole('link', { name: 'Settings' });
    this.newEventButton = page.getByRole('link', { name: 'New event' });
  }

  async goto(slug: string) {
    await this.page.goto(`/team/${slug}`);
    await this.waitFor();
  }

  async waitFor() {
    await this.waitForHydration();
    await this.heading.waitFor();
  }

  event(name: string) {
    return this.events.getByRole('link', { name });
  }

  async clickOnArchived() {
    return this.page.getByRole('link', { name: 'Archived' }).click();
  }

  async clickOnNewEvent() {
    await this.newEventButton.click();
    return new NewEventPage(this.page);
  }
}
