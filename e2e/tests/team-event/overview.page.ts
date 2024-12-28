import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class OverviewPage extends PageObject {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Event overview' });
  }

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  dashboardCard(title: string) {
    return this.page.getByLabel(title, { exact: true });
  }

  dashboardCardLink(title: string, link: string) {
    return this.dashboardCard(title).getByRole('link', { name: link });
  }
}
