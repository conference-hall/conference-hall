import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class CoSpeakerComponent extends PageObject {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByText('Biography'); // TODO: Add a title for the modal
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async clickOnRemoveSpeaker(name: string) {
    await this.page.getByRole('button', { name: `Remove "${name}" from the talk` }).click();
  }
}
