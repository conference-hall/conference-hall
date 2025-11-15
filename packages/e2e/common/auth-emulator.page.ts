import type { Page } from '@playwright/test';

export class AuthEmulator {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitFor(provider: string) {
    const heading = this.page.getByText(`Sign-in with ${provider}.com`);
    await heading.waitFor();
  }

  async selectAccount(username: string) {
    await this.page.getByText(username).click({ delay: 200 });
  }

  async newAccount(email: string, fullname: string) {
    await this.page.getByText('Add new account').click();
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Display name').fill(fullname);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}
