import type { Locator } from '@playwright/test';
import { PageObject } from '../../page-object.ts';

export class LoginPage extends PageObject {
  readonly heading: Locator = this.page.getByRole('heading', { name: 'Sign in to your account' });
  readonly emailInput: Locator = this.page.getByLabel('Email address');
  readonly passwordInput: Locator = this.page.getByLabel('Password');
  readonly signinButton: Locator = this.page.getByRole('button', { name: 'Sign in' });
  readonly signupLink: Locator = this.page.getByRole('link', { name: 'Create your account' });
  readonly forgotPasswordLink: Locator = this.page.getByRole('link', { name: 'Forgot password?' });

  async goto() {
    await this.page.goto('/auth/login');
    await this.waitFor();
  }

  async waitFor() {
    await this.waitForHydration();
    await this.heading.waitFor();
  }

  async signInWithPassword(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signinButton.click();
  }
}
