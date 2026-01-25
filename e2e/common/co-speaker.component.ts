import type { Locator, Page } from '@playwright/test';
import { PageObject } from '../page-object.ts';

export class CoSpeakerComponent extends PageObject {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Speaker information panel' });
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async clickOnRemoveSpeaker(name: string) {
    await this.page.getByRole('button', { name: `Remove "${name}" from the talk` }).click();
  }
}
