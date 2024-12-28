import type { Locator, Page } from '@playwright/test';

export class PageObject {
  readonly page: Page;
  readonly toast: Locator;
  readonly forbiddenPage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toast = page.getByLabel('Notifications').locator('[data-sonner-toast]').first();
    this.forbiddenPage = page.getByRole('heading', { name: 'Forbidden action', exact: true });
  }

  async closeModal() {
    await this.page.getByRole('button', { name: 'Close' }).click();
  }

  async getInputDescription(input: Locator) {
    const subjectDescriptionId = await input.getAttribute('aria-describedby');
    return this.page.locator(`id=${subjectDescriptionId}`);
  }

  async selectOptions(locator: Locator, values: string[]) {
    await locator.scrollIntoViewIfNeeded();
    await locator.click();
    for (const value of values) {
      await this.page.getByRole('option', { name: value }).click();
    }
    await locator.click();
  }

  radioInput(name: string) {
    return this.page.getByRole('radio', { name });
  }

  checkboxInput(name: string) {
    return this.page.getByRole('checkbox', { name });
  }
}
