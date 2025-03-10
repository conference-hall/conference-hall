import type { Locator } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

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
    await this.heading.waitFor();
  }

  async signInWithGoogle(username: string) {
    await this.page.getByRole('button', { name: 'Google' }).click();
    await this.page.getByText('Please select an existing account in the Auth Emulator or add a new one:').waitFor();
    await this.page.getByText(username).click({ delay: 200 });
  }
}

export class ForgotPasswordPage extends PageObject {
  readonly heading: Locator = this.page.getByRole('heading', { name: 'Forgot your password?' });
  readonly emailInput: Locator = this.page.getByLabel('Email address');
  readonly sendResetEmailButton: Locator = this.page.getByRole('button', { name: 'Send reset password email' });
  readonly emailSentHeading: Locator = this.page.getByRole('heading', { name: 'Password reset email sent!' });

  async goto() {
    await this.page.goto('/auth/forgot-password');
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }
}
