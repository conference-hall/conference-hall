import type { Locator } from '@playwright/test';
import { PageObject } from '../../page-object.ts';

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
    await this.waitForHydration();
    await this.heading.waitFor();
  }
}

export class ResetPasswordPage extends PageObject {
  readonly heading: Locator = this.page.getByRole('heading', { name: 'Change your password' });
  readonly passwordInput: Locator = this.page.getByLabel('Password');
  readonly resetPasswordButton: Locator = this.page.getByRole('button', { name: 'Change your password' });

  async goto() {
    await this.page.goto('/auth/reset-password');
    await this.waitFor();
  }

  async waitFor() {
    await this.waitForHydration();
    await this.heading.waitFor();
  }
}
