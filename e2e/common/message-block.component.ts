import type { Locator, Page } from '@playwright/test';
import { expect } from 'e2e/fixtures.ts';
import { PageObject } from 'e2e/page-object.ts';

export class MessageBlockComponent extends PageObject {
  readonly component: Locator;
  readonly actionsMenu = this.page.getByRole('menu', { name: 'Message action menu' });

  constructor(messageBlock: Locator, page: Page) {
    super(page);
    this.component = messageBlock;
  }

  async openActionsMenu() {
    const menuButton = this.component.getByRole('button', { name: 'Message action menu' });
    await menuButton.click({ force: true });
    await this.actionsMenu.waitFor({ state: 'visible' });
  }

  async clickEdit() {
    await this.openActionsMenu();
    const editButton = this.actionsMenu.getByRole('menuitem', { name: 'Edit' });
    await expect(editButton).toBeVisible();
    await editButton.click({ force: true });
    return this.component.getByRole('textbox');
  }

  async clickDelete() {
    this.page.on('dialog', (dialog) => dialog.accept());
    await this.openActionsMenu();
    const deleteButton = this.actionsMenu.getByRole('menuitem', { name: 'Delete' });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click({ force: true });
  }

  async editMessage(newContent: string) {
    const input = await this.clickEdit();
    await expect(input).toBeVisible();
    await input.fill('');
    await input.fill(newContent);
    await this.component.getByRole('button', { name: 'Save' }).click();
    await expect(input).not.toBeVisible();
  }
}
