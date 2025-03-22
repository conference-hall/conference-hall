import type { Locator } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import { href } from 'react-router';

export class SettingsAccountPage extends PageObject {
  readonly heading: Locator = this.page.getByRole('heading', { name: 'Security' });
  readonly emailInput: Locator = this.page.getByLabel('Email address');
  readonly saveContactEmail: Locator = this.page.getByRole('button', { name: 'Save contact email' });
  readonly authMethods: Locator = this.page.getByRole('list', { name: 'Authentication methods list' });

  async goto() {
    await this.page.goto(href('/speaker/settings'));
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  authMethod(provider: string) {
    return this.authMethods.getByRole('listitem').filter({ hasText: provider });
  }

  linkedButton(provider: string) {
    return this.authMethod(provider).getByRole('button', { name: 'Account linked', exact: true });
  }

  linkButton(provider: string) {
    return this.authMethod(provider).getByRole('button', { name: 'Link account', exact: true });
  }

  unlinkButton(provider: string) {
    return this.authMethod(provider).getByRole('button', { name: 'Unlink account', exact: true });
  }

  changePasswordButton() {
    return this.page.getByRole('button', { name: 'Change password' });
  }

  verifyEmailButton() {
    return this.page.getByRole('button', { name: 'Send verification email' });
  }

  emailSent() {
    return this.page.getByRole('button', { name: 'Email sent' });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByRole('heading', { name: 'Change your password' }).waitFor();
    await dialog.getByLabel('Current password').fill(currentPassword);
    await dialog.getByLabel('New password').fill(newPassword);
    await dialog.getByRole('button', { name: 'Change password' }).click();
  }

  async linkEmailProvider(email: string, password: string) {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByRole('heading', { name: 'Link with email & password' }).waitFor();
    await dialog.getByPlaceholder('example@site.com').fill(email);
    await dialog.getByLabel('Password', { exact: true }).fill(password);
    await dialog.getByRole('button', { name: 'Link account' }).click();
  }

  async emailVerificationSent() {
    await this.page.getByRole('heading', { name: 'Email verification' }).waitFor();
  }
}
