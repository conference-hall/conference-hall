import type { Locator, Page } from '@playwright/test';
import { PageObject } from '../../page-object.ts';

export class SchedulePage extends PageObject {
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly timezoneInput: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly sessionNameInput: Locator;
  readonly sessionConflictError: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'New schedule', exact: true });
    this.nameInput = page.getByLabel('Name');
    this.timezoneInput = page.getByRole('button', { name: 'Timezone' });
    this.startDateInput = page.getByLabel('Start date');
    this.endDateInput = page.getByLabel('End date');
    this.sessionNameInput = page.getByLabel('Session name');
    this.sessionConflictError = page.getByText('This session overlaps with an existing session on the same track.');
  }

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/schedule`);
    await this.waitFor();
  }

  async waitFor() {
    await this.waitForHydration();
    await this.heading.waitFor();
  }

  async clickOnNewSchedule() {
    await this.page.getByRole('button', { name: 'New schedule' }).click();
  }

  async clickOnNextDay() {
    await this.page.getByRole('button', { name: 'Next' }).click();
  }

  async clickOnOptions() {
    await this.page.getByRole('button', { name: 'Options' }).click();
  }

  async clickOnManageTracksMenu() {
    await this.page.getByRole('menuitem', { name: 'Manage tracks' }).click();
  }

  async submitNewSession(name: string) {
    await this.page.getByRole('button', { name: 'Session', exact: true }).click();
    await this.sessionNameInput.fill(name);
    // Blur the name field to close its proposal suggestions, which inert the footer while open.
    await this.sessionNameInput.press('Tab');
    await this.page.getByRole('button', { name: 'Create session' }).click();
  }

  async clickOnCancelSession() {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  session(name: string) {
    return this.page.getByText(name, { exact: true });
  }
}
