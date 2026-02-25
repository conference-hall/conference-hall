import type { Locator } from '@playwright/test';
import { href } from 'react-router';
import { PageObject } from '../../page-object.ts';

export class SettingsAccountPage extends PageObject {
  readonly heading: Locator = this.page.getByRole('heading', { name: 'Email and password' });
  readonly authMethods: Locator = this.page.getByRole('list', { name: 'Authentication methods list' }).last();

  readonly emailEditButton: Locator = this.page
    .getByRole('listitem')
    .filter({ hasText: '@' })
    .getByRole('button', { name: 'Edit' });
  readonly passwordEditButton: Locator = this.page
    .getByRole('listitem')
    .filter({ hasText: '••••••••' })
    .getByRole('button', { name: 'Edit' });
  readonly passwordAddButton: Locator = this.page
    .getByRole('listitem')
    .filter({ hasText: 'No password set' })
    .getByRole('button', { name: 'Add' });

  async goto() {
    await this.page.goto(href('/speaker/settings'));
    await this.waitFor();
  }

  async waitFor() {
    await this.waitForHydration();
    await this.heading.waitFor();
  }

  authMethod(provider: string) {
    return this.authMethods.getByRole('listitem').filter({ hasText: provider });
  }

  linkButton(provider: string) {
    return this.authMethod(provider).getByRole('button', { name: 'Add', exact: true });
  }
}
