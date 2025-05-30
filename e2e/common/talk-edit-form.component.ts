import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class TalkEditFormComponent extends PageObject {
  readonly titleInput: Locator;
  readonly abstractInput: Locator;
  readonly languageSelect: Locator;
  readonly referencesInput: Locator;

  constructor(page: Page, isEdit = false) {
    super(page);

    const component = isEdit ? page.getByRole('dialog') : page;
    this.titleInput = component.getByLabel('Title');
    this.abstractInput = component.getByLabel('Abstract');
    this.languageSelect = component.getByLabel('Languages');
    this.referencesInput = component.getByLabel('References');
  }

  async waitFor() {
    await this.titleInput.waitFor();
  }

  async fillForm(title: string, abstract: string, level: string, language: string, references: string) {
    await this.titleInput.fill(title);
    await this.abstractInput.fill(abstract);
    await this.radioInput(level).click();
    await this.selectOptions(this.languageSelect, [language]);
    await this.referencesInput.fill(references);
  }

  async save() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }
}
