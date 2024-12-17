import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class TalkPage extends PageObject {
  readonly heading: Locator;
  readonly speakers: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Talk page' });
    this.speakers = page.getByRole('list', { name: 'Speakers' });
  }

  async goto(talkId: string) {
    await this.page.goto(`/speaker/talks/${talkId}`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async clickOnReferences() {
    await this.page.getByText('Talk references').click();
  }
}
