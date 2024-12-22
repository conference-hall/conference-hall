import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class LoginPage extends PageObject {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Sign in to your account' });
  }

  async goto() {
    await this.page.goto('/auth/login');
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async signInWithGoogle(username: string) {
    await this.page.getByRole('button', { name: 'Google' }).click();
    await this.page.getByText('Please select an existing account in the Auth Emulator or add a new one:').waitFor();
    await this.page.getByText(username).click({ delay: 200 });
  }
}
