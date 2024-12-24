import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import { TalkPage } from './talk.page.ts';

export class TalkInvitePage extends PageObject {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Talk invitation.' });
  }

  async goto(code: string) {
    await this.page.goto(`/invite/talk/${code}`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async clickOnAcceptInvite() {
    await this.page.getByRole('button', { name: 'Accept invitation' }).click();
    return new TalkPage(this.page);
  }
}
