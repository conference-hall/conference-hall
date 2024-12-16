import type { Locator, Page } from '@playwright/test';

export class PageObject {
  readonly page: Page;
  readonly toast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toast = page.getByLabel('Notifications').locator('[data-sonner-toast]');
  }

  async getInputDescription(input: Locator) {
    const subjectDescriptionId = await input.getAttribute('aria-describedby');
    return this.page.locator(`id=${subjectDescriptionId}`);
  }
}
