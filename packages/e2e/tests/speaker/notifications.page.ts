import type { Locator, Page } from '@playwright/test';
import { PageObject } from '../../helpers/page-object.ts';
import { ProposalPage } from '../event-participation/proposal.page.ts';

export class NotificationsPage extends PageObject {
  readonly heading: Locator;
  readonly notifications: Locator;
  readonly noNotifications: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Notifications' });
    this.notifications = page.getByRole('list', { name: 'Notifications list' }).locator('>li');
    this.noNotifications = page.getByText('No notifications');
  }

  async goto() {
    await this.page.goto('/notifications');
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async clickOnNotification(name: string) {
    await this.notifications.getByRole('link', { name }).click();
    return new ProposalPage(this.page);
  }
}
