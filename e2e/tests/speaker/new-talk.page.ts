import type { Locator, Page } from '@playwright/test';
import { TalkEditFormComponent } from 'e2e/common/talk-edit-form.component.ts';
import { PageObject } from 'e2e/page-object.ts';
import { TalkPage } from './talk.page.ts';

export class NewTalkPage extends PageObject {
  readonly heading: Locator;
  readonly talkForm: TalkEditFormComponent;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Create a new talk' });
    this.talkForm = new TalkEditFormComponent(page);
  }

  async goto() {
    await this.page.goto('/speaker/talks/new');
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  async fillForm(title: string, abstract: string, level: string, language: string, references: string) {
    await this.talkForm.fillForm(title, abstract, level, language, references);
    await this.page.getByRole('button', { name: 'Create new talk' }).click();
    return new TalkPage(this.page);
  }
}
