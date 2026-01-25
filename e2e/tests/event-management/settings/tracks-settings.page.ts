import { PageObject } from '../../../page-object.ts';

export class TracksSettingsPage extends PageObject {
  readonly heading = this.page.getByRole('heading', { name: 'Formats' });
  readonly nameInput = this.page.getByLabel('Name');
  readonly descriptionInput = this.page.getByLabel('Description');

  readonly saveFormatButton = this.page.getByRole('button', { name: 'Save format' });
  readonly newFormatButton = this.page.getByRole('button', { name: 'New format' });
  readonly formatModal = this.page.getByRole('heading', { name: 'Format track' });
  readonly formatsRequiredSwitch = this.page.getByRole('switch', { name: 'Format selection required' });
  readonly formatsAllowMultipleSwitch = this.page.getByRole('switch', { name: 'Allow multiple formats' });
  readonly formatsList = this.page.getByRole('list', { name: 'formats list' }).locator('>li');

  readonly saveCategoryButton = this.page.getByRole('button', { name: 'Save category' });
  readonly newCategoryButton = this.page.getByRole('button', { name: 'New category' });
  readonly categoryModal = this.page.getByRole('heading', { name: 'Category track' });
  readonly categoriesRequiredSwitch = this.page.getByRole('switch', { name: 'Category selection required' });
  readonly categoriesAllowMultipleSwitch = this.page.getByRole('switch', { name: 'Allow multiple categories' });
  readonly categoriesList = this.page.getByRole('list', { name: 'categories list' }).locator('>li');

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/settings/tracks`);
    await this.waitFor();
  }

  async waitFor() {
    await this.waitForHydration();
    await this.heading.waitFor();
  }
}
