import type { Locator, Page } from '@playwright/test';
import { expect } from 'e2e/fixtures.ts';
import { PageObject } from 'e2e/page-object.ts';

export class MessageBlockComponent extends PageObject {
  readonly component: Locator;

  constructor(messageBlock: Locator, page: Page) {
    super(page);
    this.component = messageBlock;
  }

  async openActionsMenu() {
    await this.component.getByRole('button', { name: 'Message action menu' }).click();
  }

  async clickEdit() {
    await this.openActionsMenu();
    await this.page.getByRole('menuitem', { name: 'Edit' }).click();
    return this.component.getByRole('textbox');
  }

  async clickDelete() {
    this.page.on('dialog', (dialog) => dialog.accept());
    await this.openActionsMenu();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
  }

  async editMessage(newContent: string) {
    const input = await this.clickEdit();
    await input.clear();
    await input.fill(newContent);
    await this.component.getByRole('button', { name: 'Save' }).click();
    await expect(input).not.toBeVisible();
  }
}
