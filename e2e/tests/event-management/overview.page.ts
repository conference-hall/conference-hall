import type { Locator } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class OverviewPage extends PageObject {
  readonly heading: Locator = this.page.getByRole('heading', { name: 'Event overview' });
  readonly callForPaperTab: Locator = this.page.getByRole('link', { name: 'Call for paper' });
  readonly reviewersTab: Locator = this.page.getByRole('link', { name: 'Reviewers' });
  readonly reviewersList: Locator = this.page.getByRole('list', { name: 'Reviewers' });

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}`);
    await this.waitFor();
  }

  async waitFor() {
    await this.page.waitForLoadState('networkidle');
    await this.heading.waitFor();
  }

  dashboardCard(title: string) {
    return this.page.getByLabel(title, { exact: true });
  }

  dashboardCardLink(title: string, link: string) {
    return this.dashboardCard(title).getByRole('link', { name: link });
  }
}
