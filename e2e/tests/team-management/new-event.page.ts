import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import { OverviewPage } from '../event-management/overview.page.ts';

export class NewEventPage extends PageObject {
  readonly heading: Locator;
  readonly conferenceForm: Locator;
  readonly meetupForm: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Select your event type.' });
    this.conferenceForm = page.getByRole('heading', { name: 'Create a new conference.' });
    this.meetupForm = page.getByRole('heading', { name: 'Create a new meetup.' });
  }

  async goto(team: string) {
    await this.page.goto(`/team/${team}/new`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  detailsForm(name: string) {
    return this.page.getByRole('heading', { name: `${name} information.` });
  }

  cfpForm(name: string) {
    return this.page.getByRole('heading', { name: `${name} call for papers.` });
  }

  async clickOnConference() {
    await this.page.getByRole('radio', { name: 'Conference' }).click();
  }

  async clickOnMeetup() {
    await this.page.getByRole('radio', { name: 'Meetup' }).click();
  }

  async clickOnContinueToGeneralForm() {
    await this.page.getByRole('link', { name: 'Continue' }).click();
  }

  async clickOnContinueToDetailsForm() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async clickOnContinueToCfpForm() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async clickOnFinish() {
    await this.page.getByRole('button', { name: 'Finish' }).click();
    return new OverviewPage(this.page);
  }

  async fillEventForm(name: string, slug: string) {
    await this.page.getByLabel('Name').fill(name);
    await this.page.getByLabel('Event URL').fill(slug);
    await this.page.getByRole('radio', { name: 'Public' }).click();
  }

  async fillConferenceDetails(start: string, end: string, location: string, description: string) {
    await this.page.getByLabel('Start date').fill(start);
    await this.page.getByLabel('End date').fill(end);
    await this.page.getByLabel('Venue location (address, city, country)').fill(location);
    await this.page.getByLabel('Description').fill(description);
  }

  async fillMeetupDetails(location: string, description: string) {
    await this.page.getByLabel('Venue location (address, city, country)').fill(location);
    await this.page.getByLabel('Description').fill(description);
  }

  async fillConferenceOpenings(start: string, end: string) {
    await this.page.getByLabel('Opening date').fill(start);
    await this.page.getByLabel('Closing date').fill(end);
  }
}
