import type { FrameLocator, Locator } from '@playwright/test';
import { PageObject } from '../helpers/page-object.ts';

export const MAILBOX_URL = 'http://127.0.0.1:8025';

export class MailBox extends PageObject {
  readonly heading: Locator = this.page.getByRole('link', { name: 'Mailpit' });
  readonly emailContent: FrameLocator = this.page.locator('#preview-html').contentFrame();

  async goto() {
    await this.page.goto(MAILBOX_URL);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async waitForEmail(subject: string) {
    const email = this.page.locator('#message-page').getByRole('link', { name: subject }).first();
    await email.waitFor();
    await email.click();

    const emailContent = this.page.getByRole('cell', { name: subject });
    await emailContent.waitFor();
  }
}
