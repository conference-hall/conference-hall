import type { Locator, Page } from '@playwright/test';

export class UserMenuComponent {
  readonly page: Page;
  readonly openButton: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.openButton = this.page.getByRole('button', { name: 'Open user menu' });
    this.signOutButton = this.page.getByRole('button', { name: 'Sign out' });
  }

  async waitFor() {
    await this.openButton.waitFor();
  }

  async waitForDialogOpen(email: string) {
    await this.page.getByRole('dialog').getByText(email).waitFor();
  }
}
