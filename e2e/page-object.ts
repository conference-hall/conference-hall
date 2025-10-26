import type { Locator, Page } from '@playwright/test';
import { AuthEmulator } from './common/auth-emulator.page.ts';
import { MultiSelectComponent } from './common/multi-select.component.ts';
import { UserMenuComponent } from './common/user-menu.component.ts';

export class PageObject {
  readonly page: Page;
  readonly toast: Locator;
  readonly forbiddenPage: Locator;
  readonly loginLink: Locator;
  readonly userMenu: UserMenuComponent;
  readonly authEmulator: AuthEmulator;

  constructor(page: Page) {
    this.page = page;
    this.toast = page.getByLabel('Notifications').locator('[data-sonner-toast]').first();
    this.forbiddenPage = page.getByRole('heading', { name: 'Forbidden action', exact: true });
    this.loginLink = this.page.getByRole('link', { name: 'Login' });
    this.userMenu = new UserMenuComponent(page);
    this.authEmulator = new AuthEmulator(page);
  }

  async closeModal() {
    await this.page.getByRole('button', { name: 'Close' }).click();
  }

  async fill(input: Locator, value: string) {
    await input.scrollIntoViewIfNeeded();
    await input.focus();
    await input.clear();
    await input.fill(value);
  }

  async getInputDescription(input: Locator) {
    const subjectDescriptionId = await input.getAttribute('aria-describedby');
    return this.page.locator(`id=${subjectDescriptionId}`);
  }

  radioInput(name: string) {
    return this.page.getByRole('radio', { name });
  }

  checkboxInput(name: string) {
    return this.page.getByRole('checkbox', { name });
  }

  multiSelectInput(name: string) {
    return new MultiSelectComponent(name, this.page);
  }

  async waitForCaptcha() {
    await this.page.waitForFunction(
      () => {
        const response = document.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]');
        return response?.value?.length && response?.value?.length > 0;
      },
      { timeout: 30000 },
    );
  }
}
