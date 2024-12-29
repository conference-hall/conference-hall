import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class SchedulePage extends PageObject {
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly timezoneInput: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'New schedule', exact: true });
    this.nameInput = page.getByLabel('Name');
    this.timezoneInput = page.getByRole('button', { name: 'Timezone' });
    this.startDateInput = page.getByLabel('Start date');
    this.endDateInput = page.getByLabel('End date');
  }

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/schedule`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async clickOnNewSchedule() {
    await this.page.getByRole('button', { name: 'New schedule' }).click();
  }

  async clickOnNextDay() {
    await this.page.getByRole('link', { name: 'Next day' }).click();
  }

  async clickOnSettings() {
    await this.page.getByLabel('Settings').click();
  }
}
