import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class NewTalkPage extends PageObject {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Create a new talk' });
  }

  async goto() {
    await this.page.goto('/speaker/talks/new');
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }
}
