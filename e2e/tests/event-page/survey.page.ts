import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class SurveyPage extends PageObject {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'We have some questions for you.' });
  }

  async goto(slug: string) {
    await this.page.goto(`/${slug}/survey`);
    await this.waitFor();
  }

  async waitFor() {
    await this.page.waitForLoadState('networkidle');
    await this.heading.waitFor();
  }

  async clickOnSave() {
    await this.page.getByRole('button', { name: 'Save survey' }).click();
  }
}
