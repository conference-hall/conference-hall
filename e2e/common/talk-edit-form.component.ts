import type { Locator, Page } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';
import type { MultiSelectComponent } from './multi-select.component.ts';

export class TalkEditFormComponent extends PageObject {
  readonly titleInput: Locator;
  readonly abstractInput: Locator;
  readonly referencesInput: Locator;
  readonly languageSelect: MultiSelectComponent;

  constructor(page: Page, isEdit = false) {
    super(page);

    const parent = isEdit ? page.getByRole('dialog') : page;
    this.titleInput = parent.getByLabel('Title');
    this.abstractInput = parent.getByLabel('Abstract');
    this.referencesInput = parent.getByLabel('References');
    this.languageSelect = this.multiSelectInput('Languages');
  }

  async waitFor() {
    await this.titleInput.waitFor();
  }

  async fillForm(title: string, abstract: string, level: string, language: string, references: string) {
    await this.titleInput.fill(title);
    await this.abstractInput.fill(abstract);
    await this.radioInput(level).click();
    await this.languageSelect.select([language]);
    await this.referencesInput.fill(references);
  }

  async save() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }
}
