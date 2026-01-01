import type { Locator } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class AdminPage extends PageObject {
  readonly dashboardHeading: Locator = this.page.getByRole('heading', { name: 'Dashboard', exact: true });
  readonly usersHeading: Locator = this.page.getByRole('heading', { name: 'Users', exact: true });
  readonly teamsHeading: Locator = this.page.getByRole('heading', { name: 'Teams', exact: true });
  readonly featureFlagsHeading: Locator = this.page.getByRole('heading', { name: 'Feature flags', exact: true });
  readonly debugHeading: Locator = this.page.getByRole('heading', { name: 'Debug', exact: true });

  async gotoDashboard() {
    await this.page.goto('/admin');
    await this.waitForHydration();
  }

  async gotoUsers() {
    await this.page.goto('/admin/users');
    await this.waitForHydration();
  }

  async gotoTeams() {
    await this.page.goto('/admin/teams');
    await this.waitForHydration();
  }

  async gotoFeatureFlags() {
    await this.page.goto('/admin/flags');
    await this.waitForHydration();
  }

  async gotoDebug() {
    await this.page.goto('/admin/debug');
    await this.waitForHydration();
  }
}
