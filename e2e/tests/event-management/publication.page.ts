import type { Locator, Page } from '@playwright/test';
import { PageObject } from '../../page-object.ts';

export class PublicationPage extends PageObject {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Publication', exact: true });
  }

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/publication`);
    await this.waitFor();
  }

  async waitFor() {
    await this.waitForHydration();
    await this.heading.waitFor();
  }

  dashboardCard(title: string) {
    return this.page.getByLabel(title, { exact: true });
  }

  async clickOnPublish(title: string, type: 'Accepted' | 'Rejected') {
    await this.dashboardCard(title)
      .getByRole('button', { name: `Publish all "${type}"` })
      .click();
    return new PublicationModal(this.page);
  }
}

class PublicationModal extends PageObject {
  clickOnConfirm() {
    return this.page.getByRole('button', { name: 'Confirm results publication' }).click();
  }
}
