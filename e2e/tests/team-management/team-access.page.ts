import type { Locator, Page } from '@playwright/test';
import { PageObject } from '../../page-object.ts';

export class TeamAccessPage extends PageObject {
  readonly heading: Locator;
  readonly eventNameInput: Locator;
  readonly emailInput: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Become event organizer.' });
    this.eventNameInput = page.getByLabel('Event name');
    this.emailInput = page.getByLabel('Email');
  }

  async goto() {
    await this.page.goto('/team/request');
    await this.waitForHydration();
    await this.heading.waitFor();
  }

  async submitRequest() {
    await this.page.getByRole('button', { name: 'Submit request' }).click();
  }
}
