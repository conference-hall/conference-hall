import type { Locator, Page } from '@playwright/test';

export class MultiSelectComponent {
  readonly multiSelectInput: Locator;
  readonly multiSelectWrapper: Locator;
  readonly page: Page;

  constructor(label: string, page: Page) {
    this.page = page;
    this.multiSelectInput = this.page.getByLabel(label);
    this.multiSelectWrapper = this.multiSelectInput.locator('../..');
  }

  async select(values: string[]) {
    for (const value of values) {
      await this.multiSelectInput.fill(value);
      await this.page.getByRole('option', { name: new RegExp(value, 'i') }).click();
      await this.page.click('body'); // to close the dropdown
    }
  }

  selected(value: string) {
    return this.multiSelectWrapper.getByRole('listitem', { name: new RegExp(value, 'i') });
  }
}
