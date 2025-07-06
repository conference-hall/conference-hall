import type { Locator } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class SignupPage extends PageObject {
  readonly heading: Locator = this.page.getByRole('heading', { name: 'Create your account' });
  readonly fullnameInput: Locator = this.page.getByLabel('Full name');
  readonly emailInput: Locator = this.page.getByLabel('Email address');
  readonly passwordInput: Locator = this.page.getByLabel('Password');
  readonly signupButton: Locator = this.page.getByRole('button', { name: 'Create your account' });
  readonly signinLink: Locator = this.page.getByRole('link', { name: 'Sign in' });

  async goto() {
    await this.page.goto('/auth/signup');
    await this.waitFor();
  }

  async waitFor() {
    await this.page.waitForLoadState('networkidle');
    await this.heading.waitFor();
  }

  async emailVerificationSent() {
    await this.page.waitForLoadState('networkidle');
    await this.page.getByRole('heading', { name: 'Email verification' }).waitFor();
  }
}
