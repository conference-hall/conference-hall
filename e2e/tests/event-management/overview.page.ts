import type { Locator } from '@playwright/test';
import { PageObject } from 'e2e/page-object.ts';

export class OverviewPage extends PageObject {
  readonly heading: Locator = this.page.getByRole('heading', { name: 'Event overview' });
  readonly callForPaperTab: Locator = this.page.getByRole('link', { name: 'Call for papers' });
  readonly reviewersTab: Locator = this.page.getByRole('link', { name: 'Reviewers' });
  readonly reviewersList: Locator = this.page.getByRole('list', { name: 'Reviewers' });
  readonly commandPaletteButton: Locator = this.page.getByLabel('Search in the event');
  readonly commandPaletteDialog: Locator = this.page.getByRole('dialog', { name: 'Search in the event' });
  readonly commandPaletteInput: Locator = this.commandPaletteDialog.getByRole('combobox');
  readonly commandPaletteResults: Locator = this.commandPaletteDialog.getByRole('listbox');

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }

  dashboardCard(title: string) {
    return this.page.getByLabel(title, { exact: true });
  }

  dashboardCardLink(title: string, link: string) {
    return this.dashboardCard(title).getByRole('link', { name: link });
  }

  async openCommandPalette() {
    await this.commandPaletteButton.click();
    await this.commandPaletteInput.waitFor();
  }

  async searchInCommandPalette(query: string) {
    await this.commandPaletteInput.fill(query);
    await this.commandPaletteResults.waitFor();
  }

  async clickCommandPaletteResult(text: string) {
    await this.commandPaletteResults.getByText(text).click();
  }
}
