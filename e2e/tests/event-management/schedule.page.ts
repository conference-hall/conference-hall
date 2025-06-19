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
    await this.page.getByRole('button', { name: 'Next' }).click();
  }

  async clickOnOptions() {
    await this.page.getByRole('button', { name: 'Options' }).click();
  }

  async clickOnManageTracksMenu() {
    await this.page.getByRole('menuitem', { name: 'Manage tracks' }).click();
  }
}
